import React, { useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import "./Home.css";

function Home() {
  // Animation controls
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerChildren = {
    visible: { transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <header className="hero">
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            ASYV Security Management System
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Protecting our community with advanced security technology and monitoring systems at Agahozo-Shalom Youth Village.
          </motion.p>
          <motion.div 
            className="hero-buttons"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <a href="/dashboard" className="btn primary">
              View Dashboard
            </a>
            <a href="/login" className="btn secondary">
              Staff Login
            </a>
          </motion.div>
        </div>
        <div className="hero-visual">
          <div className="floating-card card-1">
            <div className="card-content">
              <div className="user-avatar"></div>
              <div className="user-details">
                <div className="line"></div>
                <div className="line short"></div>
              </div>
            </div>
          </div>
          <div className="floating-card card-2">
            <div className="card-content">
              <div className="chart-bar"></div>
              <div className="chart-bar"></div>
              <div className="chart-bar"></div>
              <div className="chart-bar"></div>
            </div>
          </div>
          <div className="floating-card card-3">
            <div className="card-content">
              <div className="shield-icon"></div>
              <div className="status-indicator"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features" ref={ref}>
        <motion.h2
          variants={fadeIn}
          initial="hidden"
          animate={controls}
        >
          Our Security Ecosystem
        </motion.h2>
        <motion.div 
          className="features-container"
          variants={staggerChildren}
          initial="hidden"
          animate={controls}
        >
          <motion.div className="feature-card" variants={fadeIn}>
            <div className="feature-icon">
              <i className="fas fa-user-shield"></i>
            </div>
            <h3>Access Control</h3>
            <p>Manage entry points and monitor movement throughout the village with our advanced access control system.</p>
          </motion.div>
          <motion.div className="feature-card" variants={fadeIn}>
            <div className="feature-icon">
              <i className="fas fa-video"></i>
            </div>
            <h3>Surveillance Monitoring</h3>
            <p>24/7 CCTV surveillance with AI-powered threat detection to ensure safety across campus.</p>
          </motion.div>
          <motion.div className="feature-card" variants={fadeIn}>
            <div className="feature-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Emergency Response</h3>
            <p>Rapid alert system and coordinated response protocols for any emergency situation.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-container">
          <motion.div 
            className="stat-item"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3>500+</h3>
            <p>Protected Areas</p>
          </motion.div>
          <motion.div 
            className="stat-item"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3>24/7</h3>
            <p>Security Monitoring</p>
          </motion.div>
          <motion.div 
            className="stat-item"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3>100%</h3>
            <p>Community Safety</p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission">
        <div className="mission-container">
          <motion.div 
            className="mission-content"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Our Mission: Safety & Healing</h2>
            <p>At Agahozo-Shalom Youth Village, we believe that true healing and growth can only happen in an environment of complete safety and security. Our advanced security system ensures our youth can focus on their education and personal development without concerns for their physical safety.</p>
            <p>The ASYV Security Management System represents our commitment to protecting every member of our community while maintaining the warm, welcoming atmosphere that defines our village.</p>
          </motion.div>
          <motion.div 
            className="mission-image"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="image-placeholder">
              <i className="fas fa-home"></i>
              <p>Agahozo-Shalom Youth Village</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <motion.div 
          className="cta-content"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>Join Us in Protecting Our Community</h2>
          <p>Authorized staff can access the security dashboard to monitor systems and respond to incidents.</p>
          <a href="/login" className="btn primary">
            Access Security Portal
          </a>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} Agahozo-Shalom Youth Village Security System</p>
        <p>Building a safe future for Rwanda's youth</p>
      </footer>
    </div>
  );
}

export default Home;