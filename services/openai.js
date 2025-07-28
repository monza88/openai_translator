"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToOpenAI = sendToOpenAI;
const axios_1 = __importDefault(require("axios"));
function sendToOpenAI(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const apiKey = process.env.OPENAI_API_KEY;
        const response = yield axios_1.default.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
        }, {
            header: {
                Authorization: `Bearer ${apiKey}`,
                "Content-type": "application/json",
            },
        });
        const message = ((_c = (_b = (_a = response.data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || "";
        return message.trim();
    });
}
//# sourceMappingURL=openai.js.map