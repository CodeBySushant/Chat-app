import React from 'react';
import './HomePage.css';

function HomePage() {
  return (
    <div className="homepage">
      <section className="hero-section">
        <h1>Welcome to Chat-App</h1>
        <p>A real-time messaging app with modern features and beautiful UI.</p>
        <a href="#about" className="scroll-btn">Learn More ↓</a>
      </section>

      <section className="about-section" id="about">
        <h2>About This App</h2>
        <p>
          Chat-App allows users to log in securely using email or Google, join a general chat room, or
          send private messages (coming soon). Built with React, Node.js, MongoDB, Socket.IO, and more.
        </p>
        <p>
          It includes theme toggling, authentication, real-time updates, and a responsive design that adapts across devices.
        </p>
      </section>

      <footer className="footer">
        <p>Contact us: contact@chatapp.dev</p>
        <div className="social-icons">
          <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer">Twitter</a>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
