import { model, Schema } from "mongoose";


export interface IRitual {
    name: string,
    ritualType: "pooja" | "havan",
    description: string,
    durationMinutes: number,
    baseDakshina: number,
    samagriKitPrice: number,
    samagriItems: string[],
    createdAt?: Date,
    updatedAt?: Date
}


const ritualSchema = new Schema<IRitual>({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    ritualType: {
        type: String,
        enum: ["pooja", "havan"],
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    durationMinutes: {
        type: Number,
        required: true,
        min: [30, "duration should be at least 30 minutes"],
    },
    baseDakshina: {
        type: Number,
        required: true,
        min: [0, "Dakshina can not be negative"],
    },
    samagriKitPrice: {
        type: Number,
        required: true,
        min: [0, "Price can not be negative"]
    },
    samagriItems: {
        type: [String],
        default: []
    },
}, {
    timestamps: true
});


const ritualModel = model<IRitual>("Ritual", ritualSchema);

export default ritualModel;