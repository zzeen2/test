const express = require('express');
const router = express.Router();
const { DiaryEmotion, Emotion } = require('../models');

// 감정만 저장
router.post('/saveEmotionOnly', async (req, res) => {
    try {
        const { userId, emotionType, date } = req.body;

        const found = await Emotion.findByPk(emotionType);
        if (!found) return res.status(400).json({ error: '유효하지 않은 감정 ID입니다.' });

        const exists = await DiaryEmotion.findOne({ where: { user_id: userId, date },});

        if (exists) {
            return res.status(409).json({ error: '이미 감정을 저장했습니다.' });
        }

        // 저장
        await DiaryEmotion.create({ user_id: userId, userEmotion: emotionType, date,});

    return res.status(200).json({ message: '감정 저장 성공' });
    } catch (err) {
        console.error('감정 저장 오류:', err);
    return res.status(500).json({ error: '서버 오류' });
    }
});

module.exports = router;
