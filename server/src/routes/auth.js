import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import FormEntry from '../models/FormEntry.js';
import {
  validateLogin,
  validateRegister
} from '../validators/onboarding.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const publicUser = user => ({
  id: user._id,
  name: user.name,
  email: user.email
});

const tokenFor = user =>
  jwt.sign(
    { sub: user._id.toString() },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
      issuer: 'record-onboarding'
    }
  );

router.post('/register', async (req, res, next) => {
  try {
    const errors = validateRegister(req.body);

    if (Object.keys(errors).length) {
      return res.status(400).json({
        message: 'Please correct the highlighted fields.',
        errors
      });
    }

    const email = req.body.email.trim().toLowerCase();

    if (await User.exists({ email })) {
      return res.status(409).json({
        message: 'An account with this email already exists.'
      });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 12);

    const user = await User.create({
      name: req.body.name.trim(),
      email,
      passwordHash
    });

    await FormEntry.create({ userId: user._id });

    return res.status(201).json({
      message: 'Account created successfully. Please log in.',
      user: publicUser(user)
    });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({
        message: 'An account with this email already exists.'
      });
    }

    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const errors = validateLogin(req.body);

    if (Object.keys(errors).length) {
      return res.status(400).json({
        message: 'Enter your email and password.',
        errors
      });
    }

    const user = await User.findOne({
      email: req.body.email.trim().toLowerCase()
    }).select('+passwordHash');

    if (
      !user ||
      !(await bcrypt.compare(req.body.password, user.passwordHash))
    ) {
      return res.status(401).json({
        message: 'Email or password is incorrect.'
      });
    }

    await FormEntry.updateOne(
      { userId: user._id },
      { $setOnInsert: { userId: user._id } },
      { upsert: true }
    );

    const entry = await FormEntry.findOne({
      userId: user._id
    }).select('completionStatus');

    return res.json({
      message: 'Login successful.',
      token: tokenFor(user),
      user: publicUser(user),
      completionStatus: entry?.completionStatus || 'in_progress'
    });
  } catch (e) {
    next(e);
  }
});

router.get('/me', requireAuth, (req, res) =>
  res.json({
    user: publicUser(req.user)
  })
);

export default router;
