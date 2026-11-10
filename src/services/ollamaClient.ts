import { OllamaGenerateRequest, OllamaGenerateResponse } from "../types/types.js";


const OLLAMA_API_URL = "http://localhost:11434/api/generate";

export async function generateVedicResponse(
    prompt: string,
    systemContext: string,
    model: string = "qwen2.5:3b"
) {
    const payload: OllamaGenerateRequest = {
        model,
        prompt,
        system: systemContext,
        stream: false
    }

    try {
        const res = await fetch(OLLAMA_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            throw new Error(`Ollama returned status ${res.status}: ${res.statusText}`)
        }

        const data = (await res.json()) as OllamaGenerateResponse;
        return data.response;

    } catch (error: any) {
        if (error.cause?.code === "ECONNREFUSED") {
            throw new Error('Could not connect to Ollama. Make sure the Ollama desktop app is running.');
        }
        throw error;
    }
}