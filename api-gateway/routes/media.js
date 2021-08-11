const express = require('express');
const router = express.Router();

const mediaHandler = require('./handlers/media');

router.post('/', mediaHandler.create);
router.get('/', mediaHandler.read);

module.exports = router;
