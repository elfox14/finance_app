const express = require('express');
const router = express.Router();
const { 
    getLoans, 
    createLoan, 
    updateLoan, 
    deleteLoan,
    recordPayment,
    getLoanDetails
} = require('../controllers/loanController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getLoans)
    .post(createLoan);

router.post('/payment', recordPayment);
router.get('/details/:id', getLoanDetails);

router.route('/:id')
    .put(updateLoan)
    .delete(deleteLoan);

module.exports = router;
