const router = require('express').Router();
const {getEmotions} = require('../controllers/emotion.controller')

router.get('/emotionAll', getEmotions);

module.exports = router;