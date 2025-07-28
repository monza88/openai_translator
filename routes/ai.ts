import express from 'express';
import { sendToOpenAI } from "../services/openai";
import { sendToWebhook } from "../services/webhook";

const router = express.Router();

//Post /ai/process
router.post("/process", async (req , res) => {
    try {
        const { prompt, webhookUrl } = req.body;

        if (!prompt || !webhookUrl) {
            return res.status(400).json({ error: "Missing prompt or webhookUrl" });
        }

        const aiResponse = await sendToOpenAI(prompt);
        await sendToWebhook(webhookUrl, { result: aiResponse });

        res.status(200).json({ status: "OK", forwarded: true });
    } catch (err) {
        console.error("Error in /ai/process", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;