const express = require('express');
const router = express.Router();
const { getLoans, createLoan, deleteLoan } = require('../controllers/loanController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getLoans)
    .post(createLoan);

router.route('/:id')
    .put(updateLoan)
    .delete(deleteLoan);

module.exports = router;
