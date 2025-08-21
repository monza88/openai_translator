"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ai_1 = __importDefault(require("./routes/ai"));
const app = (0, express_1.default)();
app.get("/", (req, res) => {
    res.send("OpenAI Translator API is running");
});
app.use(express_1.default.json()); //JSON 파싱 미들웨어
app.use("/ai", ai_1.default); //ai 경로 등록
exports.default = app;
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
