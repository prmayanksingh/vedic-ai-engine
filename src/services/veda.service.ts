import path from "node:path";
import fs from "node:fs";
import vedicVerseModel from "../models/vedicVerse.model.js";


const EMBED_BASE_URL = process.env.EMBED_BASE_URL;
const EMBED_API_KEY = process.env.EMBED_API_KEY;
const EMBED_MODEL = process.env.EMBED_MODEL;

export class VedaService {

    private static async getEmbedding(text: string): Promise<number[]> {
        const response = await fetch(`${EMBED_BASE_URL}/embeddings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${EMBED_API_KEY}`,
            },
            body: JSON.stringify({
                model: EMBED_MODEL,
                input: text,
                dimensions: 768
            }),
        });

        if (!response.ok) {
            throw new Error(`Embedding failed (${response.status}): ${await response.text()}`);
        }

        const json = (await response.json()) as {
            data: Array<{ embedding: number[] }>
        }

        return json.data[0].embedding;
    }

    static async initData(): Promise<void> {
        const existingCount = await vedicVerseModel.countDocuments();
        if (existingCount > 0) return;

        const dataPath = path.resolve("data/vedas.json");
        const raw = fs.readFileSync(dataPath, "utf-8");
        const verses = JSON.parse(raw);

        const docsToInsert = [];
        for (const v of verses) {
            const serchableText = `${v.veda} Mandala ${v.mandala} Sukta ${v.sukta} Verse ${v.verse} (${v.deity}): ${v.translation} ${v.meaning || ""}`;
            const embedding = await this.getEmbedding(serchableText);
            docsToInsert.push({ ...v, serchableText, embedding });
        }

        await vedicVerseModel.insertMany(docsToInsert);
        console.log(`Seeded ${docsToInsert.length} Vedic verses into MongoDB Atlas.`);
    }

    static async searchVerses(query: string, limit = 3) {
        const queryVector = await this.getEmbedding(query);

        return vedicVerseModel.aggregate([
            {
                $vectorSearch: {
                    index: "vedic_vector_index",
                    path: "embedding",
                    queryVector,
                    numCandidates: 30,
                    limit
                },
            },
            {
                $project: {
                    _id: 0,
                    veda: 1,
                    mandala: 1,
                    sukta: 1,
                    verse: 1,
                    deity: 1,
                    sanskrit: 1,
                    translation: 1,
                    meaning: 1,
                    score: { $meta: "vectorSearchScore" }
                },
            },
        ]);
    }

}