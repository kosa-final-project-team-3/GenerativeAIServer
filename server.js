import 'dotenv/config';
import express from 'express';
import cors from 'cors'; // cors 모듈 불러오기
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const port = 3000;
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// CORS 설정
const corsOptions = {
    origin: 'http://localhost:5173', // 허용할 도메인
    methods: 'GET, POST', // 허용할 HTTP 메서드
    allowedHeaders: 'Content-Type, Authorization', // 허용할 헤더
};

app.use(cors(corsOptions));
app.use(express.json());

function generateExerciseFeedbackPrompt(keywords) {
    return `
    당신은 전문 운동 트레이너입니다. 다음 키워드를 바탕으로 개인화된 운동 피드백 초안을 작성해 주세요:

    키워드: ${keywords.join(', ')}

    피드백 작성 시 다음 지침을 따라주세요:
    1. 주어진 키워드를 모두 활용하여 맥락에 맞는 피드백을 제공하세요.
    2. 긍정적이고 격려하는 톤을 유지하세요.
    3. 구체적인 운동 조언과 개선점을 제시하세요.
    4. 안전과 부상 예방에 대한 팁을 포함하세요.
    5. 다음 단계나 목표 설정에 대한 제안을 해주세요.
    6. 전체 피드백은 200-300단어 정도로 작성해 주세요.

    위 지침을 바탕으로 자연스럽고 개인화된 운동 피드백 초안을 작성해 주세요.
  `;
}

app.post('/generate-feedback', async (req, res) => {
    try {
        const { keywords } = req.body;
        const prompt = generateExerciseFeedbackPrompt(keywords);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const feedback = response.text();

        res.json({ generated_feedback: feedback });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while generating feedback' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
