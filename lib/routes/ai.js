"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const openai_1 = require("../services/openai");
const webhook_1 = require("../services/webhook");
const logger_1 = require("../utils/logger");
const logger_2 = require("../utils/logger");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
router.post("/batch-translate", async (req, res) => {
    console.log("REQ BODY", req.body);
    try {
        const { data, batchId, isLastBatch, languages, sheetName, callbackUrl, promptFile } = req.body;
        let systemPrompt = "";
        if (promptFile) {
            try {
                const filePath = path_1.default.resolve(process.cwd(), "prompts", promptFile);
                if (!fs_1.default.existsSync(filePath)) {
                    console.error("❌ 파일이 존재하지 않음:", filePath);
                }
                systemPrompt = fs_1.default.readFileSync(filePath, 'utf8');
                //console.log("✅ 시스템 프롬프트 로드 완료:", filePath);
            }
            catch (error) {
                console.error("Error reading prompt file:", error);
            }
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
            const translations = {};
            await Promise.all(languages.map(async (lang) => {
                const inputText = batchData.map(row => {
                    if (Array.isArray(row)) {
                        return `${row[0]}, ${row[1]}, ${row[2]}`; //배열 형태로 가정
                    }
                    else {
                        return `${row.key}, ${row.type}, ${row.text}`; //객체 형태로 가정
                    }
                }).join("\n");
                const prompt = systemPrompt.replaceAll("{{language_code}}", lang);
                const gptResult = await (0, openai_1.sendToOpenAI)(inputText, prompt);
                const translationMap = parseTranslationTextToMap(gptResult);
                (0, logger_1.saveGptDebugLogs)(batchId, lang, prompt, gptResult, translationMap);
                translations[lang] = translationMap;
                //console.log(`✅ ${lang} 번역 완료:`, translationMap);
            }));
            (0, logger_2.saveTranslationsToFile)(batchId, translations);
            //번역 결과를 콜백 URL로 전송
            //console.log(`📤 콜백 URL로 번역 결과 전송: ${callbackUrl}`);
            await (0, webhook_1.sendToWebhook)(callbackUrl, {
                batchId,
                isLastBatch,
                sheetName,
                translations
            });
        }));
        res.status(200).json({ status: "OK", forwarded: true });
        //console.log("✅ 배치 번역 완료:", batchId, isLastBatch, languages);
    }
    catch (err) {
        //console.error("Error in /ai/batch-translate", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
function parseTranslationTextToMap(text) {
    const lines = text.split("\n").filter(line => line.trim() !== "");
    const map = {};
    const allowedTypes = [
        "label", "desc", "title", "radio", "checkbox",
        "btn", "toggle", "option", "dropdown", "etc", "sequence"
    ];
    for (const line of lines) {
        const [keyPart, ...rest] = line.split(",");
        const key = keyPart.trim();
        const valueRaw = rest.join(",").trim();
        const typeRegex = new RegExp(`^(${allowedTypes.join("|")})\\s*,?\\s*`, "i");
        const value = valueRaw.replace(typeRegex, "").trim();
        if (key && value) {
            map[key] = value;
        }
    }
    return map;
}
exports.default = router;
