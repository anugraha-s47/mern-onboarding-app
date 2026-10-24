# Record-style MERN Onboarding Application

A responsive React/Vite onboarding app with an Express/Mongoose API, bcrypt password hashing, JWT authentication, per-user onboarding persistence, step validation, and a personalized completion dashboard.

## Screens and assumptions
- Sign up and login reproduce the pink action-button, white card, and blue-grey backdrop from the reference.
- Onboarding uses the visible Record visual language: pale canvas, thin progress track with a small ship marker, centered form content, dark bottom navigation bar, orange accent, and blue Continue button.
- The screenshots show only a subset of distinct data-entry screens (some are alternate states of the same interest-selection screen), although the brief requires eight steps. To meet the eight-step requirement without omitting the visible screens, steps 1–6 map to the visible profile, goals, interstitial, interests, skills, and profile-setup concepts; steps 7–8 are reasonable, clearly labeled assumptions for links/learning sources and review. Step 3 is a non-data promotional interstitial based on the supplied proof/benefits screen. Required fields are kept minimal and documented in `client/src/pages/Onboarding.jsx`.
- Google/Facebook/LinkedIn buttons are omitted as functional sign-in options because the company explicitly says Google Sign-In is not required; the sign-up/login reference keeps the same layout and provides a clear email/password path.

## Requirements
- Node.js 20+ and npm
- MongoDB locally or MongoDB Atlas

## Setup
1. Install Node.js from https://nodejs.org/ and configure MongoDB.
2. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` and a long random `JWT_SECRET`.
3. Copy `client/.env.example` to `client/.env` if the API URL differs from the default.
4. From the project root run `npm install`, then `npm install --prefix server`, then `npm install --prefix client`.
5. Run both servers with `npm run dev` from the root. Client: http://localhost:5173, API: http://localhost:5000/api/health.
6. Production frontend build: `npm run build`.
7. Backend tests: `npm test`.

## API
- `POST /api/auth/register` — `{ name, email, password }`
- `POST /api/auth/login` — `{ email, password }`
- `GET /api/auth/me` — authenticated user
- `GET /api/onboarding` — get draft/responses
- `GET /api/onboarding/step/:stepNumber` — get one step
- `PUT /api/onboarding/step/:stepNumber` — save one step, without overwriting others
- `POST /api/onboarding/complete` — validate all required steps and mark completed
- `GET /api/dashboard` — authenticated profile, responses, completion status
- `GET /api/health` — health check

## Persistence and security
- Passwords are bcrypt-hashed; API responses never include the hash.
- JWT bearer token expires after 7 days and is held in sessionStorage by the frontend (cleared on logout/tab session end). For production deployments, consider an HttpOnly secure cookie with CSRF protection.
- Every onboarding document is scoped to the authenticated user and has a unique `userId` index.
- Saving a step updates only that step with a MongoDB atomic update, preserving other steps. The frontend saves before advancing and fetches persisted data on load/back/refresh.
- Final submission is server-validated; step 3 is a non-data interstitial and steps 7–8 are the documented assumptions above.

## Troubleshooting
- `MongoDB connection failed`: check that MongoDB is running and `MONGODB_URI` is correct.
- `401 Unauthorized`: log in again; JWTs expire after seven days.
- CORS errors: ensure `CLIENT_URL` matches the frontend origin.
- Port in use: change `PORT` in `server/.env` or stop the process occupying it.

## Tests
`npm test` exercises validation helpers. A live MongoDB integration journey must be run with a configured database; no live database credentials are included in this ZIP.

## Recent UI behavior updates
- Back navigation no longer saves or validates the current step; it returns immediately so users can leave an incomplete step without losing the local draft.
- The duplicate interest/skills screen is removed from the visible flow. The single “What's your Interest?” screen uses the second screen's searchable, up-to-five skills selection and persists the selections to both legacy `step4.interests` and `step5.skills` fields for backend completion validation.
- The final dashboard is a static completion page with a logout action; it does not fetch personalized dashboard data.
- The visible flow skips legacy route `/onboarding/5`, which redirects to the single interest screen at `/onboarding/4`.
