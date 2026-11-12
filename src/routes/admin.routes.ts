import { Router } from "express";
import { handleResetDemo } from "../controller/admin.controller.js";


const adminRouter = Router();

adminRouter.post("/reset-demo", handleResetDemo);

export default adminRouter;