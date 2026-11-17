import { Request, Response } from "express";
import { AgentService } from "../services/agent.service.js";

export async function handleAgentChat(req: Request, res: Response) {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({
                success: false,
                error: "Request body must contain a 'messages' array.",
            });
        }

        const result = await AgentService.runChat(messages);

        return res.status(200).json({ success: true, ...result });

    } catch (error: any) {
        console.error("Agent chat error:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Agent faild to process request",
        })
    }
}