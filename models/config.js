const Sequalize = require("sequelize");
const Users = require('./user');
const Diaries = require('./diaries')
const Emotion = require('./emotion');
const Follow = require('./follow');
const Comment = require('./comment');
const DiaryImg = require('./diaryImg');
const DiaryEmotion = require('./diaryEmotion');

const sequelize = new Sequalize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
    {
        host : process.env.DATABASE_HOST,
        port : process.env.DATABASE_PORT,
        dialect : "mysql"
    }
)

const users = Users.init(sequelize);
const diaries = Diaries.init(sequelize);
const emotion = Emotion.init(sequelize);
const follow = Follow.init(sequelize);
const comment = Comment.init(sequelize);
const diaryImg = DiaryImg.init(sequelize);
const diaryEmotion = DiaryEmotion.init(sequelize);


const db = {
    Users : users,
    Diaries : diaries,
    Emotion : emotion,
    Follow : follow,
    Comment : comment,
    DiaryImg : diaryImg,
    DiaryEmotion : diaryEmotion,
    sequelize
};


sequelize.sync( { force : true } ).then(() => {
    console.log("database on~")
}).catch((err) => {
    console.log(err);
})

module.exports = db;

