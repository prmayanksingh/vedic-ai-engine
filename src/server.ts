import { app } from "./app.js";
import { VedaService } from "./services/veda.service.js";

const PORT = 3000;


try {
    VedaService.initData();
    console.log("Vedic scripture data loaded into memory.");
} catch (error: any) {
    console.log("Failed to load Vedic data file:", error.message);
    process.exit(1);
}


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});