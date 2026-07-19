const mongoose = require('mongoose');
const FAQ = require('../models/FAQ');
const AuditLog = require('../models/AuditLog');

const MAX_QUESTION_LENGTH = 500;
const MAX_ANSWER_LENGTH = 5000;

const validateFaqInput = ({ question, answer }) => {
  if (typeof question !== 'string' || typeof answer !== 'string') {
    return 'Question and answer must be text.';
  }
  if (!question.trim() || !answer.trim()) {
    return 'Question and answer are required.';
  }
  if (question.trim().length > MAX_QUESTION_LENGTH || answer.trim().length > MAX_ANSWER_LENGTH) {
    return `Question must be at most ${MAX_QUESTION_LENGTH} characters and answer at most ${MAX_ANSWER_LENGTH} characters.`;
  }
  return null;
};

const getAllFAQs = async (_req, res) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json(faqs);
  } catch (_err) {
    return res.status(500).json({ success: false, message: 'Unable to load FAQs' });
  }
};

const addNewFAQ = async (req, res) => {
  const validationError = validateFaqInput(req.body || {});
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  try {
    const faq = await FAQ.create({
      question: req.body.question.trim(),
      answer: req.body.answer.trim(),
    });
    await AuditLog.create({
      actor: req.user.id,
      action: 'faq.created',
      targetType: 'FAQ',
      targetId: faq._id,
    });
    return res.status(201).json(faq);
  } catch (_err) {
    return res.status(500).json({ success: false, message: 'Unable to create FAQ' });
  }
};

const deleteFAQ = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid FAQ identifier' });
  }

  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    await AuditLog.create({
      actor: req.user.id,
      action: 'faq.deleted',
      targetType: 'FAQ',
      targetId: faq._id,
      metadata: { question: faq.question },
    });
    return res.status(200).json({ success: true, message: 'FAQ removed' });
  } catch (_err) {
    return res.status(500).json({ success: false, message: 'Unable to delete FAQ' });
  }
};

module.exports = { getAllFAQs, addNewFAQ, deleteFAQ };
