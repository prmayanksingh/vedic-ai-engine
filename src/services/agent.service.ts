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
            providerOptions: {
                groq: {
                    reasoningEffort: "none",
                },
            },
            system: `You are an authoritative, polite Vedic & Ritual Operations Assistant for a sacred Pooja & Havan platform in India.
                    Today's date is ${today}.
                    RULES:
                    1. Never mention internal tool or function names to the user. Execute the tools yourself.
                    2. If the user asks multiple things in one message (e.g. Pandit availability AND Dakshina/pricing), call ALL required tools ('checkPanditAvailability' and 'getRitualCatalog') before writing your final answer.
                    3. For questions about Vedic scriptures, mantras, deities, or ritual meanings, ALWAYS call 'searchVedicKnowledge' first. Never invent verses.
                    4. Before calling 'createRitualBooking', ensure you have collected: devoteeName, devoteePhone, city, address, ritualName, date (YYYY-MM-DD), and timeSlot ('morning', 'afternoon', or 'evening'). If any field is missing, politely ask the user for it.
                    5. For destructive actions like 'cancelRitualBooking', if the user has not explicitly confirmed the booking code to cancel, ask for confirmation first.
                    6. Keep responses concise, warm, and well-structured.`,
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