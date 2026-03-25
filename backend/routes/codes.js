const express = require('express');
const router = express.Router();
const ActivationCode = require('../models/ActivationCode');
const ProductInstance = require('../models/ProductInstance');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/codes
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const codes = await ActivationCode.find()
      .sort({ created_at: -1 })
      .limit(100);
    res.json(codes);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// POST /api/codes/generate - Generate batch codes (admin)
router.post('/generate', protect, adminOnly, async (req, res) => {
  try {
    const { quantity = 10, prefix = 'THERA' } = req.body;
    if (quantity < 1 || quantity > 100) {
      return res.status(400).json({ error: 'Số lượng phải từ 1-100' });
    }

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const codes = [];
    
    for (let i = 0; i < quantity; i++) {
      let code = prefix + '-';
      for (let j = 0; j < 8; j++) {
        if (j === 4) code += '-';
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      codes.push({ code, is_used: false });
    }

    const result = await ActivationCode.insertMany(codes);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// POST /api/codes/activate - Activate a code (mobile app)
router.post('/activate', protect, async (req, res) => {
  try {
    const { code } = req.body;
    
    // Check product instance code
    const productInstance = await ProductInstance.findOne({ activation_code: code, is_activated: false }).populate('product_id');
    if (!productInstance) {
      return res.status(400).json({ error: 'Mã không hợp lệ hoặc đã được sử dụng' });
    }

    productInstance.is_activated = true;
    productInstance.activated_by = req.user._id;
    productInstance.activated_at = new Date();
    await productInstance.save();

    // Add product key to owned_devices if Product exists
    const productKey = productInstance.product_id?.key;
    if (productKey) {
      await User.findByIdAndUpdate(req.user._id, { 
        $addToSet: { owned_devices: productKey },
        is_pro: true 
      });
    } else {
      await User.findByIdAndUpdate(req.user._id, { is_pro: true });
    }

    res.json({ message: 'Kích hoạt thành công', is_pro: true, device: productKey });
  } catch (error) {
    console.error('Activation Error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
