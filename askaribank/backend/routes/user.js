const express = require('express');
const { 
  updateProfile, 
  toggleCardStatus, 
  updateSettings, 
  addTransaction,
  purchaseCard,
  transferMoney,
  requestTransferOtp,
  confirmTransferOtp,
  generateOtp,
  verifyOtp,
  sendMoney,
  getBeneficiaries,
  getTransactions,
  rechargeWallet
} = require('../controllers/user');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All user routes are protected
router.use(protect);

router.put('/profile', updateProfile);
router.post('/cards/purchase', purchaseCard);
router.put('/cards/:cardId', toggleCardStatus);
router.put('/settings', updateSettings);
router.post('/transactions', addTransaction);
router.get('/transactions', getTransactions);
router.post('/transfer', transferMoney);
router.post('/transfer/request-otp', requestTransferOtp);
router.post('/transfer/confirm-otp', confirmTransferOtp);
router.post('/generate-otp', generateOtp);
router.post('/verify-otp', verifyOtp);
router.post('/send-money', sendMoney);
router.get('/beneficiaries', getBeneficiaries);
router.post('/recharge', rechargeWallet);

module.exports = router;
