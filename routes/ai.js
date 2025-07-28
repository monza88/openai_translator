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
const express_1 = __importDefault(require("express"));
const webhook_1 = require("../services/webhook");
const router = express_1.default.Router();
//Post /ai/process
router.post("/process", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { prompt, webhookUrl } = req.body;
        if (!prompt || !webhookUrl) {
            return res.status(400).json({ error: "Missing prompt or webhookUrl" });
        }
        const aiResponse = yield .sendToOpenAI(prompt);
        yield (0, webhook_1.sendToWebhook)(webhookUrl, { result: aiResponse });
        res.status(200).json({ status: "OK", forwarded: true });
    }
    catch (err) {
        console.error("Error in /ai/process", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
exports.default = router;
//# sourceMappingURL=ai.js.map