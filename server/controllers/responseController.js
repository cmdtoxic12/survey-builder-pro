const Response = require('../models/Response');
const Survey = require('../models/Survey');

exports.submitResponse = async (req, res) => {
  try {
    const { surveyId, answers, isAnonymous } = req.body;

    const survey = await Survey.findById(surveyId);
    if (!survey) return res.status(404).json({ message: 'Survey not found' });

    if (survey.status !== 'published') {
      return res.status(400).json({ message: 'Survey is not open for responses' });
    }

    if (survey.expiresAt && new Date() > survey.expiresAt) {
      return res.status(410).json({ message: 'Survey has expired' });
    }

    // Basic validation of required questions
    for (const q of survey.questions) {
      if (q.required) {
        const ans = answers.find((a) => a.questionId === q.id);
        if (!ans || ans.value === '' || ans.value === null || (Array.isArray(ans.value) && ans.value.length === 0)) {
          return res.status(400).json({ message: `Question "${q.question}" is required` });
        }
      }
    }

    const response = await Response.create({
      survey: surveyId,
      answers,
      respondent: req.user ? req.user._id : null,
      isAnonymous: isAnonymous !== false,
      ipAddress: req.ip || '',
    });

    res.status(201).json({ message: 'Response submitted successfully', id: response._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getResponses = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.surveyId);
    if (!survey) return res.status(404).json({ message: 'Survey not found' });

    if (survey.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const responses = await Response.find({ survey: req.params.surveyId })
      .populate('respondent', 'name email')
      .sort({ createdAt: -1 });

    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.exportResponses = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.surveyId);
    if (!survey) return res.status(404).json({ message: 'Survey not found' });

    if (survey.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const responses = await Response.find({ survey: req.params.surveyId });

    // Build CSV
    const headers = ['Response ID', 'Submitted At', 'Anonymous', ...survey.questions.map((q) => q.question)];
    const rows = responses.map((r) => {
      const row = [
        r._id.toString(),
        r.createdAt.toISOString(),
        r.isAnonymous ? 'Yes' : 'No',
      ];
      survey.questions.forEach((q) => {
        const ans = r.answers.find((a) => a.questionId === q.id);
        let val = ans ? ans.value : '';
        if (Array.isArray(val)) val = val.join('; ');
        row.push(`"${String(val).replace(/"/g, '""')}"`);
      });
      return row.join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="survey-${survey._id}-responses.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
