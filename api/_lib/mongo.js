import { MongoClient, ServerApiVersion } from "mongodb";

const mongoUri = process.env.MONGODB_URI;
const mongoUriDirect = process.env.MONGODB_URI_DIRECT;
const databaseName = process.env.MONGODB_DATABASE || "aether_notes";
const collectionName = process.env.MONGODB_NOTES_COLLECTION || "user_states";

if (!mongoUri && !mongoUriDirect) {
  throw new Error("Missing MONGODB_URI or MONGODB_URI_DIRECT env var.");
}

const targetUri = mongoUriDirect || mongoUri;
const client = new MongoClient(targetUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let connectionPromise;

export async function getNotesCollection() {
  if (!connectionPromise) {
    connectionPromise = client.connect();
  }
  await connectionPromise;
  return client.db(databaseName).collection(collectionName);
}

export async function pingMongo() {
  if (!connectionPromise) {
    connectionPromise = client.connect();
  }
  await connectionPromise;
  await client.db("admin").command({ ping: 1 });
  return {
    ok: true,
    source: mongoUriDirect ? "MONGODB_URI_DIRECT" : "MONGODB_URI",
  };
}
