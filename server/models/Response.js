const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // string, number, or array
    required: true,
  },
});

const responseSchema = new mongoose.Schema(
  {
    survey: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Survey',
      required: true,
    },
    answers: [answerSchema],
    respondent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isAnonymous: {
      type: Boolean,
      default: true,
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Index for faster queries
responseSchema.index({ survey: 1 });

module.exports = mongoose.model('Response', responseSchema);
