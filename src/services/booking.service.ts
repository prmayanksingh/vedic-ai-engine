import bookingModel, { TimeSlot } from "../models/booking.model.js";
import panditModel from "../models/pandit.model.js";



export class BookingService {
    // check available Pandit for a city, ritual type, date & time slot
    static async checkavailability(params: {
        city: string,
        ritualType: "pooja" | "havan",
        date: string,
        timeSlot: TimeSlot
    }) {
        const normalizedCity = params.city.trim().toLowerCase();

        // Find active pandit in that city qualified for the ritual type
        const qualifiedPandit = await panditModel.find({
            city: normalizedCity,
            specializations: params.ritualType,
            isActive: true
        }).lean();

        if (qualifiedPandit.length === 0) {
            return {
                available: false,
                message: `No active pandit available in ${params.city} for ${params.ritualType}`,
                availablePandit: []
            };
        };

        // Find booking on that exact data & slot which are NOT cancelled
        const conflictingBookings = await bookingModel.find({
            panditId: { $in: qualifiedPandit.map(p => p._id) },
            date: params.date,
            timeSlot: params.timeSlot,
            status: { $ne: "CANCELLED" },
        }).select("panditId").lean();

        const busyPanditId = new Set(
            conflictingBookings.map((b) => b.panditId.toString())
        );

        const availablePandits = qualifiedPandit.filter(p => !busyPanditId.has(p._id.toString()));

        return {
            available: availablePandits.length > 0,
            date: params.date,
            timeSlot: params.timeSlot,
            city: normalizedCity,
            availablePandits: availablePandits.map((p) => ({
                id: p._id.toString(),
                name: p.name,
                language: p.languages,
                experienceYears: p.experienceYears,
            }))
        }
    }
}