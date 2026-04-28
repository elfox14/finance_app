const express = require('express');
const router = express.Router();
const { createTransaction, getTransactions, updateTransactionStatus } = require('../controllers/transactionController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createTransaction);
router.get('/', protect, getTransactions);
router.put('/:id/status', protect, updateTransactionStatus);

module.exports = router;
