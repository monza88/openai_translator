import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config(); // 환경 변수 로드

const logDir = path.join(__dirname, "../../logs");
const DEBUG_LOG = String(process.env.DEBUG_LOG).toLocaleLowerCase() === "true"; // 환경 변수로 디버그 로그 활성화 여부 설정


//Logs 디렉토리가 없으면 생성
if(!fs.existsSync(logDir) && DEBUG_LOG) {
    fs.mkdirSync(logDir, { recursive: true });
}

export function saveGptDebugLogs(
    batchId : string, 
    lang : string, 
    prompt : string, 
    gptResult : string, 
    translationMap : Record<string, string>
) {
    console.log("🔥 DEBUG_LOG:", DEBUG_LOG);
    if (!DEBUG_LOG) {
        return; // 디버그 로그가 비활성화된 경우 함수 종료
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // ISO 8601 형식의 타임스탬프 생성
    const prefix = `${timestamp}-${batchId}-${lang}`;

    try {
        fs.writeFileSync(path.join(logDir, `${prefix}-prompt.txt`), prompt, 'utf8');
        fs.writeFileSync(path.join(logDir, `${prefix}-gpt-result.txt`), gptResult, 'utf8');
        fs.writeFileSync(path.join(logDir, `${prefix}-translation-map.json`), JSON.stringify(translationMap, null, 2), 'utf8');

        console.log(`Logs saved for batch ${batchId}, language ${lang}`);
    } catch (error) {
        console.error(`Error saving logs for batch ${batchId}, language ${lang}:`, error);
    }
}

export function saveTranslationsLog(
    batchId: string,
    translations: Record<string, string>
) {
    if (!DEBUG_LOG) {
        return; // 디버그 로그가 비활성화된 경우 함수 종료
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // ISO 8601 형식의 타임스탬프 생성
    const fileName = `${timestamp}-${batchId}-translations.json`;

    try {
        fs.writeFileSync(path.join(logDir, fileName), JSON.stringify(translations, null, 2), 'utf8');
        console.log(`Translations log saved for batch ${batchId}`);
    } catch (error) {
        console.error(`Error saving translations log for batch ${batchId}:`, error);
    }
}