// For testing we'll load environment variables directly without dotenv
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Test function to send a test email
async function sendTestEmail() {
  try {
    console.log('Starting email test...');
    console.log('Configured email settings:');
    console.log(`- HOST: ${process.env.EMAIL_HOST}`);
    console.log(`- PORT: ${process.env.EMAIL_PORT}`);
    console.log(`- USER: ${process.env.EMAIL_USER}`);
    console.log(`- SECURE: ${process.env.EMAIL_SECURE}`);
    console.log(`- FROM: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}`);

    // Create transporter with Zoho configuration
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Testing only - don't use in production
        minVersion: 'TLSv1.2',
      },
      debug: true, // Enable verbose logging for testing
    });

    // Get current directory (equivalent to __dirname in CommonJS)
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Load verification template
    const verificationPath = path.join(__dirname, 'emails', 'verification.html');
    let html;
    
    try {
      html = fs.readFileSync(verificationPath, 'utf8');
      // Replace placeholders with test values
      html = html.replace(/{{verification_link}}/g, 'https://example.com/verify?code=123456');
      html = html.replace(/{{current_year}}/g, new Date().getFullYear().toString());
    } catch (readError) {
      console.error('Error reading template file:', readError);
      html = '<h1>This is a test email</h1><p>The email template could not be loaded.</p>';
    }

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || `Nedaxer <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to self for testing
      subject: 'Test Email - Nedaxer Verification',
      html: html,
    };

    // Verify connection configuration
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection successful!');

    // Send mail
    console.log('Sending test email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    return false;
  }
}

// Run the test
sendTestEmail()
  .then(success => {
    if (success) {
      console.log('Email test completed successfully!');
    } else {
      console.log('Email test failed. Check the error logs above.');
    }
  })
  .catch(err => {
    console.error('Unexpected error during email test:', err);
  });