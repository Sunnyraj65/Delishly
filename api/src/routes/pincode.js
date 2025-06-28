import express from 'express';

const router = express.Router();

// List of allowed pincodes (for demo purposes; in real app, fetch from DB)
const allowedPincodes = ['110001', '560001', '400001', '800001'];

/**
 * GET /pincode/check/:pincode
 * Simple availability check.
 * Response: { serviceable: boolean }
 */
router.get('/check/:pincode', (req, res) => {
  const { pincode } = req.params;
  const isAvailable = allowedPincodes.includes(pincode);
  res.json({ serviceable: isAvailable });
});

export default router;
