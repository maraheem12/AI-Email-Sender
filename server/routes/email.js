import { Router } from 'express';
import nodemailer from 'nodemailer';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

router.post('/generate-email', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages: [
        {
          role: 'system',
          content: 'You are an assistant that writes professional email drafts.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    const emailText = response.choices[0]?.message?.content?.trim();

    return res.json({ email: emailText });
  } catch (err) {
    console.error('Groq error:', err);
    return res.status(500).json({ error: 'Failed to generate email' });
  }
});

router.post('/send-email', async (req, res) => {
  const { recipients, subject, content } = req.body;

  if (!recipients?.length || !subject || !content) {
    return res.status(400).json({ error: 'Recipients, subject, and content are required' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipients.join(','),
      subject,
      html: content
    });

    console.log('Email sent:', info.messageId);

    return res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
});

export default router;
