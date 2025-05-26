const router = require('express').Router();
const { createDiary } = require('../controllers/diary.controller')
const {upload }= require('../middleware/imgUpload');
const OpenAI = require('openai');


// 글 생성
router.post('/', createDiary)

// 업로드 
router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: '파일이 없음' });
  
    const fileUrl = `http://localhost:4000/uploads/${req.file.filename}`;
    res.status(200).json({ url: fileUrl });
  }); 


  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  
  router.post('/analyze', async (req, res) => {
    const { content } = req.body;
  
    if (!content) {
      return res.status(400).json({ message: '일기 내용이 필요합니다.' });
    }
  
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `
  다음 일기 내용에서 주된 감정을 하나의 단어로 알려줘. (예: 행복, 슬픔, 분노, 평온, 불안, 피곤, 신남, 혼란)
  일기 내용: "${content}"
  감정:`,
          },
        ],
        temperature: 0.5,
        max_tokens: 10,
      });
  
      const emotion = response.choices[0].message.content.trim();
      res.json({ emotion });
    } catch (error) {
      console.error('감정 분석 오류:', error);
      res.status(500).json({ message: '감정 분석 실패', error: error.message });
    }
  });

module.exports = router