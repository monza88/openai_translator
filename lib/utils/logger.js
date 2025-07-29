"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveGptDebugLogs = saveGptDebugLogs;
exports.saveTranslationsToFile = saveTranslationsToFile;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // 환경 변수 로드
const logDir = path_1.default.join(__dirname, "../../logs");
const DEBUG_LOG = String(process.env.DEBUG_LOG).toLocaleLowerCase() === "true"; // 환경 변수로 디버그 로그 활성화 여부 설정
//Logs 디렉토리가 없으면 생성
if (!fs_1.default.existsSync(logDir) && DEBUG_LOG) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
function saveGptDebugLogs(batchId, lang, prompt, gptResult, translationMap) {
    console.log("🔥 DEBUG_LOG:", DEBUG_LOG);
    if (!DEBUG_LOG) {
        return; // 디버그 로그가 비활성화된 경우 함수 종료
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // ISO 8601 형식의 타임스탬프 생성
    const prefix = `${timestamp}-${batchId}-${lang}`;
    try {
        fs_1.default.writeFileSync(path_1.default.join(logDir, `${prefix}-prompt.txt`), prompt, 'utf8');
        fs_1.default.writeFileSync(path_1.default.join(logDir, `${prefix}-gpt-result.txt`), gptResult, 'utf8');
        fs_1.default.writeFileSync(path_1.default.join(logDir, `${prefix}-translation-map.json`), JSON.stringify(translationMap, null, 2), 'utf8');
        console.log(`Logs saved for batch ${batchId}, language ${lang}`);
    }
    catch (error) {
        console.error(`Error saving logs for batch ${batchId}, language ${lang}:`, error);
    }
}
function saveTranslationsToFile(batchId, translations) {
    if (!DEBUG_LOG) {
        return; // 디버그 로그가 비활성화된 경우 함수 종료
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // ISO 8601 형식의 타임스탬프 생성
    const fileName = `${timestamp}-${batchId}-translations.json`;
    const filePath = path_1.default.join(logDir, fileName);
    try {
        fs_1.default.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf8');
        console.log(`✅Objects wrote as a file ${filePath}`);
    }
    catch (error) {
        console.error(`🔥Error saving translations to file:`, error);
    }
}
