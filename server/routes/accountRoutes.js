const express = require('express');
const router = express.Router();
const { 
    getAccounts, 
    createAccount, 
    updateAccount, 
    deleteAccount,
    adjustBalance
} = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getAccounts)
    .post(createAccount);

router.post('/:id/adjust', adjustBalance);

router.route('/:id')
    .put(updateAccount)
    .delete(deleteAccount);

module.exports = router;
