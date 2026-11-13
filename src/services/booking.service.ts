import bookingModel, { TimeSlot } from "../models/booking.model.js";
import panditModel from "../models/pandit.model.js";
import ritualModel from "../models/ritual.model.js";


export interface CreateBookingInput {
    devoteeName: string,
    devoteePhone: string,
    city: string,
    address: string,
    ritualName: string,
    date: string, // YYYY-MM-DD
    timeSlot: TimeSlot,
    includeSamagriKit?: boolean,
}

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
                availablePandits: []
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

    // create a confirmed ritual booking with automatic Pandit assigment & pricing
    static async createBooking(input: CreateBookingInput) {
        const normalizedCity = input.city.trim().toString();

        const escapedName = input.ritualName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        // match ritual by case-insenstive regex
        // $regex -> it check and return if the name contains even if its not the full string
        // new RegExp(pattern, flag) -> it sets the rule and "i" is for case insensitive
        const ritual = await ritualModel.findOne({
            name: { $regex: new RegExp(escapedName, "i") },
        });

        if (!ritual) {
            throw new Error(
                `Ritual ${input.ritualName} not fount in the catalog. Available rituals: Griha Pravesh Havan, Satyanarayan Katha & Pooja, Maha Mrityunjaya Havan, Lakshmi Ganesh Pooja.`
            );
        }

        // check availability for ritual's type
        const availability = await this.checkavailability({
            city: normalizedCity,
            ritualType: ritual.ritualType,
            date: input.date,
            timeSlot: input.timeSlot
        });

        if (!availability.available || availability.availablePandits.length === 0) {
            throw new Error(
                `No pandit is free in ${input.city} on ${input.date} (${input.timeSlot}) for ${input.ritualName}`
            );
        }

        const assignedPandit = availability.availablePandits[0];
        const includeKit = input.includeSamagriKit ?? true;
        const totalAmount = ritual.baseDakshina + (includeKit ? ritual.samagriKitPrice : 0);

        // Generate unique booking code e.g. BK-4829
        const bookingCode = `BK-${Math.floor(1000 + Math.random() * 9000)}`

        const booking = await bookingModel.create({
            bookingCode,
            devoteeName: input.devoteeName,
            devoteePhone: input.devoteePhone,
            city: normalizedCity,
            address: input.address,
            ritualId: ritual._id,
            ritualName: ritual.name,
            ritualType: ritual.ritualType,
            panditId: assignedPandit.id,
            panditName: assignedPandit.name,
            date: input.date,
            timeSlot: input.timeSlot,
            includeSamagriKit: includeKit,
            totalAmount,
            status: "CONFIRMED"
        });

        return {
            bookingCode: booking.bookingCode,
            status: booking.status,
            ritualName: booking.ritualName,
            panditName: booking.panditName,
            city: booking.city,
            date: booking.date,
            timeSlot: booking.timeSlot,
            includeSamagriKit: booking.includeSamagriKit,
            totalAmount: booking.totalAmount
        }
    }
}