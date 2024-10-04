const express = require('express');
const router = express.Router();
const path = require('path');


// Aboutページのルート
router.get('/', (req, res) => {
    //res.send('ここはaboutページです');
    res.sendFile(path.join(__dirname, 'about.html'));
});

module.exports = router;
