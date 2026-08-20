const Item = require("../models/Item");
const ProductAnalytics = require("../models/ProductAnalytics");
const { logProductView } = require("../utils/viewTracking");

// CREATE ITEM
exports.createItem = async (req, res) => {
  try {
    // Backend validation
    const title = (req.body.title || "").toString().trim();
    const description = (req.body.description || "").toString().trim();

    const TITLE_MAX = 70;
    const DESCRIPTION_MAX = 3000;

    // Validate title
    if (!title) {
      return res.status(400).json({
        message: "Title is required"
      });
    }

    if (title.length > TITLE_MAX) {
      return res.status(400).json({
        message: `Title must be at most ${TITLE_MAX} characters`
      });
    }

    // Validate description
    if (!description) {
      return res.status(400).json({
        message: "Description is required"
      });
    }

    if (description.length > DESCRIPTION_MAX) {
      return res.status(400).json({
        message: `Description must be at most ${DESCRIPTION_MAX} characters`
      });
    }

    // Allowed categories
    const ALLOWED = [
      "Electronics",
      "Home Goods",
      "Fashion",
      "Games",
      "Books",
      "Sports",
      "Others"
    ];

    if (req.body.category && !ALLOWED.includes(req.body.category)) {
      return res.status(400).json({
        message: `Invalid category. Allowed: ${ALLOWED.join(", ")}`
      });
    }

    // Create item
    const item = await Item.create({
      ...req.body,
      title,
      description,
      owner: req.user._id
    });

    res.status(201).json(item);

  } catch (err) {
    console.error("CREATE ITEM ERROR:", err);

    res.status(500).json({
      message: "Error creating item",
      error: err.message
    });
  }
};


// GET ALL ITEMS WITH FILTERING
exports.getItems = async (req, res) => {
  try {
    const query = {};

    // Search by title or description
    if (req.query.q) {
      query.$or = [
        {
          title: {
            $regex: req.query.q,
            $options: "i"
          }
        },
        {
          description: {
            $regex: req.query.q,
            $options: "i"
          }
        }
      ];
    }

    // Category filter
    if (req.query.category) {
      const escaped = req.query.category.replace(
        /[-\\/\\^$*+?.()|[\]{}]/g,
        "\\$&"
      );

      query.category = {
        $regex: `^${escaped}$`,
        $options: "i"
      };
    }

    // Location filter
    if (req.query.location) {
      query.location = {
        $regex: req.query.location,
        $options: "i"
      };
    }

    // Get items
    const items = await Item.find(query)
      .populate("owner", "name location")
      .sort({ createdAt: -1 });

    res.json(items);

  } catch (err) {
    console.error("FILTER ERROR:", err);

    res.status(500).json({
      message: "Error fetching filtered items",
      error: err.message
    });
  }
};


// GET ITEM BY ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("owner", "name location");

    // Item not found
    if (!item) {
      return res.status(404).json({
        message: "Item not found"
      });
    }

    // Log product view in the background
    try {
      await logProductView(
        req.params.id,
        "Item",
        req.user || null
      );
    } catch (viewError) {
      console.error("Error logging product view:", viewError);
    }

    // Increment product views
    try {
      await ProductAnalytics.findOneAndUpdate(
        { productId: req.params.id },
        {
          $inc: {
            views: 1
          }
        },
        {
          upsert: true,
          new: true
        }
      );
    } catch (analyticsErr) {
      console.error(
        "Error incrementing views analytics:",
        analyticsErr
      );
    }

    // Send item details
    res.json(item);

  } catch (err) {
    console.error("GET ITEM ERROR:", err);

    res.status(500).json({
      message: "Error fetching item",
      error: err.message
    });
  }
};