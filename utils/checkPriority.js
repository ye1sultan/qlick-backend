import UserModel from '../models/User.js';

export default async (req, res, next) => {
    const userId = req.userId;

    if (!userId) {
        return res.status(403).json({
            message: "User ID not found in request"
        });
    }

    try {
        const user = await UserModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        req.userPriority = user.priority;

        next();
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}