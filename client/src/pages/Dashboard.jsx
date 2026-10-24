
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  LayoutDashboard, UserRound, Award, MonitorPlay, BriefcaseBusiness,
  Box, Headphones, Send, Zap, Plus, Bell, ChevronDown, PanelLeft,
  ArrowRight, CircleHelp, CheckCircle2, Medal,
  Code2, ShieldCheck, Palette, Play, Youtube, LogOut
} from "lucide-react";

const learningItems = [
  {
    title: "Digital Marketing Mastery for Business",
    subtitle: "Digital Marketing",
    progress: 93,
    kind: "marketing",
  },
  {
    title: "MySQL Playlist",
    subtitle: "MySQL with Python",
    progress: 91,
    kind: "mysql",
  },
  {
    title: "RESTful Web Services and API Testing",
    subtitle: "Web Services",
    progress: 91,
    kind: "api",
  },
  {
    title: "Comprehensive Python Programming",
    subtitle: "Python",
    progress: 89,
    kind: "python",
  },
];

const showcaseItems = [
  {
    name: "LeetCode",
    description: "Highlight your problem-solving skills with coding challenges completed.",
    icon: Code2,
    style: "leetcode",
  },
  {
    name: "HackerRank",
    description: "Prove your expertise through coding badges, challenges, and achievements.",
    icon: ShieldCheck,
    style: "hackerrank",
  },
  {
    name: "Dribbble",
    description: "Display your creative designs and build a strong visual portfolio.",
    icon: Palette,
    style: "dribbble",
  },
];

function LearningThumbnail({ kind }) {
  const config = {
    marketing: {
      heading: "DIGITAL",
      second: "MARKETING",
      third: "FULL COURSE",
      detail: "BEGINNERS",
      className: "thumb-marketing",
    },
    mysql: {
      heading: "MySQL",
      second: "PLAYLIST",
      third: "with Python",
      detail: "Installation & Queries",
      className: "thumb-mysql",
    },
    api: {
      heading: "ABSOLUTE BEGINNER GUIDE",
      second: "REST WEB SERVICES",
      third: "INTRODUCTION TO APIs",
      detail: "Learn by building",
      className: "thumb-api",
    },
    python: {
      heading: "Complete",
      second: "Python",
      third: "Programming",
      detail: "Variables & Data Types",
      className: "thumb-python",
    },
  }[kind];

  return (
    <div className={`learning-thumbnail ${config.className}`}>
      <div className="thumbnail-content">
        <span>{config.heading}</span>
        <strong>{config.second}</strong>
        <b>{config.third}</b>
        <small>{config.detail}</small>
      </div>
      <span className="thumbnail-play">
        <Play size={19} fill="currentColor" />
      </span>
    </div>
  );
}

