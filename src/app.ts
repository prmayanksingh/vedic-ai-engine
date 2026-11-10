import express from "express";
import { vedaRouter } from "./routes/veda.routes.js";

export const app = express();


app.use(express.json());


app.use("/api/veda", vedaRouter);