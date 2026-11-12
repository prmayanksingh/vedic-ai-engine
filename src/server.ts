import "dotenv/config";
import { app } from "./app.js";
import { VedaService } from "./services/veda.service.js";
import { connectDB } from "./db/db.js";


const PORT = 3000;


try {
    VedaService.initData();
    console.log("Vedic scripture data loaded into memory.");
} catch (error: any) {
    console.log("Failed to load Vedic data file:", error.message);
    process.exit(1);
}


connectDB().then(() =>
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
);