import { model, Schema } from "mongoose"


export interface IVedicVerse {
    veda: string,
    mandala: number,
    sukta: number,
    verse: number,
    deity: string,
    sanskrit?: string,
    translation: string,
    meaning?: string,
    searchableText: string,
    embedding: number[]
}

const VedicVerseSchema = new Schema<IVedicVerse>({
    veda: {
        type: String,
        required: true
    },
    mandala: {
        type: Number,
        required: true,
    },
    sukta: {
        type: Number,
        required: true,
    },
    verse: {
        type: Number,
        required: true,
    },
    deity: {
        type: String,
        required: true,
    },
    sanskrit: {
        type: String,
    },
    translation: {
        type: String,
        required: true
    },
    meaning: {
        type: String,
    },
    searchableText: {
        type: String,
        required: true
    },
    embedding: {
        type: [Number],
        required: true
    }
})

const vedicVerseModel = model<IVedicVerse>("VedicVerse", VedicVerseSchema);

export default vedicVerseModel;