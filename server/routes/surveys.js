const express = require('express');
const router = express.Router();
const {
  createSurvey,
  getMySurveys,
  getSurveyById,
  getPublicSurvey,
  updateSurvey,
  deleteSurvey,
  getSurveyAnalytics,
} = require('../controllers/surveyController');
const { protect } = require('../middleware/auth');

// Public
router.get('/public/:shareId', getPublicSurvey);

// Protected
router.use(protect);

router.post('/', createSurvey);
router.get('/', getMySurveys);
router.get('/:id', getSurveyById);
router.put('/:id', updateSurvey);
router.delete('/:id', deleteSurvey);
router.get('/:id/analytics', getSurveyAnalytics);

module.exports = router;
