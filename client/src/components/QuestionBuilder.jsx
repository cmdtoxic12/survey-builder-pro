import { useState } from 'react';

const QUESTION_TYPES = [
  { value: 'short-answer', label: 'Short Answer' },
  { value: 'long-answer', label: 'Long Answer' },
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'checkboxes', label: 'Checkboxes' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'rating', label: 'Rating (1–5)' },
  { value: 'yes-no', label: 'Yes / No' },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function QuestionBuilder({ questions, setQuestions }) {
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: uid(),
        type: 'short-answer',
        question: '',
        options: [],
        required: false,
      },
    ]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== id) return q;
        const updated = { ...q, [field]: value };
        // Reset options when switching to non-option types
        if (field === 'type') {
          if (['multiple-choice', 'checkboxes', 'dropdown'].includes(value)) {
            updated.options = q.options.length ? q.options : ['Option 1'];
          } else if (value === 'yes-no') {
            updated.options = ['Yes', 'No'];
          } else if (value === 'rating') {
            updated.options = ['1', '2', '3', '4', '5'];
          } else {
            updated.options = [];
          }
        }
        return updated;
      })
    );
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const addOption = (qId) => {
    setQuestions(
      questions.map((q) =>
        q.id === qId ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] } : q
      )
    );
  };

  const updateOption = (qId, idx, value) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== qId) return q;
        const options = [...q.options];
        options[idx] = value;
        return { ...q, options };
      })
    );
  };

  const removeOption = (qId, idx) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== qId) return q;
        return { ...q, options: q.options.filter((_, i) => i !== idx) };
      })
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Questions</h3>
        <button type="button" className="btn btn-outline btn-sm" onClick={addQuestion}>
          + Add Question
        </button>
      </div>

      {questions.length === 0 && (
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          No questions yet. Click “Add Question” to start.
        </p>
      )}

      {questions.map((q, index) => (
        <div key={q.id} className="question-item">
          <div className="question-header">
            <strong>Q{index + 1}</strong>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => removeQuestion(q.id)}>
              Remove
            </button>
          </div>

          <div className="form-group">
            <label>Question text</label>
            <input
              className="form-control"
              value={q.question}
              onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
              placeholder="Enter your question"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
              <label>Type</label>
              <select
                className="form-control"
                value={q.type}
                onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={q.required}
                  onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)}
                />
                Required
              </label>
            </div>
          </div>

          {['multiple-choice', 'checkboxes', 'dropdown'].includes(q.type) && (
            <div className="options-list">
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Options</label>
              {q.options.map((opt, idx) => (
                <div key={idx} className="option-row">
                  <input
                    className="form-control"
                    value={opt}
                    onChange={(e) => updateOption(q.id, idx, e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => removeOption(q.id, idx)}
                    disabled={q.options.length <= 1}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-outline btn-sm" onClick={() => addOption(q.id)}>
                + Option
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
