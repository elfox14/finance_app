const express = require('express');
const router = express.Router();
const { getCards, createCard, deleteCard } = require('../controllers/cardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getCards)
    .post(createCard);

router.route('/:id')
    .delete(deleteCard);

module.exports = router;
