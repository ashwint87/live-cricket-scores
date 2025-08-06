import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="page-container">
      <h2>Privacy Policy</h2>
      <p>
        Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information.
      </p>
      <h4>Information We Collect</h4>
      <ul>
        <li>Basic usage data (pages visited, time spent, etc.) via cookies and analytics tools</li>
        <li>Optional: Email address (only if you subscribe to notifications)</li>
      </ul>

      <h4>How We Use Your Information</h4>
      <ul>
        <li>To improve the website and user experience</li>
        <li>To provide match alerts and content updates (if opted in)</li>
      </ul>

      <h4>Third-Party Services</h4>
      <p>We may use third-party services like Google Analytics or Ad networks. These services may collect limited user data.</p>

      <h4>Your Choices</h4>
      <p>You may disable cookies in your browser or unsubscribe from alerts at any time.</p>

      <p>For any privacy-related concerns, contact us at: <a href="mailto:support@livecricketscores.com">support@livecricketscores.com</a></p>
    </div>
  );
}
