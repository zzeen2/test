// routes/auth.js
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { saveKakaoUser } = require('../controllers/login.controller');
const { Users } = require('../models/config');

// 카카오 로그인 시작 (카카오 인증 URL 리턴)
router.get('/kakao', (req, res) => {
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}`;
  res.json({ url: kakaoAuthUrl });
});

// 카카오 로그인 콜백 처리
router.get('/kakao_login', async (req, res) => {
  const { code } = req.query;
  try {
    const tokenRes = await axios.post('https://kauth.kakao.com/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_CLIENT_ID,
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
        code,
        client_secret: process.env.KAKAO_CLIENT_SECRET_KEY || undefined,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const kakaoUser = userRes.data;
    const kakaoId = Number(kakaoUser.id);
    const nickname = kakaoUser.properties?.nickname ?? ''; 
    const profile = kakaoUser.properties?.profile_image ?? ''; 


    const { ok, user, message } = await saveKakaoUser(kakaoId, nickname, profile);
    if (!ok) return res.status(500).json({ message });

    const token = jwt.sign({ userId: user.uid }, process.env.JWT_SECRET, {
      expiresIn: '7d', 
    });

    // JWT를 쿠키에 저장
    res.cookie('token', token, {
      httpOnly: true,  
      secure: false,   
      sameSite: 'Lax', 
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.redirect('http://localhost:3000/main'); // 로그인 후 메인 페이지로 리다이렉트
  } catch (err) {
    console.error('카카오 로그인 실패:', err.message);
    res.status(500).json({ success: false, message: '카카오 로그인 실패' });
  }
});

// 로그아웃 처리
router.get('/logout', (req, res) => {
  res.clearCookie('token'); // 쿠키에서 JWT 삭제
  res.redirect('http://localhost:3000/'); // 로그아웃 후 메인 페이지로 리다이렉트
});

router.get('/user', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: '로그인 필요' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Users.findByPk(decoded.userId);

    if (!user) return res.status(404).json({ message: '유저 없음' });

    res.json({
      nickname: user.nick_name,
      profile: user.profile_image,
      uid: user.uid,
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: '인증 실패' });
  }
});

// 앱 전용 로그인 (인가 코드를 받아 토큰 교환 및 유저 정보 저장)
router.post('/kakaoapp', async (req, res) => {
  console.log("안녕나야")
  const { code, redirectUri } = req.body; // code와 redirectUri를 body에서 받습니다.
  console.log(code, redirectUri)

  if (!code) {
    return res.status(400).json({ message: '인가 코드 누락' });
  }

  try {
    // 1. 인가 코드로 카카오 토큰 받기 (웹용과 동일한 로직)
    const tokenRes = await axios.post('https://kauth.kakao.com/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_CLIENT_ID,
        redirect_uri: redirectUri, // 앱에서 보내준 redirectUri 사용
        code,
        // client_secret: process.env.KAKAO_CLIENT_SECRET_KEY || undefined,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const accessToken = tokenRes.data.access_token;
    console.log("백엔드: 카카오 Access Token 획득 완료.");

    // 2. Access Token으로 카카오 사용자 정보 가져오기
    const userRes = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const kakaoUser = userRes.data;
    const kakaoId = Number(kakaoUser.id);
    const nickname = kakaoUser.properties?.nickname ?? '';
    const profile = kakaoUser.properties?.profile_image ?? '';
    console.log("백엔드: 카카오 사용자 정보 획득:", { kakaoId, nickname, profile });

    // 3. DB에 유저 정보 저장/업데이트
    const { ok, user, message } = await saveKakaoUser(kakaoId, nickname, profile);
    if (!ok) {
        console.error("saveKakaoUser 실패:", message);
        return res.status(500).json({ message: message || 'DB 저장 실패' });
    }
    console.log("백엔드: DB 저장/업데이트 완료. User UID:", user.uid);

    // 4. JWT 생성 및 응답
    const token = jwt.sign({ userId: user.uid }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    console.log("백엔드: JWT 생성 완료.");

    res.json({
      token,
      user: {
        uid: user.uid,
        nickname: user.nick_name,
        profile: user.profile_image,
      },
    });
  } catch (err) {
    console.error('앱 카카오 로그인 실패 (백엔드 처리 중):', err.response ? err.response.data : err.message);
    res.status(500).json({ message: '카카오 로그인 처리 실패', error: err.response?.data || err.message });
  }
});

// ... 나머지 코드 ...


module.exports = router; // 라우터 내보내기
