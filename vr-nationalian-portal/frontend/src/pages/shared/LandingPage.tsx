import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Check if user is already logged in and redirect to appropriate dashboard
    if (user) {
      switch (user.roleId) {
        case 1:
          navigate('/student', { replace: true });
          break;
        case 2:
          navigate('/professor', { replace: true });
          break;
        case 3:
          navigate('/admin', { replace: true });
          break;
        default:
          break;
      }
      return;
    }

    // Intersection Observer for scroll animations
    const els = document.querySelectorAll('.reveal');
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observerRef.current?.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    els.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [user, navigate]);

  const handleEnter = () => {
    navigate('/login');
  };

  return (
    <div className="landing-page">
      {/* NAV */}
      <nav className="landing-nav">
        <div className="logo">
          VR<span>.</span>Nationalian
        </div>
        <ul>
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a href="#about">About</a>
          </li>
          <li>
            <a href="#team">Team</a>
          </li>
          <li>
            <button onClick={handleEnter} className="nav-cta">
              Enter
            </button>
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <section id="hero">
        <div className="blob blob-purple"></div>
        <div className="blob blob-gold"></div>

        <div className="hero-left">
          <p className="hero-eyebrow">Immersive Educational VR Experience</p>
          <h1 className="hero-title">
            Learn to be a
            <br />
            <span className="accent-blue">Nationalian</span>
          </h1>
          <p className="hero-sub">
            VR Nationalian transforms education through{' '}
            <strong>immersive virtual reality</strong> — where students explore
            National University history through interactive gameplay and
            real-world learning.
          </p>
          <div className="cta-row">
            <button onClick={handleEnter} className="btn-primary">
              Explore Now
            </button>
            <a href="#features" className="btn-ghost">
              View Features
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">
                4<span>+</span>
              </span>
              <span className="stat-label">Chapters</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                6<span></span>
              </span>
              <span className="stat-label">Nationalian Lessons</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                100<span>%</span>
              </span>
              <span className="stat-label">VR Immersive</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features">
        <div className="section-label reveal">Core Capabilities</div>
        <div className="section-heading reveal reveal-delay-1">
          Learn through experience
        </div>
        <div className="features-grid">
          <div className="feature-card reveal">
            <div className="feature-icon blue">[ 01 ] Immersion Core</div>
            <div className="feature-name">VR-Powered Learning</div>
            <div className="feature-desc">
              Step into history with mobile VR support, gyroscope controls, and
              gaze-based interactions — learn by experiencing, not just reading.
            </div>
          </div>
          <div className="feature-card reveal reveal-delay-1">
            <div className="feature-icon green">[ 02 ] Educational Journey</div>
            <div className="feature-name">4 Interactive Chapters</div>
            <div className="feature-desc">
              Master National University's culture through diverse challenges —
              maze exploration, music puzzles, multi-room quizzes, and artifact
              hunts.
            </div>
          </div>
          <div className="feature-card reveal reveal-delay-2">
            <div className="feature-icon purple">[ 03 ] Progress & Competition</div>
            <div className="feature-name">Live Tracking & Leaderboards</div>
            <div className="feature-desc">
              Monitor your learning journey in real-time, compete with peers, and
              unlock achievements as you become a true Nationalian.
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about">
        <div className="about-grid">
          <div className="about-left">
            <div className="section-label reveal">About Us</div>
            <h2 className="about-heading reveal reveal-delay-1">
              Where learning
              <br />
              <span className="hi">meets virtual</span>
              <br />
              reality.
            </h2>
            <p className="about-body reveal reveal-delay-2">
              <strong>VR Nationalian</strong> is an innovative educational
              platform that brings National University's history and values to
              life through immersive virtual reality experiences designed for
              students and educators.
            </p>
            <p className="about-body reveal reveal-delay-2">
              We combine <strong>cutting-edge VR technology</strong> with
              carefully curated educational content — featuring interactive
              chapters, real-time progress tracking, and gamified learning that
              makes becoming a true Nationalian engaging and memorable.
            </p>
            <div className="about-tags reveal reveal-delay-3">
              <span className="tag blue">VR Learning</span>
              <span className="tag green">Mobile Compatible</span>
              <span className="tag purple">Gamified Education</span>
              <span className="tag gold">NU Heritage</span>
            </div>
          </div>

          <div className="about-right">
            <div className="about-card glow-green reveal">
              <div className="about-card-label">Interactive Chapters</div>
              <div className="about-card-big">
                4<span className="unit"></span>
              </div>
              <div className="about-card-note">Unique learning experiences</div>
            </div>
            <div className="about-card glow-blue reveal reveal-delay-1">
              <div className="about-card-label">Content Coverage</div>
              <div className="about-card-big">
                6<span className="unit"></span>
              </div>
              <div className="about-card-note">Nationalian lessons</div>
            </div>
            <div className="about-card glow-purple reveal reveal-delay-2">
              <div className="about-card-label">VR Platforms</div>
              <div className="about-card-big">
                Mobile<span className="unit"></span>
              </div>
              <div className="about-card-note">Gyroscope & gaze controls</div>
            </div>
            <div className="about-card glow-gold reveal reveal-delay-3">
              <div className="about-card-label">Learning Style</div>
              <div className="about-card-big">
                100<span className="unit">%</span>
              </div>
              <div className="about-card-note">Immersive & interactive</div>
            </div>
            <div className="about-card wide reveal reveal-delay-4 mission-card">
              <div className="about-card-label">Mission Statement</div>
              <div className="mission-text">
                "To make learning National University's history and values an
                unforgettable journey through immersive virtual reality — where
                every student becomes a proud Nationalian."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION BAND */}
      <section id="mission">
        <p className="mission-quote reveal">
          "Education is not just about memorizing facts.
          <br />
          It's about <em>experiencing history</em> and making it your own."
        </p>
        <p className="mission-line reveal reveal-delay-1">
          VR Nationalian — Immersive Learning, Est. 2024
        </p>
      </section>

      {/* TEAM */}
      <section id="team">
        <div className="team-header">
          <div>
            <div className="section-label reveal">The Builders</div>
            <div className="section-heading reveal reveal-delay-1">
              Meet the team
            </div>
          </div>
        </div>
        <div className="team-grid">
          <div className="team-card reveal">
            <div className="team-avatar-img">
              <img src="/Iryl.png" alt="Iryl Jensel Lipata" />
            </div>
            <div className="team-name">Iryl Jensel Lipata</div>
            <div className="team-role">Web Developer</div>
          </div>
          <div className="team-card reveal reveal-delay-1">
            <div className="team-avatar-img">
              <img src="/Angcao.png" alt="Charles Dominic Angcao" />
            </div>
            <div className="team-name">Charles Dominic Angcao</div>
            <div className="team-role">Technical Support</div>
          </div>
          <div className="team-card reveal reveal-delay-2">
            <div className="team-avatar-img">
              <img src="/Jason.png" alt="Jason Salazar" />
            </div>
            <div className="team-name">Jason Salazar</div>
            <div className="team-role">App Developer</div>
          </div>
          <div className="team-card reveal reveal-delay-3">
            <div className="team-avatar-img">
              <img src="/Balaoro.png" alt="Gabriel Balaoro" />
            </div>
            <div className="team-name">Gabriel Balaoro</div>
            <div className="team-role">Documentation</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-left">
          <strong>VR Nationalian</strong> &mdash; &copy; 2024. All rights
          reserved.
        </div>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Docs</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
