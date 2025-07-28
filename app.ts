import express from 'express';
import aiRoutes from './routes/ai';
import 'dotenv/config'; // 환경 변수 로드

const app = express();

app.get("/", (req, res) => {
    res.send("OpenAI Translator API is running");   
});

app.use(express.json()); //JSON 파싱 미들웨어
app.use("/ai", aiRoutes); //ai 경로 등록

export default app;

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});