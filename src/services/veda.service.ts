import { VedicVerse } from "../types/types.js";
import path from "node:path";
import fs from "node:fs";
import { generateVedicResponse } from "./ollama.service.js";


export class VedaService {
    private static records: VedicVerse[] = [];

    // Read JSON file from disk into memory
    static initData(): void {
        const datapath = path.resolve("data/vedas.json");
        const raw = fs.readFileSync(datapath, "utf-8");
        this.records = JSON.parse(raw);
    }

    // strict system instructions with our JSON data
    private static buildSystemPrompt(): string {
        return `You are a specialized Vedic Scholar assistant.
        you must answer according to the given veda.
        if the info isn't available then just say "This info isn't available" nothing else.
        Your answers MUST be strictly derived from the provided Vedic Reference Data below.
        
        STRICT INSTRUCTIONS:
        1. Ground every claim directly in the data. Cite the Veda, Mandala, Sukta, and Verse number.
        2. If the user asks about a deity, mantra, or concept not present in this reference data, reply: "This information is not available in the provided Vedic script."
        3. Never fabricate or hallucinate verses.
        
        Vedic Reference Data:
        ${JSON.stringify(this.records, null, 2)}`
    }

    // main method to call
    static async askQuestion(question: string): Promise<string> {
        if (this.records.length === 0) {
            this.initData();
        }
        const systemPrompt = this.buildSystemPrompt();
        return await generateVedicResponse(question, systemPrompt);
    }
}