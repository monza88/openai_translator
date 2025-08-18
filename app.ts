import express from 'express';
import batchTranslate from './routes/ai';
import { getSheetData, updateSheetData } from './services/googleSheet';   

const app = express();

app.get("/", (req, res) => {
    res.send("OpenAI Translator API is running");   
});

app.use(express.json()); //JSON 파싱 미들웨어
app.use("/ai", batchTranslate); //ai 경로 등록


export default app;

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});