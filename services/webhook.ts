import axios from "axios";


export async function sendToWebhook(url: string, data: any): Promise<void> {
    try {
        const response = await axios.post(url, data, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        console.log('webhook sent :', response.status);
    } catch (error : unknown) {
        if(typeof error === "object" && error !== null && "response" in error){
            const err = error as any;
            const status = err.response?.status;
            const statusText = err.response?.statusText;
            const responseData = err.response?.data;
            
            console.error(`Webhook request failed: ${status} ${statusText} - `, responseData);
            throw new Error(`Webhook request failed with status ${status}`);
        } else {
            console.error("Unexpected error in sendToWebhook:", error);
            throw new Error("Unexpected error occurred while sending webhook");
        }
    }
}