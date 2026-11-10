import { Router } from "express";
import { askVedaHandler } from "../controller/veda.controller.js";


export const vedaRouter = Router();


// POST /api/veda/ask
vedaRouter.post("/ask", askVedaHandler);