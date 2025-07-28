import express from 'express';
import aiRoutes from './routes/ai';

const app = express();

app.use(express.json()); //JSON 파싱 미들웨어
app.use("/ai", aiRoutes); //ai 경로 등록

export default app;