const Survey = require('../models/Survey');
const Response = require('../models/Response');
const crypto = require('crypto');

exports.createSurvey = async (req, res) => {
  try {
    const { title, description, category, questions, expiresAt, allowAnonymous } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const survey = await Survey.create({
      title,
      description,
      category: category || 'General',
      creator: req.user._id,
      questions: questions || [],
      expiresAt: expiresAt || null,
      allowAnonymous: allowAnonymous !== false,
      status: 'draft',
    });

    res.status(201).json(survey);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMySurveys = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const filter = { creator: req.user._id };

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (category) filter.category = category;
    if (status) filter.status = status;

    const surveys = await Survey.find(filter).sort({ createdAt: -1 });
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSurveyById = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id).populate('creator', 'name email');
    if (!survey) return res.status(404).json({ message: 'Survey not found' });

    // Only creator can see draft details fully, but allow public published
    if (survey.status !== 'published' && survey.creator._id.toString() !== req.user?._id?.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(survey);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPublicSurvey = async (req, res) => {
  try {
    const survey = await Survey.findOne({ shareId: req.params.shareId, status: 'published' });
    if (!survey) return res.status(404).json({ message: 'Survey not found or not published' });

    if (survey.expiresAt && new Date() > survey.expiresAt) {
      return res.status(410).json({ message: 'Survey has expired' });
    }

    // Don't expose creator sensitive info
    res.json({
      _id: survey._id,
      title: survey.title,
      description: survey.description,
      questions: survey.questions,
      allowAnonymous: survey.allowAnonymous,
      shareId: survey.shareId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ message: 'Survey not found' });

    if (survey.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, category, questions, status, expiresAt, allowAnonymous } = req.body;

    if (title) survey.title = title;
    if (description !== undefined) survey.description = description;
    if (category) survey.category = category;
    if (questions) survey.questions = questions;
    if (status) {
      survey.status = status;
      if (status === 'published' && !survey.shareId) {
        survey.shareId = crypto.randomBytes(8).toString('hex');
      }
    }
    if (expiresAt !== undefined) survey.expiresAt = expiresAt;
    if (allowAnonymous !== undefined) survey.allowAnonymous = allowAnonymous;

    const updated = await survey.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ message: 'Survey not found' });

    if (survey.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Response.deleteMany({ survey: survey._id });
    await survey.deleteOne();
    res.json({ message: 'Survey deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSurveyAnalytics = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ message: 'Survey not found' });

    if (survey.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const responses = await Response.find({ survey: survey._id });

    const totalResponses = responses.length;
    const analytics = {
      totalResponses,
      questions: {},
    };

    survey.questions.forEach((q) => {
      const qResponses = responses
        .map((r) => r.answers.find((a) => a.questionId === q.id))
        .filter(Boolean);

      if (['multiple-choice', 'dropdown', 'yes-no', 'rating'].includes(q.type)) {
        const counts = {};
        qResponses.forEach((a) => {
          const val = String(a.value);
          counts[val] = (counts[val] || 0) + 1;
        });
        analytics.questions[q.id] = {
          type: q.type,
          question: q.question,
          distribution: counts,
          total: qResponses.length,
        };
      } else if (q.type === 'checkboxes') {
        const counts = {};
        qResponses.forEach((a) => {
          const vals = Array.isArray(a.value) ? a.value : [a.value];
          vals.forEach((v) => {
            counts[v] = (counts[v] || 0) + 1;
          });
        });
        analytics.questions[q.id] = {
          type: q.type,
          question: q.question,
          distribution: counts,
          total: qResponses.length,
        };
      } else {
        // text answers - just return list
        analytics.questions[q.id] = {
          type: q.type,
          question: q.question,
          answers: qResponses.map((a) => a.value).slice(0, 50), // limit
          total: qResponses.length,
        };
      }
    });

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
