const { Users } = require('../models/config');


 saveKakaoUser = async (kakaoId, nickname, profile) => {
  try {
    const [user, created] = await Users.findOrCreate({
      where: { uid: kakaoId },                     // PRIMARY KEY
      defaults: { nick_name: nickname, profile_image: profile },
    });

    if (
      !created &&
      (user.nick_name !== nickname || user.profile_image !== profile)
    ) {
      await user.update({ nick_name: nickname, profile_image: profile });
    }

    return { ok: true, user };            
  } catch (err) {
    console.error(err);
    return { ok: false, message: 'DB 저장 실패' };
  }
};

module.exports = { saveKakaoUser };
