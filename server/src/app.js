import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import onboardingRoutes from './routes/onboarding.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: "5mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "5mb"
  })
);

app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false
  }),
  authRoutes
);

app.get('/api/health', (_req, res) =>
  res.json({
    status: 'ok',
    service: 'record-onboarding-api'
  })
);

app.use('/api/onboarding', onboardingRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((_req, res) =>
  res.status(404).json({
    message: 'Endpoint not found.'
  })
);

app.use((err, _req, res, _next) => {
  console.error(err.message);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Submitted data is invalid.'
    });
  }

  if (err.name === 'MongoServerError' && err.code === 11000) {
    return res.status(409).json({
      message: 'This record already exists.'
    });
  }

  res.status(500).json({
    message: 'Something went wrong. Please try again.'
  });
});

export default app;