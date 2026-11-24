import { Router } from "express";
import { getOverview, handleResetDemo } from "../controller/admin.controller.js";


const adminRouter = Router();

// api/admin
adminRouter.post("/reset-demo", handleResetDemo);

adminRouter.get("/overview", getOverview);

export default adminRouter;