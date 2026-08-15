const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      'short-answer',
      'long-answer',
      'multiple-choice',
      'checkboxes',
      'dropdown',
      'rating',
      'yes-no',
    ],
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    default: [],
  },
  required: {
    type: Boolean,
    default: false,
  },
});

const surveySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'General',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questions: [questionSchema],
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'draft',
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    allowAnonymous: {
      type: Boolean,
      default: true,
    },
    shareId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

// Generate shareId before save if published
surveySchema.pre('save', function (next) {
  if (this.status === 'published' && !this.shareId) {
    this.shareId = require('crypto').randomBytes(8).toString('hex');
  }
  next();
});

module.exports = mongoose.model('Survey', surveySchema);
