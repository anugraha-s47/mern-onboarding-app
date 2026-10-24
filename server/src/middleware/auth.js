import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ message: 'Please log in to continue.' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub).select('_id name email');
    if (!user) return res.status(401).json({ message: 'Session is no longer valid. Please log in again.' });
    req.user = user; next();
  } catch { return res.status(401).json({ message: 'Your session is invalid or expired. Please log in again.' }); }
}
