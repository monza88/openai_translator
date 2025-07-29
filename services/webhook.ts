import axios from "axios";

type TranslationPayload = {
    batchId: string;
    isLastBatch: boolean;
    sheetName : string;
    translations : Record<string, Record<string, string>>;
};

export async function sendToWebhook(callbackUrl : string, payload : TranslationPayload): Promise<void> {
    try {
        const response = await axios.post(callbackUrl, payload, {
            headers: {
                "Content-Type": "application/json",
            },
            timeout : 10000, // 10초 타임아웃 설정
        });

        if (response.status !== 200) {
            throw new Error(`Webhook request failed with status ${response.status}`);
        }
        //console.log("Webhook request successful:", response.data);
    } catch (error) {
        //console.error("Error sending to webhook:", error);
        throw new Error(`Failed to send to webhook: ${error instanceof Error ? error.message : String(error)}`);
    }
}