import axios from "axios";

interface OpenAIChatResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

export async function sendToOpenAI(prompt: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;

    const response = await axios.post<OpenAIChatResponse>(
        "https://api.openai.com/v1/chat/completions",
        {
            model: "gpt-4",
            messages: [{ role : "user", content : prompt }],
        },
        {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-type" : "application/json",
            },
        }
    );

    const message = response.data.choices?.[0]?.message?.content || "";
    return message.trim();
}