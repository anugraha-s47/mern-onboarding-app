
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Info,
  Upload,
  UserCircle,
  X,
} from 'lucide-react';
import api, { errorMessage } from '../services/api';

const goalOptions = [
  'Build my Skill Repository',
  'Get a Good Job',
  'Upskill for Current Role',
  'Explore New Skills',
  'Make Learning a Habit!',
  'Others',
];

const interestGroups = {
  Business: [
    'DaVinci Resolve',
    'Microsoft SharePoint',
    'IIBA Entry Certificate in Business Analysis',
    'Microsoft Project',
    'Operations Management',
    'Microsoft Access',
    'Management Skills',
    'Lean',
    'Sony Vegas',
    'Quality Checking',
    'Business Model Canvas',
    'Technical Writing',
    'HR Analytics',
    'Online Course Creation',
    'Microsoft PowerPoint',
  ],
  Design: [
    'Cinematic Editing',
    'Wix',
    'Adobe Premiere Pro',
    'User Experience (UX) design',
    'Fashion',
    'Game Design',
    'Canva',
    'Character Design',
    'Sewing',
    'Building Information Modelling (BIM)',
    'Mobile App design',
    'Textiles',
    'Illustration',
    'Virtual Reality',
    'UI/UX',
  ],
  Technology: [
    'Python',
    'JavaScript',
    'React',
    'Node.js',
    'MongoDB',
    'C',
    'C++',
    'Embedded Systems',
    'Machine Learning',
    'Data Science',
    'Cloud Computing',
    'Cybersecurity',
    'SQL',
    'Verilog',
    'Artificial Intelligence',
  ],
};

const defaults = {
  1: {
    name: '',
    username: '',
    role: '',
    location: '',
    discovery: '',
  },
  2: { goals: [] },
  3: { acknowledged: false },
  4: { interests: [] },
  5: { skills: [] },
  6: { jobSearch: '' },
  7: { links: [], learningSources: '' },
  8: { confirmed: false },
};

const total = 6;

const progressStep = (step) => {
  if (step === 1) return 1;
  if (step === 2) return 2;
  if (step === 3) return 3;
  if (step === 4) return 4;
  if (step === 6) return 5;
  return 1;
};

