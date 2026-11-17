import { createOpenAI } from "@ai-sdk/openai";
import { generateText, ModelMessage, stepCountIs } from "ai";
import { ritualTools } from "../tools/ritual.tools.js";

const llmProvider = createOpenAI({
    baseURL: process.env.LLM_BASE_URL,
    apiKey: process.env.LLM_API_KEY,
});

export class AgentService {
    static async runChat(messages: ModelMessage[]) {
        const today = new Date().toISOString().split("T")[0];

        const result = await generateText({
            model: llmProvider(process.env.LLM_MODEL as string),
            system: `You are an authoritative, polite Vedic & Ritual Operations Assistant for a sacred Pooja & Havan platform in India.
                    Today's date is ${today}.
                    RULES:
                    1. For questions about Vedic scriptures, mantras, deities, or ritual meanings, ALWAYS call 'searchVedicKnowledge' first. Never invent verses.
                    2. For ritual pricing, duration, or samagri lists, ALWAYS call 'getRitualCatalog'.
                    3. Before calling 'createRitualBooking', ensure you have collected: devoteeName, devoteePhone, city, address, ritualName, date (YYYY-MM-DD), and timeSlot ('morning', 'afternoon', or 'evening'). If any field is missing, politely ask the user for it.
                    4. For destructive actions like 'cancelRitualBooking', if the user has not explicitly confirmed the booking code to cancel, ask for confirmation first.
                    5. Keep responses concise, warm, and well-structured.`,
            messages,
            tools: ritualTools,
            stopWhen: stepCountIs(5)
        });

        return {
            reply: result.text,
            stepsCount: result.steps.length,
            toolCalls: result.steps.flatMap((step) =>
                step.toolCalls.map((tc) => ({
                    toolName: tc.toolName,
                    input: tc.input
                }))
            ),
        };
    }
}