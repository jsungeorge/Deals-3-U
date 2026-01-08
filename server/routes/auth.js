const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Save User
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });
    const savedUser = await newUser.save();

    // 4. Create Token
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET);

    // 5. Respond with Token + User Info (including dateJoined)
    res.json({
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        dateJoined: savedUser.dateJoined
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // 2. Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    // 3. Respond
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dateJoined: user.dateJoined // <--- Send this!
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;