const express = require('express');
const router = express.Router();
const { 
    getPeerDebts, 
    createPeerDebt, 
    updatePeerDebt, 
    deletePeerDebt,
    recordPayment 
} = require('../controllers/peerDebtController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getPeerDebts)
    .post(createPeerDebt);

router.post('/payment', recordPayment);

router.route('/:id')
    .put(updatePeerDebt)
    .delete(deletePeerDebt);

module.exports = router;
