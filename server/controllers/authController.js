const User = require('../models/User');

// @route POST /api/login
const login = async (req, res) => {
  const { user_id, name, password } = req.body;

  if (!user_id || !name || !password) {
    return res.status(400).json({ message: 'Please provide User ID, Name and Password' });
  }

  try {
    const user = await User.findOne({ user_id });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify name matches (case-insensitive)
    if (user.name.toLowerCase() !== name.trim().toLowerCase()) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    req.session.user = {
      _id:        user._id,
      user_id:    user.user_id,
      name:       user.name,
      role:       user.role,
      department: user.department
    };

    res.json({ success: true, user: req.session.user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route POST /api/register
const register = async (req, res) => {
  const { user_id, name, password, role, department } = req.body;

  if (!user_id || !name || !password || !role || !department) {
    return res.status(400).json({ message: 'All fields are required: User ID, Name, Password, Role, Department' });
  }

  if (!['student', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Role must be student or admin' });
  }

  try {
    // Check if user_id already taken
    const existing = await User.findOne({ user_id });
    if (existing) {
      return res.status(409).json({ message: `User ID "${user_id}" is already taken. Please choose another.` });
    }

    const user = await User.create({ user_id, name, password, role, department });

    res.status(201).json({
      success: true,
      message: 'Account created successfully! You can now log in.',
      user: {
        user_id: user.user_id,
        name:    user.name,
        role:    user.role,
        department: user.department
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route POST /api/logout
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out' });
  });
};

// @route GET /api/me
const getMe = (req, res) => {
  if (req.session.user) {
    return res.json({ success: true, user: req.session.user });
  }
  res.status(401).json({ message: 'Not authenticated' });
};

module.exports = { login, register, logout, getMe };
