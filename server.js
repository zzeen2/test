// npm i express ejs mysql2 jsonwebtoken dotenv bcrypt multer
require('dotenv').config();
const cors = require('cors')
require('./models/config')
const express = require("express");
const app = express();
const path = require("path");
const LoginRouter = require('./routers/login.router')
const MainRouter = require('./routers/main.router')
const cookieParser = require('cookie-parser');


app.set ("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({extended : false}))
app.use(cors({
    origin: ['*'],  // React 서버 주소, 4000번은 앱 포트 // 개발환경에서는 '*'로 설정해두고 해도 됨
    credentials: true  // 이거 해줘야 쿠기값 전달됌 중요!! 그리고 위에 *이걸로 보내면안됌...
  }));
app.use(cookieParser());
app.use('/test',(req,res) => {
  console.log("123")
  const appRedirectUrl = `moodcloudapp://login?success=true&redirectTo=Main`;

  // HTTP 302 Found (임시 리다이렉트) 응답으로 리다이렉트 URL을 보냅니다.
  res.redirect(appRedirectUrl);
})
app.use('/login', LoginRouter);
app.use('/main',  MainRouter)

app.listen(4000, (req,res)=> {
    console.log("server on")
})