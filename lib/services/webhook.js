"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToWebhook = sendToWebhook;
const axios_1 = __importDefault(require("axios"));
async function sendToWebhook(callbackUrl, payload) {
    try {
        const response = await axios_1.default.post(callbackUrl, payload, {
            headers: {
                "Content-Type": "application/json",
            },
            timeout: 10000, // 10초 타임아웃 설정
        });
        if (response.status !== 200) {
            throw new Error(`Webhook request failed with status ${response.status}`);
        }
        //console.log("Webhook request successful:", response.data);
    }
    catch (error) {
        //console.error("Error sending to webhook:", error);
        throw new Error(`Failed to send to webhook: ${error instanceof Error ? error.message : String(error)}`);
    }
}
