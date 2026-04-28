const express = require('express');
const router = express.Router();
const { 
    getAccounts, 
    createAccount, 
    updateAccount, 
    deleteAccount,
    adjustBalance,
    reconcileAccount
} = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getAccounts)
    .post(createAccount);

router.post('/:id/adjust', adjustBalance);
router.put('/:id/reconcile', reconcileAccount);

router.route('/:id')
    .put(updateAccount)
    .delete(deleteAccount);

module.exports = router;