export default function Onboarding() {
  const { stepNumber } = useParams();
  const requestedStep = Number(stepNumber);
  const step = requestedStep === 5 ? 4 : requestedStep;

  const nav = useNavigate();

  const [data, setData] = useState(defaults);
  const [photoPreview, setPhotoPreview] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const savedSnapshot = useRef(null);

  const user = JSON.parse(
    sessionStorage.getItem('record_user') || '{}'
  );

  const currentProgress = progressStep(step);
  const progressPercent = (currentProgress / 5) * 100;

  useEffect(() => {
    if (
      !Number.isInteger(requestedStep) ||
      requestedStep < 1 ||
      requestedStep > total
    ) {
      nav('/onboarding/1', { replace: true });
      return;
    }

    if (requestedStep === 5) {
      nav('/onboarding/4', { replace: true });
      return;
    }

    let alive = true;

    setLoaded(false);
    setError('');

    api
      .get('/onboarding')
      .then((r) => {
        if (!alive) return;

        const entry = r.data.entry || {};

        // Load the previously saved profile picture.
        setPhotoPreview(entry.step6?.photoData || '');

        setData((old) => {
          const merged = { ...old };

          for (let i = 1; i <= 8; i++) {
            merged[i] = {
              ...defaults[i],
              ...(entry[`step${i}`] || {}),
            };
          }

          savedSnapshot.current = JSON.parse(
            JSON.stringify(merged)
          );

          return merged;
        });

        setLoaded(true);
      })
      .catch((e) => {
        if (alive) {
          setError(errorMessage(e));
          setLoaded(true);
        }
      });

    return () => {
      alive = false;
    };
  }, [step, requestedStep, nav]);

  const setField = (key, value) => {
    const targetStep =
      step === 4 && key === 'skills' ? 5 : step;

    setData((d) => ({
      ...d,
      [targetStep]: {
        ...d[targetStep],
        [key]: value,
      },
    }));
  };

  const valid = useMemo(() => {
    const d = data[step] || {};

    if (step === 1) {
      return (
        d.name.trim().length >= 2 &&
        /^[a-zA-Z0-9._-]{3,24}$/.test(d.username) &&
        d.role &&
        d.location &&
        d.discovery
      );
    }

    if (step === 2) {
      return d.goals.length > 0;
    }

    if (step === 4 || step === 5) {
      return (
        data[5].skills.length > 0 &&
        data[5].skills.length <= 5
      );
    }

    if (step === 6) {
      return ['yes', 'no'].includes(d.jobSearch);
    }


    return true;
  }, [data, step]);

  async function save() {
    const d = data[step] || {};

    if (step === 4) {
      const selected = data[5].skills;

      await api.put('/onboarding/step/4', {
        interests: selected,
      });

      await api.put('/onboarding/step/5', {
        skills: selected,
      });

      return;
    }

    if (step === 3) {
      const nextData = {
        ...d,
        acknowledged: true,
      };

      setData((all) => ({
        ...all,
        [step]: nextData,
      }));

      await api.put(
        `/onboarding/step/${step}`,
        nextData
      );

      return;
    }

    // Step 6 is the final onboarding step. Save the profile data,
    // then ask the backend to mark onboarding as complete.
    await api.put(`/onboarding/step/${step}`, d);

    if (step === 6) {
      const r = await api.post('/onboarding/complete');
      return r.data;
    }
  }

  async function next() {
    setError('');

    if (!valid) {
      setError(
        step === 1
          ? 'Complete all fields. Username must be 3–24 characters using letters, numbers, dots, underscores, or hyphens.'
          : step === 2
            ? 'Choose at least one goal.'
            : step === 4
              ? 'Select between 1 and 5 skills.'
              : step === 5
                ? 'Choose between 1 and 5 skills.'
                : step === 6
                  ? 'Choose a job-search status.'
                  : 'Confirm the information before submitting.'
      );

      return;
    }

    setBusy(true);
    setStatus('Saving…');

    try {
      await save();

      savedSnapshot.current = JSON.parse(
        JSON.stringify(data)
      );

      setStatus('Saved');

      if (step === 6) {
        sessionStorage.setItem(
          'record_completion_status',
          'completed'
        );

        nav('/dashboard', {
          replace: true,
          state: { completed: true },
        });

        return;
      }

      nav(`/onboarding/${step === 4 ? 6 : step + 1}`);
    } catch (e) {
      setStatus('Save failed');
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function back() {
    setError('');

    if (step === 1) {
      nav('/login');
      return;
    }

    const previousByVisibleStep = {
      2: 1,
      3: 2,
      4: 3,
      6: 4,
    };

    const destination = `/onboarding/${
      previousByVisibleStep[step] ??
      Math.max(1, step - 1)
    }`;

    const currentDraft =
      step === 4
        ? {
            interests: data[5].skills || [],
            skills: data[5].skills || [],
          }
        : data[step] || {};

    const baseline = savedSnapshot.current || defaults;

    const previousDraft =
      step === 4
        ? {
            interests:
              baseline[5]?.skills ||
              baseline[4]?.interests ||
              [],
            skills: baseline[5]?.skills || [],
          }
        : baseline[step] || {};

    const changed =
      JSON.stringify(currentDraft) !==
      JSON.stringify(previousDraft);

    if (!changed) {
      setStatus('');
      nav(destination);
      return;
    }

    setBusy(true);
    setStatus('Saving draft…');

    try {
      if (step === 4) {
        const selected = data[5].skills || [];

        await api.put(
          '/onboarding/step/4?draft=true',
          { interests: selected }
        );

        await api.put(
          '/onboarding/step/5?draft=true',
          { skills: selected }
        );
      } else {
        await api.put(
          `/onboarding/step/${step}?draft=true`,
          currentDraft
        );
      }

      savedSnapshot.current = JSON.parse(
        JSON.stringify(data)
      );

      setStatus('Draft saved');
      nav(destination);
    } catch (e) {
      setStatus('Save failed');

      setError(
        `${errorMessage(e)} Your changes are still on this screen. Please retry Back.`
      );
    } finally {
      setBusy(false);
    }
  }

  function toggleArray(key, value, limit = 99) {
    const targetStep =
      step === 4 && key === 'skills' ? 5 : step;

    const list = data[targetStep][key] || [];

    setField(
      key,
      list.includes(value)
        ? list.filter((x) => x !== value)
        : list.length < limit
          ? [...list, value]
          : list
    );
  }

  if (!loaded) {
    return (
      <div className="loading-page">
        Loading your saved responses…
      </div>
    );
  }

  return (
    <main className="onboarding-shell">
      <header className="step-header">
        {step > 1 && (
          <button
            type="button"
            className="back-top"
            onClick={back}
            disabled={busy}
          >
            <ArrowLeft size={15} />
            Back
          </button>
        )}

        <div
          className="progress-track"
          role="progressbar"
          aria-label="Onboarding progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progressPercent)}
        >
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />

          <svg
            className="ship"
            width="30"
            height="30"
            viewBox="0 0 32 32"
            aria-hidden="true"
            style={{ left: `${progressPercent}%` }}
          >
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 2.5V23" />
              <path d="M14.8 5L6.5 16H14.8Z" />
              <path d="M17.2 8L25.5 17H17.2Z" />
              <path d="M15 10L9.5 13.5" />
              <path d="M17 12L22 15.5" />
              <path d="M4 22.5H28L23.5 27H8.5Z" />
              <path d="M7 29H25" />
              <path d="M16 2.5L19 5" />
              <path d="M12.5 5H19.5" />
            </g>
          </svg>
        </div>

        <div className="orange-block" />
      </header>

      <section className="step-content">
        <div className={`step-inner step-inner-step-${step}`}>
          {step === 1 && (
            <>
              <h1>It's your time!</h1>

              <p className="muted">
                Let us know about yourself first.
              </p>

              <input
                className="field"
                placeholder="Your Name"
                value={data[1].name}
                onChange={(e) =>
                  setField('name', e.target.value)
                }
                maxLength={80}
              />

              <input
                className="field"
                placeholder="Your Username"
                value={data[1].username}
                onChange={(e) =>
                  setField('username', e.target.value)
                }
                maxLength={24}
              />

              <p className="helper">
                <Info size={15} />
                app.getrecord/{data[1].username || 'username'}
              </p>

              <select
                className="field"
                value={data[1].role}
                onChange={(e) =>
                  setField('role', e.target.value)
                }
              >
                <option value="">
                  What best describes you?
                </option>

                {[
                  'Student',
                  'Working Professional',
                  'Job Seeker',
                  'Freelancer',
                  'Founder',
                  'Other',
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>

              <select
                className="field"
                value={data[1].location}
                onChange={(e) =>
                  setField('location', e.target.value)
                }
              >
                <option value="">
                  Select your location
                </option>

                {[
                  'India',
                  'United States',
                  'United Kingdom',
                  'Canada',
                  'Australia',
                  'Other',
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>

              <select
                className="field"
                value={data[1].discovery}
                onChange={(e) =>
                  setField('discovery', e.target.value)
                }
              >
                <option value="">
                  How do you know us?
                </option>

                {[
                  'College or university',
                  'Friend or colleague',
                  'Social media',
                  'YouTube',
                  'Search engine',
                  'Other',
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </>
          )}

          {step === 2 && (
            <>
              <h1>
                Hey{' '}
                {data[1].username ||
                  user.name?.split(' ')[0] ||
                  'there'}{' '}
                👋
              </h1>

              <p className="muted">
                Let us know, how would you like to use
                Record for:
              </p>

              <h3>What's your main goal?</h3>

              <div className="check-list">
                {goalOptions.map((goal) => (
                  <label
                    key={goal}
                    className="check-row"
                  >
                    <input
                      type="checkbox"
                      checked={data[2].goals.includes(goal)}
                      onChange={() =>
                        toggleArray('goals', goal)
                      }
                    />

                    <span>{goal}</span>
                  </label>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <div className="promo-card">
              <div className="promo-copy">
                <h2>
                  You bring the curiosity.
                  <br />
                  We'll <em>back it up with proof.</em>
                </h2>

                <p>
                  Record is built for people like you —
                  learners, job-seekers, builders. Whatever
                  your goal, we help you earn verified skill
                  badges and turn effort into outcomes.
                </p>

                {[
                  'Earn verified skill badges from projects, courses & YouTube',
                  'Take AI-powered assessments to showcase your skills',
                  'Share your profile & badges publicly, like a mini portfolio',
                  'Be visible to recruiters hiring via Record',
                ].map((text) => (
                  <div className="promo-point" key={text}>
                    <Check size={17} />
                    {text}
                  </div>
                ))}
              </div>

              <aside className="testimonial">
                <div className="certificate">▤</div>

                <p>
                  Throughout my journey spanning projects,
                  work experience, licenses, education, and
                  even my personal YouTube learning playlist,
                  I've built a strong skill set. And now, I
                  can see them all in one place with Record.
                </p>

                <b>— Arunmathavan</b>
                <small>Mobile App Developer at NSIC</small>
              </aside>

              <footer>
                Trusted &amp; Supported by
                <b> ZOHO　 aws　 Founders Hub　 Notion</b>
              </footer>
            </div>
          )}

          {step === 4 && (
            <>
              <h1>What's your Interest?</h1>

              <p className="muted">
                Choose up to five interests or skills to
                personalize your Record profile.
              </p>

              <input
                className="field search-field"
                placeholder="Search Skills i.e figma, front end"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <p className="selection-count">
                ({data[5].skills.length}/5 selected — you
                can edit later)
              </p>

              <h3>Selected Skills</h3>

              <div className="chips selected-skills">
                {data[5].skills.map((skill) => (
                  <button
                    type="button"
                    className="chip selected"
                    key={skill}
                    onClick={() =>
                      toggleArray('skills', skill, 5)
                    }
                  >
                    {skill}
                    <X size={13} />
                  </button>
                ))}
              </div>

              {Object.entries(interestGroups).map(
                ([category, items]) => {
                  const filtered = items.filter((item) =>
                    item
                      .toLowerCase()
                      .includes(search.toLowerCase())
                  );

                  if (filtered.length === 0) return null;

                  return (
                    <div
                      className="skill-group"
                      key={category}
                    >
                      <h3>{category}</h3>

                      <div className="chips">
                        {filtered.map((skill) => (
                          <button
                            type="button"
                            key={skill}
                            disabled={
                              !data[5].skills.includes(skill) &&
                              data[5].skills.length >= 5
                            }
                            onClick={() =>
                              toggleArray(
                                'skills',
                                skill,
                                5
                              )
                            }
                            className={`chip ${
                              data[5].skills.includes(skill)
                                ? 'selected'
                                : ''
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }
              )}
            </>
          )}

          {step === 6 && (
            <>
              <h1>Set your profile</h1>

              <p className="muted">This is important!</p>

              <div className="avatar-preview">
                {photoPreview || data[6].photoData ? (
                  <img
                    src={photoPreview || data[6].photoData}
                    alt="Profile preview"
                    className="profile-photo-preview"
                  />
                ) : (
                  <UserCircle
                    size={94}
                    strokeWidth={1.5}
                  />
                )}

                <span>Your Profile Preview</span>
              </div>

              <label className="upload-label">
                Upload Profile Picture

                <div className="upload-button">
                  <Upload size={18} />
                  Upload Photo

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (!file) return;

                      if (file.size > 2 * 1024 * 1024) {
                        setError(
                          'Image must be 2 MB or smaller.'
                        );

                        e.target.value = '';
                        return;
                      }

                      if (!file.type.startsWith('image/')) {
                        setError(
                          'Please select a valid image.'
                        );

                        e.target.value = '';
                        return;
                      }

                      setError('');

                      const reader = new FileReader();

                      reader.onload = () => {
                        const imageData = reader.result;

                        setPhotoPreview(imageData);
                        setField('photoData', imageData);
                        setField('photoName', file.name);
                      };

                      reader.onerror = () => {
                        setError(
                          'Unable to read the selected image. Please try again.'
                        );
                      };

                      reader.readAsDataURL(file);
                    }}
                  />
                </div>

                {data[6].photoName && (
                  <small>{data[6].photoName}</small>
                )}
              </label>

              <div className="job-search">
                <p>Are you actively looking for a job?</p>

                <label>
                  <input
                    type="radio"
                    name="jobSearch"
                    checked={data[6].jobSearch === 'yes'}
                    onChange={() =>
                      setField('jobSearch', 'yes')
                    }
                  />
                  Yes, actively seeking
                </label>

                <label>
                  <input
                    type="radio"
                    name="jobSearch"
                    checked={data[6].jobSearch === 'no'}
                    onChange={() =>
                      setField('jobSearch', 'no')
                    }
                  />
                  No, I'm not looking
                </label>
              </div>
            </>
          )}

          {error && (
            <p className="step-error" role="alert">
              {error}
            </p>
          )}

          {status && (
            <p className="save-status" aria-live="polite">
              {status}
            </p>
          )}
        </div>
      </section>

      {/* Bottom Back button removed. Continue stays on the right. */}
      
        <footer className="bottom-bar">
          <span>
            {status === 'Saving…'
              ? 'Saving your progress…'
              : 'or press Enter'}
          </span>

          <button
            type="button"
            className="continue-button"
            disabled={busy || !valid}
            onClick={next}
          >
            {busy
              ? 'Saving…'
              : step === 6
                ? 'Finish and go to Dashboard'
                : 'Continue'}
          </button>
        </footer>

    </main>
  );
}
