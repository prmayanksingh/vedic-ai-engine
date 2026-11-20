import { Router } from "express";
import { handleResetDemo } from "../controller/admin.controller.js";


const adminRouter = Router();

// api/admin
adminRouter.post("/reset-demo", handleResetDemo);

export default adminRouter;