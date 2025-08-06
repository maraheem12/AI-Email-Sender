import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

export default function App() {
  const [recipients, setRecipients] = useState('');
  const [prompt, setPrompt] = useState('');
  const [subject, setSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;

    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post(`${API_BASE}/generate-email`, { prompt });
      setEmailBody(res.data.email);
      // Attempt to auto-generate subject from first line or placeholder
      const firstLine = res.data.email.split('\n')[0];
      setSubject(firstLine.length < 100 ? firstLine : subject);
    } catch (err) {
      console.error(err);
      setMessage('Failed to generate email');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const recipsArray = recipients.split(/[,;\s]+/).filter(Boolean);
    if (!recipsArray.length || !subject || !emailBody) {
      setMessage('Recipients, subject and email body are required');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      await axios.post(`${API_BASE}/send-email`, {
        recipients: recipsArray,
        subject,
        content: emailBody
      });
      setMessage('Email sent successfully');
    } catch (err) {
      console.error(err);
      setMessage('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>AI Email Sender</h1>
      <div className="form-group">
        <label>Recipients (comma or space separated)</label>
        <input
          type="text"
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          placeholder="example@example.com, test@test.com"
        />
      </div>

      <div className="form-group">
        <label>Prompt for Email</label>
        <textarea
          rows="3"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Explain the context or purpose of the email..."
        />
      </div>

      <button onClick={handleGenerate} disabled={loading || !prompt}>
        {loading ? 'Generating...' : 'Generate Email'}
      </button>

      {emailBody && (
        <>
          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Email Body</label>
            <textarea
              rows="10"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
            />
          </div>
          <button onClick={handleSend} disabled={loading}>
            {loading ? 'Sending...' : 'Send Email'}
          </button>
        </>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
}
