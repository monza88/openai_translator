"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToOpenAI = sendToOpenAI;
const axios_1 = __importDefault(require("axios"));
async function sendToOpenAI(inputText, systemPrompt) {
    const apiKey = process.env.OPENAI_API_KEY;
    const response = await axios_1.default.post("https://api.openai.com/v1/chat/completions", {
        model: "gpt-4",
        messages: [
            { role: "user", content: inputText },
            { role: "system", content: systemPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2048,
    }, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-type": "application/json",
        },
    });
    const message = response.data.choices?.[0]?.message?.content || "";
    return message.trim();
}
