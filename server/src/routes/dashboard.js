import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import FormEntry from '../models/FormEntry.js';
const router = Router();
router.get('/', requireAuth, async (req, res, next) => { try { const entry = await FormEntry.findOne({ userId: req.user._id }); res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email }, entry, completionStatus: entry?.completionStatus || 'in_progress' }); } catch (e) { next(e); } });
export default router;
