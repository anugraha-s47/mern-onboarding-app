import { Router } from 'express';
import FormEntry from '../models/FormEntry.js';
import { requireAuth } from '../middleware/auth.js';
import {
  STEP_COUNT,
  validateComplete,
  validateStep
} from '../validators/onboarding.js';

const router = Router();

router.use(requireAuth);

async function getOrCreate(userId) {
  return FormEntry.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );
}

router.get('/', async (req, res, next) => {
  try {
    res.json({
      entry: await getOrCreate(req.user._id)
    });
  } catch (e) {
    next(e);
  }
});

router.get('/step/:stepNumber', async (req, res, next) => {
  try {
    const n = Number(req.params.stepNumber);

    if (!Number.isInteger(n) || n < 1 || n > STEP_COUNT) {
      return res.status(400).json({
        message: 'Step number must be between 1 and 8.'
      });
    }

    const entry = await getOrCreate(req.user._id);

    res.json({
      step: n,
      data: entry[`step${n}`] || {}
    });
  } catch (e) {
    next(e);
  }
});

router.put('/step/:stepNumber', async (req, res, next) => {
  try {
    const n = Number(req.params.stepNumber);
    const draftSave = req.query.draft === 'true';
    const error = draftSave ? null : validateStep(n, req.body);

    if (error) {
      return res.status(400).json({
        message: error
      });
    }

    const key = `step${n}`;

    const entry = await FormEntry.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
          [key]: req.body,
          completionStatus: 'in_progress'
        },
        $setOnInsert: {
          userId: req.user._id
        }
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    res.json({
      message: 'Saved successfully.',
      step: n,
      data: entry[key],
      updatedAt: entry.updatedAt
    });
  } catch (e) {
    next(e);
  }
});

router.post('/complete', async (req, res, next) => {
  try {
    const entry = await getOrCreate(req.user._id);
    const error = validateComplete(entry);

    if (error) {
      return res.status(400).json({
        message: 'Your onboarding is incomplete.',
        error
      });
    }

    entry.completionStatus = 'completed';
    entry.completedAt = new Date();

    await entry.save();

    res.json({
      message: 'Onboarding completed successfully.',
      completedAt: entry.completedAt
    });
  } catch (e) {
    next(e);
  }
});

export default router;
