import { Request, Response } from "express";
import { VedaService } from "../services/veda.service.js";


export async function askVedaHandler(req: Request, res: Response): Promise<void> {
    try {
        const { question } = req.body;

        // basic validation
        if (!question || typeof question !== "string") {
            res.status(400).json({
                error: "Field 'question' is required and must be a string.",
            });
            return;
        }

        // call service
        const answer = await VedaService.askQuestion(question);

        res.status(200).json({
            question,
            answer
        });

    } catch (error: any) {
        res.status(500).json({
            error: error.message || "Faild to generate Vedic response",
        });
    }
}