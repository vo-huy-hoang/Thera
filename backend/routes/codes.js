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

// POST /api/codes/activate - Verify an activated product instance and attach it to user
router.post('/activate', protect, async (req, res) => {
  try {
    const code = typeof req.body.code === 'string' ? req.body.code.trim().toUpperCase() : '';
    if (!code) {
      return res.status(400).json({ error: 'Thiếu mã kích hoạt' });
    }
    
    const productInstance = await ProductInstance.findOne({
      activation_code: code,
      is_activated: true,
    }).populate('product_id');

    if (!productInstance) {
      return res.status(400).json({ error: 'Mã không hợp lệ hoặc chưa được kích hoạt' });
    }

    const product = productInstance.product_id;
    const deviceEntry = {
      key: product?.key || '',
      name: product?.name || '',
      activation_code: productInstance.activation_code,
    };

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy user' });
    }

    const currentDevices = Array.isArray(user.owned_devices) ? user.owned_devices : [];
    const filteredDevices = currentDevices.filter((item) => {
      if (typeof item === 'string') {
        return item !== deviceEntry.key && item !== deviceEntry.name;
      }
      return item?.activation_code !== deviceEntry.activation_code;
    });

    user.owned_devices = [...filteredDevices, deviceEntry];
    user.is_pro = true;
    user.updated_at = new Date();
    await user.save();

    res.json({
      message: 'Đã thêm thiết bị thành công',
      is_pro: true,
      device: deviceEntry,
      user,
    });
  } catch (error) {
    console.error('Activation Error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// POST /api/codes/validate - Check if a product instance code is already activated and can be claimed after login
router.post('/validate', async (req, res) => {
  try {
    const code = typeof req.body.code === 'string' ? req.body.code.trim().toUpperCase() : '';
    if (!code) {
      return res.status(400).json({ error: 'Thiếu mã kích hoạt' });
    }

    const productInstance = await ProductInstance.findOne({
      activation_code: code,
      is_activated: true,
    }).populate('product_id');

    if (!productInstance) {
      return res.status(400).json({ error: 'Mã không hợp lệ hoặc chưa được kích hoạt' });
    }

    const product = productInstance.product_id;

    res.json({
      valid: true,
      code,
      product: {
        key: product?.key || '',
        name: product?.name || '',
      },
    });
  } catch (error) {
    console.error('Validate activation code error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
