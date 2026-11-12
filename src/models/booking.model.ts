import { model, Schema, Types } from "mongoose";


export type TimeSlot = "morning" | "afternoon" | "evening";
export type BookingStatus = "CONFIRMED" | "RESCHEDULED" | "CANCELLED";

export interface IBooking {
    bookingCode: string,
    devoteeName: string,
    devoteePhone: string,
    city: string,
    address: string,
    ritualId: Types.ObjectId,
    ritualName: string,
    ritualType: "pooja" | "havan",
    panditId: Types.ObjectId,
    panditName: string,
    date: string,
    timeSlot: TimeSlot,
    includeSamagriKit: boolean,
    totalAmount: number,
    status: BookingStatus,
    cancellationReason?: string,
    createdAt?: Date,
    updatedAt?: Date,
};


const bookingSchema = new Schema<IBooking>({
    bookingCode: {
        type: String,
        required: true,
        unique: true,
    },
    devoteeName: {
        type: String,
        required: true,
        trim: true,
    },
    devoteePhone: {
        type: String,
        required: true,
        trim: true,
    },
    city: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
    },
    ritualId: {
        type: Schema.Types.ObjectId,
        ref: "Ritual",
        required: true,
    },
    ritualName: {
        type: String,
        required: true,
    },
    ritualType: {
        type: String,
        enum: ["pooja", "havan"],
        required: true,
    },
    panditId: {
        type: Schema.Types.ObjectId,
        ref: "Pandit",
        required: true,
    },
    panditName: {
        type: String,
        required: true,
        trim: true,
    },
    date: {
        type: String,
        required: true,
    },
    timeSlot: {
        type: String,
        enum: ["morning", "afternoon", "evening"],
        required: true,
    },
    includeSamagriKit: {
        type: Boolean,
        default: true,
    },
    totalAmount: {
        type: Number,
        required: true,
        min: [0, "Total amount can not be negative"],
    },
    status: {
        type: String,
        enum: ["CONFIRMED", "RESCHEDULED", "CANCELLED"],
        default: "CONFIRMED",
    },
    cancellationReason: {
        type: String,
    }
}, {
    timestamps: true
});

const bookingModel = model<IBooking>("Booking", bookingSchema);

export default bookingModel;