import User from '../models/User.js';
import Notification from '../models/Notification.js';

export const searchUsers = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email query required' });

    // Find users excluding self, already friends, or pending request
    const user = await User.findById(req.user._id);
    const users = await User.find({
      email: { $regex: email, $options: 'i' },
      _id: { $ne: req.user._id, $nin: [...user.friends, ...user.pendingFriendRequests] }
    }).select('-password');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'name email').populate('pendingFriendRequests', 'name email');
    res.json({
      friends: user.friends,
      pendingRequests: user.pendingFriendRequests
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });
    
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot add yourself' });
    }

    const sender = await User.findById(req.user._id);
    
    if (targetUser.friends.some(id => id.toString() === req.user._id.toString()) || 
        sender.friends.some(id => id.toString() === targetUserId)) {
      return res.status(400).json({ message: 'User is already your friend' });
    }

    if (targetUser.pendingFriendRequests.some(id => id.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    targetUser.pendingFriendRequests.push(req.user._id);
    await targetUser.save();

    await Notification.create({
      userId: targetUserId,
      type: 'friend_request',
      message: `${req.user.name} sent you a friend request.`,
      relatedId: req.user._id,
      relatedModel: 'User'
    });

    res.json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { targetUserId } = req.body; // targetUserId is who sent the request

    const user = await User.findById(req.user._id);
    const sender = await User.findById(targetUserId);

    if (!user.pendingFriendRequests.some(id => id.toString() === targetUserId)) {
      return res.status(400).json({ message: 'No pending request found' });
    }

    user.pendingFriendRequests = user.pendingFriendRequests.filter(id => id.toString() !== targetUserId);
    if (!user.friends.some(id => id.toString() === targetUserId)) {
      user.friends.push(targetUserId);
    }
    await user.save();

    if (sender) {
      if (!sender.friends.some(id => id.toString() === req.user._id.toString())) {
        sender.friends.push(req.user._id);
      }
      await sender.save();
    }

    await Notification.create({
      userId: targetUserId,
      type: 'friend_accepted',
      message: `${req.user.name} accepted your friend request.`,
      relatedId: req.user._id,
      relatedModel: 'User'
    });

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const rejectFriendRequest = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const user = await User.findById(req.user._id);
        
        user.pendingFriendRequests = user.pendingFriendRequests.filter(id => id.toString() !== targetUserId);
        await user.save();
        
        res.json({ message: 'Friend request rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
