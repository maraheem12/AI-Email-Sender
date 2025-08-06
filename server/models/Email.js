import mongoose from 'mongoose';

const EmailSchema = new mongoose.Schema({
  recipients: [String],
  subject: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Email', EmailSchema);
