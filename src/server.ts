import "dotenv/config";
import { app } from "./app.js";
import { VedaService } from "./services/veda.service.js";
import { connectDB } from "./db/db.js";
import { seedIfEmpty } from "./services/seed.service.js";


const PORT = 3000;

async function startServer() {
    try {
        VedaService.initData();
        console.log("Vedic scripture data loaded into memory.");

        await connectDB();
        // Seed initial rituals, pandits & Booking (BK-1001) if DB is empty
        await seedIfEmpty();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })
    } catch (error: any) {
        console.log("Server startup failed: ", error.message);
        process.exit(1);
    }
}

startServer();