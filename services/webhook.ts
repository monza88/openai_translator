import axios from "axios";

export async function sendToWebhook(url: string, data: any): Promise<void> {
    await axios.post(url, data);
}