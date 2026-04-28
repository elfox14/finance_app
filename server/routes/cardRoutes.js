const express = require('express');
const router = express.Router();
const { 
    getCards, 
    createCard, 
    updateCard, 
    deleteCard,
    addCardTransaction,
    getCardDetails,
    addCardPayment,
    reconcileTransaction
} = require('../controllers/cardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getCards)
    .post(createCard);

router.post('/action', addCardTransaction);
router.post('/payment', addCardPayment);
router.put('/transaction/:id/reconcile', reconcileTransaction);
router.get('/details/:id', getCardDetails);

router.route('/:id')
    .put(updateCard)
    .delete(deleteCard);

module.exports = router;
