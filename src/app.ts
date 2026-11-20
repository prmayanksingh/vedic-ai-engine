import express from "express";
import adminRouter from "./routes/admin.routes.js";
import agentRouter from "./routes/agent.route.js";

export const app = express();


app.use(express.json());

// admin
app.use("/api/admin", adminRouter);

// agent
app.use("/api/agent", agentRouter);

