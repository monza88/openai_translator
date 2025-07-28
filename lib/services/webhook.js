"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToWebhook = sendToWebhook;
const axios_1 = __importDefault(require("axios"));
async function sendToWebhook(url, data) {
    try {
        const response = await axios_1.default.post(url, data, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        console.log('webhook sent :', response.status);
    }
    catch (error) {
        if (typeof error === "object" && error !== null && "response" in error) {
            const err = error;
            const status = err.response?.status;
            const statusText = err.response?.statusText;
            const responseData = err.response?.data;
            console.error(`Webhook request failed: ${status} ${statusText} - `, responseData);
            throw new Error(`Webhook request failed with status ${status}`);
        }
        else {
            console.error("Unexpected error in sendToWebhook:", error);
            throw new Error("Unexpected error occurred while sending webhook");
        }
    }
}
