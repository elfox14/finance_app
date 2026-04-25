const express = require('express');
const router = express.Router();
const { getPeerDebts, createPeerDebt, toggleStatus, deletePeerDebt } = require('../controllers/peerDebtController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getPeerDebts)
    .post(createPeerDebt);

router.route('/:id')
    .patch(toggleStatus)
    .delete(deletePeerDebt);

module.exports = router;
