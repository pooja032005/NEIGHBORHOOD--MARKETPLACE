// backend/controllers/orderController.js
const Order = require('../models/Order');
const Address = require('../models/Address');
const Item = require('../models/Item');
const User = require('../models/User');

// Create an order
exports.createOrder = async (req, res) => {
  try {
    const { itemId, quantity = 1, totalPrice, deliveryAddress, paymentMethod, saveAddress } = req.body;
    const userId = req.user._id;

    // Validate item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Create order
    const order = await Order.create({
      userId,
      itemId,
      quantity,
      totalPrice,
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
      orderStatus: 'confirmed',
      estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    });

    // Save address if requested
    if (saveAddress && deliveryAddress) {
      await Address.create({
        userId,
        ...deliveryAddress,
      });
    }

    // Populate order details
    await order.populate(['userId', 'itemId']);

    res.status(201).json({
      message: 'Order placed successfully',
      orderId: order._id,
      order,
    });
  } catch (err) {
    console.error('CREATE ORDER ERROR:', err);
    res.status(500).json({ message: 'Error creating order', error: err.message });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ userId })
      .populate('itemId')
      .sort({ createdAt: -1 });

    res.json({
      orders,
      total: orders.length,
    });
  } catch (err) {
    console.error('GET ORDERS ERROR:', err);
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};

// Get single order
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('userId')
      .populate('itemId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify ownership
    if (order.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(order);
  } catch (err) {
    console.error('GET ORDER ERROR:', err);
    res.status(500).json({ message: 'Error fetching order', error: err.message });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, trackingNumber, notes } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        orderStatus,
        ...(trackingNumber && { trackingNumber }),
        ...(notes && { notes }),
      },
      { new: true }
    ).populate('itemId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order updated',
      order,
    });
  } catch (err) {
    console.error('UPDATE ORDER ERROR:', err);
    res.status(500).json({ message: 'Error updating order', error: err.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (['shipped', 'delivered'].includes(order.orderStatus)) {
      return res.status(400).json({ message: 'Cannot cancel shipped/delivered order' });
    }

    order.orderStatus = 'cancelled';
    await order.save();

    res.json({
      message: 'Order cancelled successfully',
      order,
    });
  } catch (err) {
    console.error('CANCEL ORDER ERROR:', err);
    res.status(500).json({ message: 'Error cancelling order', error: err.message });
  }
};

// Create service order (booking-based order)
exports.createServiceOrder = async (req, res) => {
  try {
    const { serviceId, totalPrice, deliveryAddress, paymentMethod } = req.body;
    const userId = req.user._id;

    // Validate service exists
    const Service = require('../models/Service');
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Create order for service
    const order = await Order.create({
      userId,
      itemId: serviceId, // Store service ID as itemId for compatibility
      quantity: 1,
      totalPrice,
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
      orderStatus: 'confirmed',
      estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    });

    // Populate details
    await order.populate(['userId', 'itemId']);

    res.status(201).json({
      message: 'Service order placed successfully',
      orderId: order._id,
      order,
    });
  } catch (err) {
    console.error('CREATE SERVICE ORDER ERROR:', err);
    res.status(500).json({ message: 'Error creating service order', error: err.message });
  }
};

// Get all addresses for user
exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.user._id;
    const addresses = await Address.find({ userId }).sort({ createdAt: -1 });

    res.json(addresses);
  } catch (err) {
    console.error('GET ADDRESSES ERROR:', err);
    res.status(500).json({ message: 'Error fetching addresses', error: err.message });
  }
};

// Add new address
exports.addAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, phone, email, houseNumber, area, city, state, pincode, isDefault } = req.body;

    // If this is default, unset previous default
    if (isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    }

    const address = await Address.create({
      userId,
      name,
      phone,
      email,
      houseNumber,
      area,
      city,
      state,
      pincode,
      isDefault: isDefault || false,
    });

    res.status(201).json({
      message: 'Address added',
      address,
    });
  } catch (err) {
    console.error('ADD ADDRESS ERROR:', err);
    res.status(500).json({ message: 'Error adding address', error: err.message });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user._id;

    const address = await Address.findByIdAndDelete(addressId);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (address.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({ message: 'Address deleted' });
  } catch (err) {
    console.error('DELETE ADDRESS ERROR:', err);
    res.status(500).json({ message: 'Error deleting address', error: err.message });
  }
};
