import mongoose from "mongoose";


export async function connectDB(): Promise<void> {
    try {
        mongoose.connect(process.env.MONGO_URI as string);
        console.log("DataBase Connected Successfully!");
    } catch (error: any) {
        console.log("Error connecting to the database", error.message);
        process.exit(1);
    }
}