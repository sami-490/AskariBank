const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getAllUsers,
  createUser,
  updateUserStatus,
  adjustBalance,
  deleteUser,
  getAllTransactions,
  reverseTransaction,
  getLoans,
  processLoan,
  getInstitutions,
  addInstitution,
  getZakatMetrics,
  disburseZakat,
  getGoldVault,
  updateGoldPricing,
  getSupportTickets,
  replySupportTicket,
  getSecurityLogs,
  changePassword
} = require('../controllers/admin');

// Apply protection and admin middleware globally to all admin routes
router.use(protect);
router.use(admin);

// Admin self security routes
router.post('/change-password', changePassword);

// User & Profile Management routes
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:userId/status', updateUserStatus);
router.post('/users/:userId/adjust-balance', adjustBalance);
router.delete('/users/:userId', deleteUser);

// Transaction audit routes
router.get('/transactions', getAllTransactions);
router.post('/transactions/:transactionId/reverse', reverseTransaction);

// Loan processing routes
router.get('/loans', getLoans);
router.post('/loans/:loanId/status', processLoan);

// Fee Portal routes
router.get('/institutions', getInstitutions);
router.post('/institutions', addInstitution);

// Zakat metrics & disbursements routes
router.get('/zakat', getZakatMetrics);
router.post('/zakat/disburse', disburseZakat);

// Gold reserves & live spread pricing routes
router.get('/gold', getGoldVault);
router.post('/gold/pricing', updateGoldPricing);

// Tickets & Compliance audit trails routes
router.get('/tickets', getSupportTickets);
router.post('/tickets/:ticketId/reply', replySupportTicket);
router.get('/security-logs', getSecurityLogs);

module.exports = router;
