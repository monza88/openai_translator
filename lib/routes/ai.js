"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const openai_1 = require("../services/openai");
const webhook_1 = require("../services/webhook");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
router.post("/batch-translate", async (req, res) => {
    console.log("REQ BODY", req.body);
    try {
        const { data, batchId, isLastBatch, languages, callbackUrl, promptFile } = req.body;
        let systemPrompt = "";
        if (promptFile) {
            const filePath = path_1.default.join(__dirname, "../prompts", promptFile);
            systemPrompt = fs_1.default.readFileSync(filePath, "utf-8");
        }
        if (!data || !Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ error: "Invalid data format" });
        }
        if (!callbackUrl) {
            return res.status(400).json({ error: "Missing callbackUrl" });
        }
        //batchId 별로 데이터 그룹화
        const batchGroups = {};
        data.forEach(row => {
            if (!batchGroups[row.batchId]) {
                batchGroups[row.batchId] = [];
            }
            batchGroups[row.batchId].push(row);
        });
        //각 배치 그룹에 대해 OpenAI로 번역 요청
        //여러 언어에 대해 번역 결과를 콜백 URL로 전송
        await Promise.all(Object.entries(batchGroups).map(async ([batchId, batchData]) => {
            const translationTasks = languages.map(async (lang) => {
                //각 언어 별로 번역할 텍스트를 하나의 프롬프트로 전달
                const inputText = batchData.map(row => `${row.key}, ${row.text}`).join("\n");
                const prompt = systemPrompt.replaceAll("{{language_code}}", lang) + `\n\n ${inputText}`;
                const gptResult = await (0, openai_1.sendToOpenAI)(prompt);
                //번역 결과를 키-값 쌍으로 변환
                const translationMap = parseTranslationTextToMap(gptResult);
                return { lang, content: translationMap };
            });
            const translations = await Promise.all(translationTasks);
            //콜백 URL로 번역 결과 전송
            await (0, webhook_1.sendToWebhook)(callbackUrl, {
                batchId,
                isLastBatch,
                translations,
            });
        }));
        res.status(200).json({ status: "OK", forwarded: true });
    }
    catch (err) {
        console.error("Error in /ai/batch-translate", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
function parseTranslationTextToMap(text) {
    const map = {};
    const lines = text.split("\n");
    for (const line of lines) {
        const trimed = line.trim();
        if (!trimed)
            continue; //빈 줄 무시
        const [key, ...rest] = trimed.split(",");
        if (key && rest.length > 0) {
            map[key.trim()] = rest.join(",").trim(); //콤마 포함된 텍스트 대응
        }
    }
    return map;
}
exports.default = router;
