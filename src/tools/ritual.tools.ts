import { tool } from "ai";
import z from "zod";
import ritualModel from "../models/ritual.model.js";
import { BookingService } from "../services/booking.service.js";
import { VedaService } from "../services/veda.service.js";



export const ritualTools = {
    searchVedicKnowledge: tool({
        description: "Ask questions about authentic Vedic scriptures, mantras, deities, ritual significance, and spiritual meanings from the Vedic reference dataset.",
        inputSchema: z.object({
            query: z
                .string()
                .describe("The Vedic scripture, mantra, or spiritual question to look up."),
        }),
        execute: async ({ query }) => {
            try {
                const answer = await VedaService.askQuestion(query);
                return { success: true, answer };
            } catch (error: any) {
                return { success: true, error: error.message };
            }
        },
    }),

    getRitualCatalog: tool({
        description: "Fetch available Vedic rituals (poojas and havans), their Dakshina pricing, duration, samagri kit price, and included samagri items.",
        inputSchema: z.object({
            ritualType: z.enum(["pooja", "havan"])
                .optional()
                .describe("Optional filter by ritual type: 'pooja' or 'havan'")
        }),
        execute: async ({ ritualType }) => {
            const filter = ritualType ? { ritualType } : {};
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
                const result = await BookingService.checkAvailability({
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
    }),
    createRitualBooking: tool({
        description: "Book a Pooja or Havan with an available Pandit. Only call this AFTER collecting devoteeName, devoteePhone, city, address, ritualName, date (YYYY-MM-DD), and timeSlot.",
        inputSchema: z.object({
            devoteeName: z.string().describe("Full name of the devotee"),
            devoteePhone: z.string().describe("10-digit mobile number of the devotee"),
            city: z.string().describe("City name in lowercase, e.g. 'gurugram' or 'noida'"),
            address: z.string().describe("Full home or venue addres for the ritual"),
            ritualName: z
                .string()
                .describe("Exact name of the ritual from the catalog, e.g. 'Griha Pravesh Havan'"),
            date: z
                .string()
                .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
                .describe("Booking date in YYYY-MM-DD format"),
            timeSlot: z
                .enum(["morning", "afternoon", "evening"])
                .describe("Time slot: 'morning', 'afternoon', or 'evening'"),
            includeSamagriKit: z
                .boolean()
                .default(true)
                .describe("Whether to include the complete Pooja/Havan samagri kit"),
        }),
        execute: async (params) => {
            try {
                const booking = await BookingService.createBooking(params);
                return { success: true, booking };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
    }),

    rescheduleRitualBooking: tool({
        description: "Reschedule an existing booking using its booking code (e.g. BK-1001) to a new date (YYYY-MM-DD) and time slot.",
        inputSchema: z.object({
            bookingCode: z.string().describe("Booking reference code, e.g. 'BK-1001'"),
            newDate: z
                .string()
                .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
                .describe("New date in YYYY-MM-DD format"),
            newTimeSlot: z
                .enum(["morning", "afternoon", "evening"])
                .describe("New time slot: 'morning', 'afternoon', or 'evening'")
        }),
        execute: async (params) => {
            try {
                const updated = await BookingService.rescheduleBooking(params);
                return { success: true, booking: updated };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
    }),

    cancelRitualBooking: tool({
        description: "Cancel an existing ritual booking using its booking code (e.g. BK-1001).",
        inputSchema: z.object({
            bookingCode: z.string().describe("Booking reference code, e.g. 'BK-1001'"),
            reason: z
                .string()
                .optional()
                .describe("Optional reason for cancelling the booking"),
        }),
        execute: async (params) => {
            try {
                const cancelled = await BookingService.cancelBooking(params);
                return { success: true, booking: cancelled };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        }
    })

}