import path from "node:path";
import fs from "node:fs";
import vedicVerseModel from "../models/vedicVerse.model.js";


const EMBED_BASE_URL = process.env.EMBED_BASE_URL;
const EMBED_API_KEY = process.env.EMBED_API_KEY;
const EMBED_MODEL = process.env.EMBED_MODEL;

export class VedaService {
    private static async getEmbeddingsBatch(texts: string[]): Promise<number[][]> {
        const response = await fetch(`${EMBED_BASE_URL}/embeddings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${EMBED_API_KEY}`,
            },
            body: JSON.stringify({
                model: EMBED_MODEL,
                input: texts,
                dimensions: 768,
            }),
        });

        if (!response.ok) {
            throw new Error(`Embedding failed (${response.status}): ${await response.text()}`);
        }

        const json = (await response.json()) as {
            data: Array<{ index: number; embedding: number[] }>;
        };

        // the sorting like just like sort(a-b) but it sorted on the basis of index feild
        return json.data.sort((a, b) => a.index - b.index).map((item) => item.embedding);
    }

    static async initData(): Promise<void> {
        const existingCount = await vedicVerseModel.countDocuments();
        if (existingCount > 0) return;

        const rawDocs: Array<{
            veda: string;
            mandala: number;
            sukta: number;
            verse: number;
            deity: string;
            sanskrit: string;
            translation: string;
            meaning: string;
            searchableText: string;
        }> = [];

        // 1. Parse Bhagavad Gita (data/gita.json) - Chapter 2 (72 verses)
        const gitaPath = path.resolve("data/gita_all_verses.json");
        if (fs.existsSync(gitaPath)) {
            const rawGita = JSON.parse(fs.readFileSync(gitaPath, "utf-8"));
            const gitaList = Array.isArray(rawGita) ? rawGita : Object.values(rawGita);

            for (const item of (gitaList as any[]).filter((v) => Number(v.chapter) === 2).slice(0, 40)) {
                const translation = item.siva?.et || item.prabhu?.et || item.gambir?.et || "";
                const hindiMeaning = item.tej?.ht || "";
                if (!translation) continue;

                const chapter = Number(item.chapter);
                const verse = Number(item.verse);

                rawDocs.push({
                    veda: "Bhagavad Gita",
                    mandala: chapter,
                    sukta: 1,
                    verse,
                    deity: "Lord Krishna",
                    sanskrit: item.slok || "",
                    translation,
                    meaning: hindiMeaning,
                    searchableText: `Bhagavad Gita Chapter ${chapter} Verse ${verse}: ${translation} ${hindiMeaning}`,
                });
            }
        }

        // 2. Parse Rigveda (data/complete_rigveda_all_mandalas.json) - Mandala 1 (first 60 Riks)
        const rigvedaPath = path.resolve("data/complete_rigveda_all_mandalas.json");
        if (fs.existsSync(rigvedaPath)) {
            const rawVeda = JSON.parse(fs.readFileSync(rigvedaPath, "utf-8"));
            const mandala1Obj = rawVeda?.["Mandala 1"] || rawVeda?.root?.["Mandala 1"] || {};

            let count = 0;
            for (const [suktaKey, riks] of Object.entries(mandala1Obj)) {
                if (count >= 60) break;
                const suktaNum = Number(suktaKey.replace(/\D/g, "")) || 1;

                for (const item of riks as any[]) {
                    if (count >= 60) break;
                    const translation = (item.translation || "").replace(/[“”]/g, "").trim();
                    if (!translation) continue;

                    const verseNum = Number(item.rik_number || 1);
                    const sanskritText =
                        item.samhita?.devanagari?.text || item.sanskrit_wisdomlib || "";
                    const deity = suktaNum === 1 ? "Agni" : "Vedic Deity";

                    rawDocs.push({
                        veda: "Rigveda",
                        mandala: 1,
                        sukta: suktaNum,
                        verse: verseNum,
                        deity,
                        sanskrit: sanskritText,
                        translation,
                        meaning: item.padapatha?.transliteration?.text || "",
                        searchableText: `Rigveda Mandala 1 Sukta ${suktaNum} Verse ${verseNum} (${deity}): ${translation}`,
                    });
                    count++;
                }
            }
        }

        if (rawDocs.length === 0) {
            console.warn("No scripture JSON files found in data/ to seed.");
            return;
        }

        // Batch-embed in chunks of 50 to avoid rate limits
        const docsToInsert = [];
        for (let i = 0; i < rawDocs.length; i += 50) {
            const chunk = rawDocs.slice(i, i + 50);
            const embeddings = await this.getEmbeddingsBatch(chunk.map((d) => d.searchableText));
            for (let j = 0; j < chunk.length; j++) {
                docsToInsert.push({ ...chunk[j], embedding: embeddings[j] });
            }
        }   

        await vedicVerseModel.insertMany(docsToInsert);
        console.log(`Seeded ${docsToInsert.length} Rigveda + Bhagavad Gita verses into MongoDB Atlas.`);
    }

    static async searchVerses(query: string, limit = 3) {
        const [queryVector] = await this.getEmbeddingsBatch([query]);

        return vedicVerseModel.aggregate([
            {
                $vectorSearch: {
                    index: "vedic_vector_index",
                    path: "embedding",
                    queryVector,
                    numCandidates: 30,
                    limit,
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
                    score: { $meta: "vectorSearchScore" },
                },
            },
        ]);
    }
}