const { Diaries, DiaryImg, DiaryEmotion } = require('../models/config');

// 이미지 URL 추출 함수
const extractImageUrls = (markdown) => {
  const regex = /!\[.*?\]\((.*?)\)/g;
  const urls = [];
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    urls.push(match[1]);
  }
  return urls;
};

// 나의 일기 목록 조회
const getMyDiaryList = async (req, res) => {
  const userId = req.user.uid;

  try {
    const diaries = await Diaries.findAll({
      where: { user_id: userId },
      attributes: ['id', 'title', 'content', 'is_public', 'createdAt'],
      order: [['createdAt', 'desc']]
    });

    res.json(diaries);
  } catch (error) {
    res.status(500).json({ message: '리스트 불러오기 실패' });
  }
};

// 일기 생성
const createDiary = async (req, res) => {
  try {
    const { title, content, user_id, userEmotion, diary_img, selectEmotion } = req.body;

    // 1. 일기 저장
    const diary = await Diaries.create({
      title,
      content,
      user_id,
      is_public: true // 필요 시 값 수정 가능
    });

    // 2. 이미지 저장
    const imageUrls = Array.isArray(diary_img) ? diary_img : extractImageUrls(content);
    if (imageUrls.length > 0) {
      const imgRows = imageUrls.map((url) => ({
        diary_id: diary.id,
        image_url: url
      }));
      await DiaryImg.bulkCreate(imgRows);
    }

    // 3. 감정 로그 저장
    await DiaryEmotion.create({
      diary_id: diary.id,
      user_id: user_id,
      userEmotion: userEmotion,             
      selectEmotion: selectEmotion, 
      date: new Date()
    });

    res.status(201).json({ success: true, diary_id: diary.id });
  } catch (err) {
    console.error('글 저장 실패:', err);
    res.status(500).json({ success: false, message: '글 저장 실패' });
  }
};

module.exports = { createDiary, getMyDiaryList };
