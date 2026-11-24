import "dotenv/config";
import { app } from "./app.js";
import { VedaService } from "./services/veda.service.js";
import { connectDB } from "./db/db.js";
import { seedIfEmpty } from "./services/seed.service.js";


const PORT = 5000;

async function startServer() {
    try {
        await connectDB();

        // Seed initial rituals, pandits & Booking (BK-1001) if DB is empty
        await seedIfEmpty();

        VedaService.initData();
        console.log("Vedic scripture data loaded into memory.");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })
    } catch (error: any) {
        console.log("Server startup failed: ", error.message);
        process.exit(1);
    }
}

startServer();