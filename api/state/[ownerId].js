import { getNotesCollection } from "../_lib/mongo.js";

export default async function handler(req, res) {
  const ownerId = req.query.ownerId;

  if (!ownerId || typeof ownerId !== "string") {
    res.status(400).json({ message: "ownerId is required." });
    return;
  }

  try {
    const collection = await getNotesCollection();

    if (req.method === "GET") {
      const doc = await collection.findOne({ ownerId });
      if (!doc) {
        res.status(404).json({ state: null });
        return;
      }
      res.status(200).json({ state: doc.state ?? null });
      return;
    }

    if (req.method === "PUT") {
      const { state } = req.body ?? {};
      if (!state || typeof state !== "object") {
        res.status(400).json({ message: "Invalid state payload." });
        return;
      }

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

      res.status(200).json({ ok: true });
      return;
    }

    res.setHeader("Allow", "GET, PUT");
    res.status(405).json({ message: "Method not allowed." });
  } catch (error) {
    res.status(503).json({ message: String(error) });
  }
}
