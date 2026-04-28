const express = require('express');
const router = express.Router();
const { getBudgets, setBudget, duplicateBudgets, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getBudgets)
    .post(setBudget);

router.post('/duplicate', duplicateBudgets);
router.delete('/:id', deleteBudget);

module.exports = router;
