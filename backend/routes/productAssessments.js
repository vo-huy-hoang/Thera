const express = require('express');
const router = express.Router();
const ProductAssessment = require('../models/ProductAssessment');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

function serializeAssessment(item) {
  return {
    id: item._id,
    user_id: item.user_id?._id || item.user_id,
    product_id: item.product_id?._id || item.product_id,
    rating: item.rating,
    comment: item.comment || '',
    product: item.product_id && typeof item.product_id === 'object'
      ? {
          id: item.product_id._id,
          key: item.product_id.key,
          name: item.product_id.name,
          purchase_link: item.product_id.purchase_link || '',
          is_active: item.product_id.is_active,
        }
      : null,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

// GET /api/product-assessments/mine
router.get('/mine', protect, async (req, res) => {
  try {
    const items = await ProductAssessment.find({ user_id: req.user._id })
      .populate('product_id')
      .sort({ updated_at: -1 });

    res.json(items.map(serializeAssessment));
  } catch (error) {
    console.error('Get my product assessments error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/product-assessments/product/:productId
router.get('/product/:productId', protect, async (req, res) => {
  try {
    const item = await ProductAssessment.findOne({
      user_id: req.user._id,
      product_id: req.params.productId,
    }).populate('product_id');

    if (!item) {
      return res.json(null);
    }

    res.json(serializeAssessment(item));
  } catch (error) {
    console.error('Get product assessment by product error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// POST /api/product-assessments
router.post('/', protect, async (req, res) => {
  try {
    const { product_id, rating, comment = '' } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'Thiếu product_id' });
    }

    if (!Number.isFinite(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ error: 'rating phải từ 1 đến 5' });
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }

    const item = await ProductAssessment.findOneAndUpdate(
      {
        user_id: req.user._id,
        product_id,
      },
      {
        user_id: req.user._id,
        product_id,
        rating: Number(rating),
        comment: typeof comment === 'string' ? comment.trim() : '',
        updated_at: new Date(),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    ).populate('product_id');

    res.status(201).json(serializeAssessment(item));
  } catch (error) {
    console.error('Create/update product assessment error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// DELETE /api/product-assessments/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await ProductAssessment.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ error: 'Không tìm thấy đánh giá' });
    }

    res.json({ message: 'Đã xóa đánh giá' });
  } catch (error) {
    console.error('Delete product assessment error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
