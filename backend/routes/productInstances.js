const express = require('express');
const router = express.Router();
const ProductInstance = require('../models/ProductInstance');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/product-instances
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { product_id } = req.query;
    const filter = {};
    if (product_id) filter.product_id = product_id;

    const instances = await ProductInstance.find(filter)
      .populate('product_id', 'name key')
      .populate('activated_by', 'name email')
      .sort({ created_at: -1 });
    
    res.json(instances);
  } catch (error) {
    console.error('Get product instances error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// POST /api/product-instances/generate
router.post('/generate', protect, adminOnly, async (req, res) => {
  try {
    const { product_id, quantity = 10, prefix = 'THERA' } = req.body;
    
    if (!product_id) {
      return res.status(400).json({ error: 'Thiếu product_id' });
    }
    if (quantity < 1 || quantity > 100) {
      return res.status(400).json({ error: 'Số lượng phải từ 1-100' });
    }

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const instances = [];
    
    for (let i = 0; i < quantity; i++) {
      let activation_code = prefix + '-';
      for (let j = 0; j < 8; j++) {
        if (j === 4) activation_code += '-';
        activation_code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      instances.push({
        product_id,
        activation_code,
        is_activated: false
      });
    }

    const result = await ProductInstance.insertMany(instances);
    res.status(201).json(result);
  } catch (error) {
    console.error('Generate instances error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// PUT /api/product-instances/:id
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { is_activated } = req.body;
    const item = await ProductInstance.findByIdAndUpdate(
      req.params.id,
      { is_activated },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ error: 'Không tìm thấy mã sản phẩm' });
    res.json(item);
  } catch (error) {
    console.error('Update product instance error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// DELETE /api/product-instances/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await ProductInstance.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Không tìm thấy mã sản phẩm' });
    res.json({ message: 'Đã xóa' });
  } catch (error) {
    console.error('Delete product instance error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
