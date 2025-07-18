import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export function requireAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    try {
      const user = jwt.verify(token, JWT_SECRET);
      (req as any).user = user;
      return handler(req, res);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}

export function requireRole(role: string) {
  return (handler: NextApiHandler) => {
    return requireAuth((req: NextApiRequest, res: NextApiResponse) => {
      const user = (req as any).user;
      if (user.role !== role) {
        return res.status(403).json({ message: 'Forbidden: insufficient role' });
      }
      return handler(req, res);
    });
  };
} 