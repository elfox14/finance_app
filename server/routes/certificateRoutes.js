const express = require('express');
const router = express.Router();
const { getCertificates, createCertificate, updateCertificate, deleteCertificate } = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getCertificates)
    .post(createCertificate);

router.route('/:id')
    .put(updateCertificate)
    .delete(deleteCertificate);

module.exports = router;
