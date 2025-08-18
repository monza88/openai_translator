"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendSheetData = exports.updateSheetData = exports.getSheetData = void 0;
const googleapis_1 = require("googleapis");
// ✅ 1. 인증 객체 생성 (서비스 계정용)
const auth = new googleapis_1.google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const getSheetData = async (sheetName, startRow = 1) => {
    const client = await auth.getClient();
    const sheets = googleapis_1.google.sheets({ version: 'v4', auth });
    const sheetId = process.env.MASTER_SHEET_ID;
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: sheetName
    });
    const values = response.data.values ?? [];
    if (values.length === 0)
        return [];
    // ✅ 헤더 추출 및 순서 보장
    const headers = values[0];
    const rows = values.slice(startRow);
    return rows.map((row) => {
        const obj = {};
        headers.forEach((h, i) => {
            obj[h] = row[i] ?? '';
        });
        return obj;
    });
};
exports.getSheetData = getSheetData;
const updateSheetData = async (sheetName, startRow, jsonData) => {
    const client = await auth.getClient();
    const sheets = googleapis_1.google.sheets({ version: 'v4', auth });
    const sheetId = process.env.MASTER_SHEET_ID;
    // ✅ 헤더 추출
    const headers = Object.keys(jsonData[0]);
    // ✅ 입력받은 파라미터 데이터, 2차원 배열 구조 변경
    const values = jsonData.map((obj) => headers.map((key) => obj[key] ?? ''));
    // ✅ 시작 범위 지정
    const startCell = `A${startRow}`;
    const range = `${sheetName}!${startCell}`;
    console.log("▶ updateSheetData called", { range, values });
    const response = await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: { values }
    });
    return {
        message: `✅ ${sheetName} 시트 ${startCell}부터 ${values.length}행 덮어쓰기 완료`,
        updatedRange: response.data.updatedRange
    };
};
exports.updateSheetData = updateSheetData;
const appendSheetData = async (sheetName, jsonData) => {
    const client = await auth.getClient();
    const sheets = googleapis_1.google.sheets({ version: 'v4', auth });
    const sheetId = process.env.MASTER_SHEET_ID;
    // ✅ 헤더 추출
    const headers = Object.keys(jsonData[0]);
    // ✅ 입력받은 파라미터 데이터, 2차원 배열 구조 변경
    const values = jsonData.map((obj) => headers.map((key) => obj[key] ?? ''));
    const response = await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'INSERT_ROWS',
        requestBody: { values }
    });
    return {
        message: `✅ ${sheetName} 시트에 ${values.length}개의 행 추가 완료`,
        updatedRange: response.data.updates?.updatedRange
    };
};
exports.appendSheetData = appendSheetData;
