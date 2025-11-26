const Item = require("../models/Item");
const { logProductView } = require("../utils/viewTracking");
const { isValidTitle, isValidDescription, isValidImageUrl } = require('../utils/validation');


// CREATE ITEM
exports.createItem = async (req, res) => {
  try {
    // Backend validation
    const title = (req.body.title || '').toString().trim();
    const description = (req.body.description || '').toString().trim();
    const TITLE_MAX = 70; // characters
    const DESCRIPTION_MAX = 3000; // characters

    if (!title) return res.status(400).json({ message: 'Title is required' });
    if (title.length > TITLE_MAX) return res.status(400).json({ message: `Title must be at most ${TITLE_MAX} characters` });
    if (!description) return res.status(400).json({ message: 'Description is required' });
    if (description.length > DESCRIPTION_MAX) return res.status(400).json({ message: `Description must be at most ${DESCRIPTION_MAX} characters` });

    // Enforce canonical categories on create
    const ALLOWED = ['Electronics','Home Goods','Fashion','Games','Books','Sports','Others'];
    if (req.body.category && !ALLOWED.includes(req.body.category)) {
      return res.status(400).json({ message: `Invalid category. Allowed: ${ALLOWED.join(', ')}` });
    }

    // Basic validation: title and description already checked above with length limits
    // Image URL is optional — no strict validation needed
    
    // Restore gibberish detection: reject random letter strings
    const { isLikelyValidText } = require('../utils/validation');
    if (!isLikelyValidText(req.body.title)) {
      return res.status(400).json({ message: 'Title appears to be gibberish. Please enter a real product name.' });
    }
    if (!isLikelyValidText(req.body.description)) {
      return res.status(400).json({ message: 'Description appears to be gibberish. Please describe your product properly.' });
    }
    
    const item = await Item.create({
      ...req.body,
      owner: req.user._id
    });

    res.json(item);

  } catch (err) {
    console.error("CREATE ITEM ERROR:", err);
    res.status(500).json({ message: "Error creating item", error: err.message });
  }
};


// GET ALL ITEMS WITH FILTERING
exports.getItems = async (req, res) => {
  try {
    const query = {};

    // Search text (q)
    if (req.query.q) {
      query.$or = [
        { title: { $regex: req.query.q, $options: "i" } },
        { description: { $regex: req.query.q, $options: "i" } }
      ];
    }

    // Category filter - match exact category (case-insensitive)
    if (req.query.category) {
      // escape any regex chars in user input to avoid unexpected matches
      const escaped = req.query.category.replace(/[-\\/\\^$*+?.()|[\]{}]/g, "\\$&");
      query.category = { $regex: `^${escaped}$`, $options: "i" };
    }

    // Location filter
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: "i" };
    }

    const items = await Item.find(query)
      .populate("owner", "name location")
      .sort({ createdAt: -1 });

    res.json(items);

  } catch (err) {
    console.error("FILTER ERROR:", err);
    res.status(500).json({ message: "Error fetching filtered items" });
  }
};


// GET ITEM BY ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      "owner",
      "name location"
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Log view in background
    logProductView(req.params.id, 'Item', req.user || null);

    res.json(item);

  } catch (err) {
    console.error("GET ITEM ERROR:", err);
    res.status(500).json({ message: "Error fetching item", error: err.message });
  }
};
