import { Request, Response } from "express";
import { resetDemoData } from "../services/seed.service.js";


export async function handleResetDemo(req: Request, res: Response) {
    try {
        await resetDemoData();
        res.status(200).json({
            success: true,
            message: "Demo data reset successfully!",
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to reset demo data.",
        });
    }
}