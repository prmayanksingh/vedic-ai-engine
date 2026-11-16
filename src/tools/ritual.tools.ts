import { tool } from "ai";
import z from "zod";
import ritualModel from "../models/ritual.model.js";
import { BookingService } from "../services/booking.service.js";



export const riualTools = {
    getRitualCatalog: tool({
        description: "Fetch available Vedic rituals (poojas and havans), their Dakshina pricing, duration, samagri kit price, and included samagri items.",
        inputSchema: z.object({
            ritualType: z.enum(["pooja", "havan"])
                .optional()
                .describe("Optional filter by ritual type: 'pooja' or 'havan'")
        }),
        execute: async ({ ritualType }) => {
            const filter = ritualType ? ritualType : {};
            const rituals = await ritualModel.find(filter).lean();
            return {
                success: true,
                rituals: rituals.map((r) => ({
                    name: r.name,
                    ritualType: r.ritualType,
                    description: r.description,
                    durationMinutes: r.durationMinutes,
                    baseDakshina: r.baseDakshina,
                    samagriKitPrice: r.samagriKitPrice,
                    samagriItems: r.samagriItems,
                })),
            };
        },
    }),

    checkPanditAvailability: tool({
        description: "Check which qualified Pandits are free in a given city on a specific date (YYYY-MM-DD) and time slot (morning, afternoon, evening).",
        inputSchema: z.object({
            city: z.string().describe("City name in lowerCase, e.g. 'gurugram' or 'noida'"),
            ritualType: z
                .enum(["pooja", "havan"])
                .describe("Type of ritual: 'pooja' or 'havan'"),
            date: z
                .string()
                .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
                .describe("Requested date in YYYY-MM-DD format"),
            timeSlot: z
                .enum(["morning", "afternoon", "evening"])
                .describe("Time slot: 'morning', 'afternoon', or 'evening'"),
        }),
        execute: async ({ city, ritualType, date, timeSlot }) => {
            try {
                const result = BookingService.checkAvailability({
                    city,
                    ritualType,
                    date,
                    timeSlot
                });
                return { success: true, ...result };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        }
    })
}