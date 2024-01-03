import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User.js';

export const createAccount = async (req, res) => {
    const creatorPriority = req.userPriority;
    const newAccountPriority = req.body.priority;
    const creatorId = req.userId; // ID of the user creating the account

    if (creatorPriority != 1) {
        if (newAccountPriority <= creatorPriority) {
            return res.status(403).json({ message: "Insufficient priority level to create this account" });
        }
    }

    try {
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const doc = new UserModel({
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            role: req.body.role,
            priority: req.body.priority,
            dateOfBirth: req.body.dateOfBirth,
            placeOfResidence: req.body.placeOfResidence,
            passwordHash: hash,
            createdBy: creatorId // Set the createdBy field with the ID of the creator
        });

        const user = await doc.save();

        const token = jwt.sign(
            {
                _id: user._id,
            },
            'EasyAccessERD',
            {
                expiresIn: '7d',
            },
        );

        const { passwordHash, ...userData } = user._doc;

        res.json({
            ...userData,
            token,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to create an account"
        });
    }
}

export const login = async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

        if (!isValidPass) {
            return res.status(400).json({
                message: "Incorrect email or password"
            });
        }

        const token = jwt.sign(
            {
                _id: user._id,
            },
            'EasyAccessERD',
            {
                expiresIn: '7d',
            },
        );

        const { passwordHash, ...userData } = user._doc;

        res.json({
            ...userData,
            token,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to authorise"
        });
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const { passwordHash, ...userData } = user._doc;

        res.json(userData);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "No access"
        });
    }
}

export const getAll = async (req, res) => {
    try {
        let users;
        const userPriority = req.userPriority;
        const userId = req.userId; // Assuming this is set by your authentication middleware

        if (userPriority === 1) {
            // If the user has priority 1, fetch all accounts
            users = await UserModel.find();
        } else {
            // If the user does not have priority 1, only fetch accounts they created
            users = await UserModel.find({ createdBy: userId });
        }

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Users not found"
        });
    }
}

export const getOne = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await UserModel.findOne({ _id: userId });

        if(!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to find user"
        });
    }
}

export const remove = async (req, res) => {
    try {
        const userId = req.params.id;

        // Fetch the user first to check if they exist and get their priority
        const userToDelete = await UserModel.findById(userId);
        if (!userToDelete) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the logged-in user has enough priority to delete this account
        if (req.userPriority != 1 && req.userPriority >= userToDelete.priority) {
            return res.status(403).json({
                message: "Insufficient priority level to remove this account"
            });
        }

        // Perform the deletion
        await UserModel.findOneAndDelete({ _id: userId });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to remove user"
        });
    }
}

export const update = async (req, res) => {
    try {
        const userIdToUpdate = req.params.id;
        const loggedInUserId = req.userId; // Set by your authentication middleware
        const loggedInUserPriority = req.userPriority;
        const newPriority = req.body.priority;

        // Fetch the user to be updated
        const userToUpdate = await UserModel.findById(userIdToUpdate);
        if (!userToUpdate) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the logged-in user is trying to update  their own priority
        if (loggedInUserId === userIdToUpdate && newPriority !== undefined && newPriority !== userToUpdate.priority) {
            // Allow priority change only if the user has the highest priority (1)
            if (loggedInUserPriority !== 1) {
                return res.status(403).json({
                    message: "You cannot change your own priority level"
                });
            }
        } else if (loggedInUserId !== userIdToUpdate && (loggedInUserPriority !== 1 && newPriority <= loggedInUserPriority)) {
            // Prevent users from setting other users' priority to their level or lower
            return res.status(403).json({
                message: "Insufficient priority level to update this account"
            });
        }

        // Prepare the data for update
        const updateData = {
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            role: req.body.role,
            priority: newPriority,
            dateOfBirth: req.body.dateOfBirth,
            placeOfResidence: req.body.placeOfResidence,
            // createdBy field should not be updated arbitrarily
        };

        // Update password if provided
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.passwordHash = await bcrypt.hash(req.body.password, salt);
        }

        // Perform the update
        await UserModel.findOneAndUpdate({ _id: userIdToUpdate }, updateData, { new: true });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to update user"
        });
    }
};