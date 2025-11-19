// backend/routes/orders.js
const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  createServiceOrder,
  getUserAddresses,
  addAddress,
  deleteAddress,
} = require('../controllers/orderController');
const { auth } = require('../utils/authMiddleware');

// Order Routes
router.post('/create', auth, createOrder);
router.post('/service/create', auth, createServiceOrder);
router.get('/', auth, getUserOrders);
router.get('/:orderId', auth, getOrderById);
router.put('/:orderId/status', auth, updateOrderStatus);
router.delete('/:orderId', auth, cancelOrder);

// Address Routes
router.get('/addresses/list', auth, getUserAddresses);
router.post('/addresses/add', auth, addAddress);
router.delete('/addresses/:addressId', auth, deleteAddress);

module.exports = router;
