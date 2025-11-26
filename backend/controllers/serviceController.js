const Service = require("../models/Service");
const { logProductView } = require("../utils/viewTracking");
const { isValidTitle, isValidDescription, isValidImageUrl } = require('../utils/validation');

// CREATE service
exports.createService = async (req, res) => {
  try {
    // If a file was uploaded via multer, set imageUrl to uploaded path
    const payload = { ...req.body };
    if (req.file && req.file.filename) {
      payload.imageUrl = `/uploads/${req.file.filename}`;
    }

    // Backend validation (character limits)
    const title = (payload.title || '').toString().trim();
    const description = (payload.description || '').toString().trim();
    const TITLE_MAX = 70;
    const DESCRIPTION_MAX = 3000;

    if (!title) return res.status(400).json({ message: 'Title is required' });
    if (title.length > TITLE_MAX) return res.status(400).json({ message: `Title must be at most ${TITLE_MAX} characters` });
    if (!description) return res.status(400).json({ message: 'Description is required' });
    if (description.length > DESCRIPTION_MAX) return res.status(400).json({ message: `Description must be at most ${DESCRIPTION_MAX} characters` });
    // Enforce canonical categories on create
    const ALLOWED = ['Electronics','Home Goods','Fashion','Games','Books','Sports','Others'];
    if (payload.category && !ALLOWED.includes(payload.category)) {
      return res.status(400).json({ message: `Invalid category. Allowed: ${ALLOWED.join(', ')}` });
    }

    // Basic validation: title and description already checked above with length limits
    // Services can have optional images via file upload
    
    // Restore gibberish detection
    const { isLikelyValidText } = require('../utils/validation');
    if (!isLikelyValidText(payload.title)) {
      return res.status(400).json({ message: 'Title appears to be gibberish. Please enter a real service name.' });
    }
    if (!isLikelyValidText(payload.description)) {
      return res.status(400).json({ message: 'Description appears to be gibberish. Please describe your service properly.' });
    }
    
    const service = await Service.create({
      ...payload,
      provider: req.user._id
    });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: "Error creating service", error: err.message });
  }
};

// GET ALL services WITH FILTERING
exports.getServices = async (req, res) => {
  try {
    const query = {};

    // Search text (q)
    if (req.query.q) {
      query.$or = [
        { title: { $regex: req.query.q, $options: "i" } },
        { description: { $regex: req.query.q, $options: "i" } }
      ];
    }

    // Location filter
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: "i" };
    }

    // Category filter (optional) - match exact category (case-insensitive)
    if (req.query.category) {
      const escaped = req.query.category.replace(/[-\\/\\^$*+?.()|[\]{}]/g, "\\$&");
      query.category = { $regex: `^${escaped}$`, $options: "i" };
    }

    const services = await Service.find(query)
      .populate("provider", "name location email phone")
      .sort({ createdAt: -1 });

    res.json(services);
  } catch (err) {
    console.error("FILTER ERROR:", err);
    res.status(500).json({ message: "Error fetching services" });
  }
};

// GET service BY ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate("provider", "name location email phone");
    if (!service) return res.status(404).json({ message: "Service not found" });

    // Log view in background
    logProductView(req.params.id, 'Service', req.user || null);

    res.json(service);
  } catch (err) {
    res.status(500).json({ message: "Error fetching service", error: err.message });
  }
};

// BOOK SERVICE
exports.bookService = async (req, res) => {
  try {
    const { serviceId, date, time, notes } = req.body;
    
    const service = await Service.findById(serviceId).populate("provider", "name email phone");
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const booking = {
      _id: new Date().getTime(),
      serviceId,
      service: {
        title: service.title,
        price: service.price,
        priceType: service.priceType,
        provider: service.provider
      },
      userId: req.user._id,
      date,
      time,
      notes,
      status: "pending",
      createdAt: new Date()
    };

    res.json({
      message: "Service booked successfully",
      bookingId: booking._id,
      booking
    });

  } catch (err) {
    console.error("BOOKING ERROR:", err);
    res.status(500).json({ message: "Error booking service", error: err.message });
  }
};

// GET PROVIDER CONTACT INFO
exports.getProviderContact = async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId).populate("provider", "name email phone location");
    
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const provider = service.provider;
    res.json({
      name: provider.name || "Provider",
      email: provider.email || "contact@example.com",
      phone: provider.phone || "+91-9999999999",
      location: provider.location || "India"
    });

  } catch (err) {
    console.error("CONTACT ERROR:", err);
    res.status(500).json({ message: "Error fetching provider contact" });
  }
};
