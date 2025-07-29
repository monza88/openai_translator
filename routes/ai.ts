import express from 'express';
import { sendToOpenAI } from "../services/openai";
import { sendToWebhook } from "../services/webhook";
import { saveGptDebugLogs } from "../utils/logger";
import { saveTranslationsToFile } from '../utils/logger';
import fs from "fs";
import path from "path";
import { send } from 'process';

const router = express.Router();

router.post("/batch-translate", async (req, res) => {
    console.log("REQ BODY", req.body);
    try {
        const { data, languages, sheetName,  callbackUrl , promptFile} = req.body;

        if(!data || !Array.isArray(data) || data.length === 0) { 
            return res.status(400).json({ error: "Invalid data format" });
        }

        if (!callbackUrl) {
            return res.status(400).json({ error: "Missing callbackUrl" });
        }
        
        let systemPrompt = "";
        if(promptFile) {
            try {
                const filePath = path.resolve(process.cwd(), "prompts", promptFile);
                 if (!fs.existsSync(filePath)) {
                    console.error("❌ 파일이 존재하지 않음:", filePath);
                 }

                systemPrompt = fs.readFileSync(filePath, 'utf8');
                //console.log("✅ 시스템 프롬프트 로드 완료:", filePath);

            } catch (error) {
                console.error("Error reading prompt file:", error);
            }
        }      

        const baseBatchId = `job-${Date.now()}`;
        const BATCH_SIZE = 50; //배치 크기 설정
        
        const totalBatches = Math.ceil(data.length / BATCH_SIZE);
        const batches = Array.from({ length : totalBatches }, (_, i) => 
            data.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)
        );

        //각 배치 그룹에 대해 OpenAI로 번역 요청
        //여러 언어에 대해 번역 결과를 콜백 URL로 전송
        await Promise.all(
            batches.map(async (batchData, index) => {
                const batchId = `${baseBatchId}-bacth${index}`;
                const isLastBatch = index === totalBatches - 1;
                const translations : { [lang : string] : Record<string, string> } = {};

                await Promise.all(
                    languages.map(async (lang:string) => {
                        const inputText = batchData.map(row => {
                            return Array.isArray(row)
                            ? `${row[0]}, ${row[1]}, ${row[2]}`
                            : `${row.key}, ${row.type}, ${row.text}`;
                        }).join("\n");

                        const prompt = systemPrompt.replaceAll("{{language_code}}", lang);
                        const gptResult = await sendToOpenAI(inputText, prompt);
                        const translationMap = parseTranslationTextToMap(gptResult);

                        saveGptDebugLogs(batchId, lang, prompt, gptResult, translationMap);

                        translations[lang] = translationMap;
                        //console.log(`✅ ${lang} 번역 완료:`, translationMap);
                    })
                );

                saveTranslationsToFile(batchId, translations);
                //번역 결과를 콜백 URL로 전송
                //console.log(`📤 콜백 URL로 번역 결과 전송: ${callbackUrl}`);
                await sendToWebhook(callbackUrl, {
                    batchId,
                    isLastBatch,
                    sheetName,
                    translations
                });
            })
        );
        res.status(200).json({ status: "OK", forwarded: true });
        //console.log("✅ 배치 번역 완료:", batchId, isLastBatch, languages);

    } catch (err) {
        //console.error("Error in /ai/batch-translate", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

function parseTranslationTextToMap(text : string) :Record<string, string> {
    const lines = text.split("\n").filter(line => line.trim() !== "");
    const map : Record<string, string> = {};
    
    const allowedTypes = [
        "label", "desc", "title", "radio", "checkbox",
        "btn", "toggle", "option", "dropdown", "etc", "sequence"
    ];

    for(const line of lines) {
        const [keyPart, ...rest] = line.split(",");
        const key = keyPart.trim();
        const valueRaw = rest.join(",").trim();
        const typeRegex = new RegExp(`^(${allowedTypes.join("|")})\\s*,?\\s*`, "i");
        
        const value = valueRaw.replace(typeRegex, "").trim();

        if(key && value) {
            map[key] = value;
        }
    }

    return map;
}

export default router;