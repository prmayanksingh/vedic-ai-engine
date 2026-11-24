import { Request, Response } from "express";
import { resetDemoData } from "../services/seed.service.js";
import panditModel from "../models/pandit.model.js";
import bookingModel from "../models/booking.model.js";
import ritualModel from "../models/ritual.model.js";


export async function handleResetDemo(req: Request, res: Response) {
    try {
        await resetDemoData();
        res.status(200).json({
            success: true,
            message: "Demo data reset successfully!",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to reset demo data."
        });
    }
}

export async function getOverview(req: Request, res: Response) {
    try {
        const [rituals, pandits, bookings] = await Promise.all([
            ritualModel.find().lean(),
            panditModel.find().lean(),
            bookingModel.find().sort({ createdAt: -1 }).lean()
        ])
        
        res.status(200).json({
            rituals,
            pandits,
            bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to fetch data."
        });
    }
}