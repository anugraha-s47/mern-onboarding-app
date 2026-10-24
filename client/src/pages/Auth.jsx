
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Facebook, Linkedin } from 'lucide-react';
import api, { errorMessage } from '../services/api';

export default function Auth({ mode }) {
  const signup = mode === 'signup';
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to onboarding Step 1.
    if (!signup && sessionStorage.getItem('record_token')) {
      api
        .get('/onboarding')
        .then(({ data }) => {
          const status =
            data.completionStatus ||
            data.entry?.completionStatus ||
            'in_progress';

          sessionStorage.setItem('record_completion_status', status);

          navigate('/onboarding/1', { replace: true });
        })
        .catch(() => {
          sessionStorage.removeItem('record_token');
        });
    }
  }, [signup, navigate]);

  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState('');

  const update = (event) => {
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (signup && values.name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
    ) {
      setError('Enter a valid email address.');
      return;
    }

    if (values.password.length < (signup ? 8 : 1)) {
      setError(
        signup
          ? 'Password must contain at least 8 characters.'
          : 'Enter your password.'
      );
      return;
    }

    setBusy(true);

    try {
      if (signup) {
        const response = await api.post('/auth/register', {
          name: values.name,
          email: values.email,
          password: values.password,
        });

        setSuccess(
          response.data.message || 'Account created successfully.'
        );

        window.setTimeout(() => {
          navigate('/login', {
            replace: true,
            state: { email: values.email },
          });
        }, 600);
      } else {
        const response = await api.post('/auth/login', {
          email: values.email,
          password: values.password,
        });

        sessionStorage.setItem('record_token', response.data.token);

        sessionStorage.setItem(
          'record_user',
          JSON.stringify(response.data.user)
        );

        sessionStorage.setItem(
          'record_completion_status',
          response.data.completionStatus || 'in_progress'
        );

        // Every successful login starts at onboarding Step 1.
        navigate('/onboarding/1', { replace: true });
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand-mark">R</div>

        <h1>{signup ? 'SIGN UP' : 'LOGIN'}</h1>

        <p className="auth-subtitle">
          {signup
            ? 'Create your account to start your skill journey.'
            : 'Welcome back. Continue your skill journey.'}
        </p>

        <form onSubmit={submit} noValidate>
          {signup && (
            <label>
              Full Name
              <input
                name="name"
                autoComplete="name"
                value={values.name}
                onChange={update}
                placeholder="Your full name"
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={update}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <span className="password-wrap">
              <input
                name="password"
                type={show ? 'text' : 'password'}
                autoComplete={
                  signup ? 'new-password' : 'current-password'
                }
                value={values.password}
                onChange={update}
                placeholder={
                  signup ? 'At least 8 characters' : 'Your password'
                }
                required
              />

              <button
                type="button"
                className="eye-btn"
                onClick={() => setShow((current) => !current)}
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>

          {!signup && (
            <label className="remember">
              <input type="checkbox" />
              Remember me?
            </label>
          )}

          {error && (
            <p className="alert error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="alert success" role="status">
              {success}
            </p>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={busy}
          >
            {busy
              ? 'Please wait…'
              : signup
                ? 'SIGN UP'
                : 'LOGIN'}
          </button>
        </form>

        {!signup && (
          <div className="forgot">
            Password reset is not enabled in this demo.
          </div>
        )}

        {/* OR divider */}
        <div className="or-line" aria-label="Or continue with">
          <span>OR</span>
        </div>

        {/* Social icons */}
        <div className="social-login">
          <button
            type="button"
            className="social-icon google"
            aria-label="Google"
            title="Google"
          >
            <span className="google-g" aria-hidden="true">
              G
            </span>
          </button>

          <button
            type="button"
            className="social-icon facebook"
            aria-label="Facebook"
            title="Facebook"
          >
            <Facebook
              size={23}
              strokeWidth={2.4}
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            className="social-icon linkedin"
            aria-label="LinkedIn"
            title="LinkedIn"
          >
            <Linkedin
              size={21}
              strokeWidth={2.4}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Switch between Login and Sign Up */}
        <p className="auth-switch">
          {signup ? 'Already a user?' : 'Need an account?'}{' '}
          <Link to={signup ? '/login' : '/signup'}>
            {signup ? 'LOGIN' : 'SIGN UP'}
          </Link>
        </p>
      </section>
    </main>
  );
}
