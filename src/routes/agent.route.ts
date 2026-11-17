import { Router } from "express";
import { handleAgentChat } from "../controller/agent.controller.js";

const agentRouter = Router();

// api/agent/
agentRouter.post("/chat", handleAgentChat);

export default agentRouter;