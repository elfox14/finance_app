const express = require('express');
const router = express.Router();
const { 
    getCards, 
    createCard, 
    updateCard, 
    deleteCard,
    addCardAction 
} = require('../controllers/cardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getCards)
    .post(createCard);

router.post('/action', addCardAction);

router.route('/:id')
    .put(updateCard)
    .delete(deleteCard);

module.exports = router;
