import { pingMongo } from "../_lib/mongo.js";

export default async function handler(_req, res) {
  try {
    const mongo = await pingMongo();
    res.status(200).json({ ok: true, mongo });
  } catch (error) {
    res.status(503).json({ ok: false, message: String(error) });
  }
}
