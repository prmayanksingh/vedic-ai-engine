import express from "express";
import { vedaRouter } from "./routes/veda.routes.js";
import adminRouter from "./routes/admin.routes.js";

export const app = express();


app.use(express.json());

// admin
app.use("/api/admin", adminRouter);


app.use("/api/veda", vedaRouter);
