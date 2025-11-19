const Item = require("../models/Item");


// CREATE ITEM
exports.createItem = async (req, res) => {
  try {
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

    // Category filter
    if (req.query.category) {
      query.category = { $regex: req.query.category, $options: "i" };
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

    res.json(item);

  } catch (err) {
    console.error("GET ITEM ERROR:", err);
    res.status(500).json({ message: "Error fetching item", error: err.message });
  }
};