function LearningCard({ item }) {
  return (
    <article className="learning-card">
      <LearningThumbnail kind={item.kind} />
      <h3 title={item.title}>{item.title}</h3>
      <p className="learning-label">Progress</p>
      <div className="learning-progress-row">
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${item.progress}%` }}
          />
        </div>
        <span>{item.progress}%</span>
      </div>
      <p className="powered-by">Powered by YouTube</p>
    </article>
  );
}

function ActivityCalendar() {
  const activity = [
    0, 1, 0, 2, 0, 1, 0,
    1, 0, 2, 1, 0, 3, 1,
    0, 2, 1, 0, 2, 1, 0,
    1, 2, 0, 3, 1, 0, 2,
    0, 1, 2, 1, 0, 3, 1,
    1, 0, 2, 0, 1, 2, 0,
  ];

  return (
    <section className="activity-panel">
      <div className="activity-heading">
        <h3>Learning Activities</h3>
        <CircleHelp size={15} />
        <button className="month-button">
          Jan <ChevronDown size={14} />
        </button>
      </div>

      <div className="activity-weekdays">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="activity-grid">
        {activity.map((level, index) => (
          <span
            key={index}
            className={`activity-cell activity-level-${level}`}
            title={
              level
                ? `${level} learning activities`
                : "No activity"
            }
          />
        ))}
      </div>

      <div className="activity-legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={`legend-cell activity-level-${level}`}
          />
        ))}
        <span>More</span>
      </div>
    </section>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [profilePhoto, setProfilePhoto] = useState("");

  // Load the saved profile picture from onboarding.
  useEffect(() => {
    let active = true;

    api.get("/onboarding")
      .then((response) => {
        if (!active) return;

        const savedPhoto =
          response.data.entry?.step6?.photoData || "";

        setProfilePhoto(savedPhoto);
      })
      .catch((error) => {
        console.error(
          "Unable to load profile photo:",
          error
        );
      });

    return () => {
      active = false;
    };
  }, []);

  let user = {};

  try {
    user = JSON.parse(
      sessionStorage.getItem("record_user") || "{}"
    );
  } catch {
    user = {};
  }

  const name = user.name || "Record Member";
  const email = user.email || "Welcome to Record";

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  function logout() {
    sessionStorage.removeItem("record_token");
    sessionStorage.removeItem("record_user");
    sessionStorage.removeItem("record_completion_status");

    navigate("/login", { replace: true });
  }

  return (
    <main className="record-dashboard">
      <aside className="record-sidebar">
        <div className="record-brand">
          <div className="record-brand-mark">
            <span />
            <span />
            <span />
            <span />
          </div>

          <div>
            <strong>Record</strong>
            <small>v1.25.0</small>
          </div>
        </div>

        <nav className="sidebar-navigation">
          <a href="#dashboard" className="sidebar-link active">
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </a>

          <a href="#profile" className="sidebar-link">
            <UserRound size={19} />
            <span>Profile</span>
          </a>

          <a href="#skills" className="sidebar-link">
            <Award size={19} />
            <span>Skill Repository</span>
          </a>

          <a href="#learnings" className="sidebar-link">
            <MonitorPlay size={19} />
            <span>Learnings</span>
          </a>

          <a href="#jobs" className="sidebar-link">
            <BriefcaseBusiness size={19} />
            <span>Jobs</span>
          </a>

          <div className="sidebar-subnav">
            <a href="#offers">Offers</a>
            <a href="#applied">Applied</a>
          </div>

          <a href="#tools" className="sidebar-link">
            <Box size={19} />
            <span>Tools</span>
          </a>

          <div className="sidebar-subnav sidebar-tools">
            <a href="#youtube-tool">YouTube to Course</a>
            <a href="#resume-tool">One Click Resume</a>
            <a href="#assessment-tool">AI Assessment</a>
          </div>
        </nav>

        <div className="sidebar-bottom">
          <a href="#support">
            <Headphones size={17} /> Support
          </a>
          <a href="#feedback">
            <Send size={17} /> Feedback
          </a>
          <p>Privacy Policy | Terms &amp; Conditions</p>
          <small>
            © 2025 Record Innovation and Enterprises Pvt. Ltd.
          </small>
        </div>
      </aside>

      <section className="record-main">
        <header className="record-topbar">
          <div className="topbar-title">
            <PanelLeft size={17} />
            <span>Dashboard</span>
          </div>

          <div className="topbar-actions">
            <button className="upgrade-button">
              <Zap size={15} /> Upgrade
            </button>

            <button
              className="topbar-icon add-button"
              aria-label="Add"
            >
              <Plus size={19} />
            </button>

            <button
              className="topbar-icon"
              aria-label="Notifications"
            >
              <Bell size={21} />
            </button>

            <button
              className="user-menu"
              onClick={logout}
              title={`Signed in as ${name}. Click to sign out`}
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="user-avatar-small profile-avatar-image"
                />
              ) : (
                <span className="user-avatar-small">
                  {initials || "R"}
                </span>
              )}

              <ChevronDown size={13} />
            </button>
          </div>
        </header>

        <div className="record-content" id="dashboard">
          <div className="dashboard-columns">
            <div className="dashboard-primary">
              <section className="youtube-banner">
                <div className="youtube-banner-copy">
                  <div className="youtube-brand">
                    <Youtube size={20} fill="currentColor" />
                    YouTube
                  </div>

                  <h1>
                    Claim Skill badges from
                    <br />
                    YouTube Contents
                  </h1>

                  <button
                    onClick={() => navigate("/onboarding/1")}
                    className="banner-button"
                  >
                    Try the tool <ArrowRight size={17} />
                  </button>
                </div>

                <div className="banner-preview" aria-hidden="true">
                  <div className="preview-back-card">
                    <div className="preview-line" />
                    <div className="preview-line short" />
                    <div className="preview-video" />
                  </div>

                  <div className="preview-front-card">
                    <div className="preview-window-bar">
                      My Learnings · Web Development Masterclass
                    </div>

                    <div className="preview-video">
                      <span className="preview-play">
                        <Play size={21} fill="currentColor" />
                      </span>
                      <strong>Web Development</strong>
                      <small>Masterclass</small>
                    </div>

                    <div className="preview-list">
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              </section>

              <section className="learning-section" id="learnings">
                <div className="section-heading">
                  <h2>Learning In progress</h2>

                  <button
                    className="view-more"
                    onClick={() => navigate("/onboarding/1")}
                  >
                    View More <ArrowRight size={16} />
                  </button>
                </div>

                <div className="learning-grid">
                  {learningItems.map((item) => (
                    <LearningCard
                      key={item.kind}
                      item={item}
                    />
                  ))}
                </div>
              </section>

              <section className="showcase-section" id="profile">
                <div className="section-heading">
                  <h2>Showcase in one profile</h2>

                  <button
                    className="view-more"
                    onClick={() => navigate("/onboarding/1")}
                  >
                    View More <ArrowRight size={16} />
                  </button>
                </div>

                <div className="showcase-grid">
                  {showcaseItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <article
                        className="showcase-card"
                        key={item.name}
                      >
                        <div className={`showcase-icon ${item.style}`}>
                          <Icon size={25} />
                        </div>

                        <button
                          className="connect-button"
                          onClick={() =>
                            window.alert(
                              `${item.name} connection is a static demo.`
                            )
                          }
                        >
                          Connect
                        </button>

                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                      </article>
                    );
                  })}
                </div>
              </section>
            </div>

            <aside className="dashboard-aside">
              <h2 className="badge-heading">Skill Badges</h2>

              <div className="badge-summary">
                <article className="badge-card">
                  <div>
                    <span className="medal-icon">
                      <Medal size={20} />
                    </span>
                    <strong>45</strong>
                  </div>
                  <p>Role Based</p>
                </article>

                <article className="badge-card">
                  <div>
                    <span className="medal-icon">
                      <Medal size={20} />
                    </span>
                    <strong>2</strong>
                  </div>
                  <p>Super Skills</p>
                </article>
              </div>

              <ActivityCalendar />

              <section className="account-summary">
                <div className="account-summary-avatar">
                 {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Profile"
                      className="user-avatar-small profile-avatar-image"
                    />
                  ) : (
                    <span className="user-avatar-small">{initials || "R"}</span>
                  )}
                </div>

                <div className="account-summary-copy">
                  <strong>{name}</strong>
                  <span>{email}</span>
                </div>

                <CheckCircle2 size={17} />
              </section>

              <button
                className="aside-logout"
                onClick={logout}
              >
                <LogOut size={15} /> Sign out
              </button>
            </aside>
          </div>

          <footer className="record-footer">
            <span>Record · Your skills, all in one place.</span>
            <span>Welcome, {name}</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
