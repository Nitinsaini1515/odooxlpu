const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// GET all notifications for the current user's role
router.get('/', protect, async (req, res) => {
  try {
    const userRole = req.user.role;
    const filter = {
      $or: [{ targetRole: 'all' }, { targetRole: userRole }],
    };

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(30);

    const formatted = notifications.map((n) => {
      const isRead = n.readBy.some((uid) => uid.toString() === req.user._id.toString());
      return {
        ...n.toObject(),
        isRead,
      };
    });

    const unreadCount = formatted.filter((n) => !n.isRead).length;

    return res.json({
      success: true,
      unreadCount,
      notifications: formatted,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Mark all as read
router.post('/mark-all-read', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Mark single as read
router.post('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      $addToSet: { readBy: req.user._id },
    });

    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
