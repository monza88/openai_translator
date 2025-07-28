import axios from "axios";

export async function sendToWebhook(url: string, data: any): Promise<void> {
    try {
        const res = await axios.post(url, data, {
            headers: { "Content-Type": "application/json" }
        });
        console.log("Webhook sent:", res.status);
    } catch (err) {
        console.error("Webhook error:", err);
        throw new Error("Failed to send webhook");
    }
}