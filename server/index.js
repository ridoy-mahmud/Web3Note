import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dns from "node:dns";
import { MongoClient, ServerApiVersion } from "mongodb";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const port = Number(process.env.NOTES_API_PORT || 8787);
const mongoUri = process.env.MONGODB_URI;
const mongoUriDirect = process.env.MONGODB_URI_DIRECT;
const dnsServers = (process.env.DNS_SERVERS || "8.8.8.8,1.1.1.1")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const databaseName = process.env.MONGODB_DATABASE || "aether_notes";
const collectionName = process.env.MONGODB_NOTES_COLLECTION || "user_states";
const supabaseUrl = process.env.VITE_SUPABASE_URL?.replace(/"/g, "");
const supabasePublishableKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.replace(/"/g, "");

if (!mongoUri) {
  console.error("Missing MONGODB_URI in environment.");
  process.exit(1);
}

const createClient = (uri) =>
  new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

const deriveDirectUriFromSrv = (uri) => {
  if (!uri || !uri.startsWith("mongodb+srv://")) return null;
  try {
    const parsed = new URL(uri);
    const host = parsed.hostname;
    const username = parsed.username;
    const password = parsed.password;

    const q = new URLSearchParams(parsed.search);
    if (!q.has("tls")) q.set("tls", "true");
    if (!q.has("authSource")) q.set("authSource", "admin");
    if (!q.has("retryWrites")) q.set("retryWrites", "true");
    if (!q.has("w")) q.set("w", "majority");

    const credentials =
      username || password
        ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`
        : "";

    return `mongodb://${credentials}${host}:27017/${parsed.pathname.replace(/^\//, "")}?${q.toString()}`;
  } catch {
    return null;
  }
};

const mongoUriDerivedDirect = deriveDirectUriFromSrv(mongoUri);

if (dnsServers.length > 0) {
  try {
    dns.setServers(dnsServers);
  } catch {
    // ignore DNS override failures and continue with system DNS
  }
}

let activeUriLabel = mongoUriDirect ? "MONGODB_URI_DIRECT" : "MONGODB_URI";
let client = createClient(mongoUriDirect || mongoUri);
let connected = false;
let connectingPromise = null;
let lastConnectionError = null;

const isSrvDnsError = (error) => {
  const code = error && typeof error === "object" ? error.code : undefined;
  const message = String(error || "");
  return (
    code === "ECONNREFUSED" ||
    message.includes("querySrv") ||
    message.includes("ENOTFOUND")
  );
};

async function connectWithCurrentClient() {
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  connected = true;
  lastConnectionError = null;
}

async function ensureConnected() {
  if (connected) return;
  if (connectingPromise) {
    await connectingPromise;
    return;
  }

  connectingPromise = (async () => {
    try {
      await connectWithCurrentClient();
    } catch (error) {
      lastConnectionError = error;

      if (
        isSrvDnsError(error) &&
        mongoUriDirect &&
        activeUriLabel !== "MONGODB_URI_DIRECT"
      ) {
        try {
          await client.close();
        } catch {
          // ignore close errors while switching client
        }

        activeUriLabel = "MONGODB_URI_DIRECT";
        client = createClient(mongoUriDirect);
        await connectWithCurrentClient();
        return;
      }

      if (
        isSrvDnsError(error) &&
        mongoUriDerivedDirect &&
        activeUriLabel !== "MONGODB_URI_DERIVED_DIRECT"
      ) {
        try {
          await client.close();
        } catch {
          // ignore close errors while switching client
        }

        activeUriLabel = "MONGODB_URI_DERIVED_DIRECT";
        client = createClient(mongoUriDerivedDirect);
        await connectWithCurrentClient();
        return;
      }

      throw error;
    }
  })();

  try {
    await connectingPromise;
  } finally {
    connectingPromise = null;
  }
}

async function getCollection() {
  await ensureConnected();
  return client.db(databaseName).collection(collectionName);
}

app.get("/api/health", async (_req, res) => {
  try {
    await ensureConnected();
    res.json({ ok: true, source: activeUriLabel });
  } catch (error) {
    res.status(503).json({
      ok: false,
      message: String(error),
      hint: "MongoDB connection failed. Check Atlas Network Access and DNS SRV support, or set MONGODB_URI_DIRECT.",
      source: activeUriLabel,
    });
  }
});

app.get("/api/health/deps", async (_req, res) => {
  const report = {
    mongo: {
      ok: false,
      source: activeUriLabel,
      error: null,
    },
    supabase: {
      ok: false,
      urlConfigured: Boolean(supabaseUrl),
      keyConfigured: Boolean(supabasePublishableKey),
      statusCode: null,
      error: null,
    },
  };

  try {
    await ensureConnected();
    report.mongo.ok = true;
  } catch (error) {
    report.mongo.error = String(error);
  }

  if (supabaseUrl && supabasePublishableKey) {
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
        headers: {
          apikey: supabasePublishableKey,
          Authorization: `Bearer ${supabasePublishableKey}`,
        },
      });
      report.supabase.statusCode = response.status;
      report.supabase.ok = response.ok;
    } catch (error) {
      report.supabase.error = String(error);
    }
  }

  const status = report.mongo.ok && report.supabase.ok ? 200 : 503;
  res.status(status).json(report);
});

app.get("/api/state/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;
    const collection = await getCollection();
    const doc = await collection.findOne({ ownerId });

    if (!doc) {
      res.status(404).json({ state: null });
      return;
    }

    res.json({ state: doc.state ?? null });
  } catch (error) {
    res.status(503).json({ message: String(error) });
  }
});

app.put("/api/state/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { state } = req.body ?? {};

    if (!state || typeof state !== "object") {
      res.status(400).json({ message: "Invalid state payload." });
      return;
    }

    const collection = await getCollection();
    await collection.updateOne(
      { ownerId },
      {
        $set: {
          ownerId,
          state,
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    );

    res.json({ ok: true });
  } catch (error) {
    res.status(503).json({ message: String(error) });
  }
});

app.listen(port, () => {
  console.log(`Notes API running on http://localhost:${port}`);

  ensureConnected()
    .then(() => {
      console.log(`MongoDB connected successfully using ${activeUriLabel}.`);
    })
    .catch((error) => {
      console.error("Initial MongoDB connection failed:", error);
      if (!mongoUriDirect) {
        console.error(
          "Tip: set MONGODB_URI_DIRECT in .env as a fallback non-SRV connection string if your DNS blocks SRV lookups.",
        );
      }
      if (mongoUriDerivedDirect) {
        console.error(
          "Tried an auto-derived non-SRV URI fallback but it could not connect. Prefer a full Standard connection string from Atlas in MONGODB_URI_DIRECT.",
        );
      }
    });
});

process.on("SIGINT", async () => {
  try {
    await client.close();
  } finally {
    process.exit(0);
  }
});
