import { model, Schema } from "mongoose"


export interface IPandit {
    name: string,
    city: string,
    languages: string[],
    specializations: ("pooja" | "havan")[],
    experienceYears: number,
    isActive?: boolean,
    createdAt?: Date,
    updatedAt?: Date
};


const panditSchema = new Schema<IPandit>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    languages: {
        type: [String],
        default: ["Hindi", "Sanskrit"],
    },
    specializations: {
        type: [String],
        enum: ["pooja", "havan"],
        required: true,
    },
    experienceYears: {
        type: Number,
        required: true,
        min: [0, "Experience can not be negative"],
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true
});


const panditModel = model<IPandit>("Pandit", panditSchema);


export default panditModel;