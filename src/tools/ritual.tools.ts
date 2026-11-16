import { tool } from "ai";
import z from "zod";
import ritualModel from "../models/ritual.model.js";



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


}