import express from "express";
import cors from "cors"
import adminRouter from "./routes/admin.routes.js";
import agentRouter from "./routes/agent.route.js";

export const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000"
}))
app.use(express.json());

// admin
app.use("/api/admin", adminRouter);

// agent
app.get("/api/agent", agentRouter);

// backend health
app.use("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        timeStamp: new Date().toISOString()
    })
})