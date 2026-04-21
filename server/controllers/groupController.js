import Group from '../models/Group.js';
import Notification from '../models/Notification.js';

export const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body; // members is array of object ids
    
    // Auto include creator
    const allMembers = [...new Set([...members, req.user._id.toString()])];

    const group = await Group.create({
      name,
      description,
      members: allMembers,
      createdBy: req.user._id
    });

    // Notify users
    const notifications = members.map(mId => ({
        userId: mId,
        type: 'group_invite',
        message: `${req.user.name} added you to group "${name}".`,
        relatedId: group._id,
        relatedModel: 'Group'
    }));
    await Notification.insertMany(notifications);

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id }).populate('members', 'name email');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
