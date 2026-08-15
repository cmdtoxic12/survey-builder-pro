const express = require('express');
const router = express.Router();
const { submitResponse, getResponses, exportResponses } = require('../controllers/responseController');
const { protect } = require('../middleware/auth');

// Public submit (optional auth)
router.post('/', (req, res, next) => {
  // Try to attach user if token present, but don't require
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    return protect(req, res, () => submitResponse(req, res));
  }
  return submitResponse(req, res);
});

// Protected
router.get('/survey/:surveyId', protect, getResponses);
router.get('/survey/:surveyId/export', protect, exportResponses);

module.exports = router;
