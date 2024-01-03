import jwt from 'jsonwebtoken';
import GateRecordModel from '../models/GateRecord.js';

export const scanQR = async (req, res) => {
    const { qrToken } = req.body; // Assuming the scanned QR code token is sent in the request body
    if (!qrToken) {
        return res.status(400).json({ message: "QR token is required" });
    }

    try {
        const decoded = jwt.verify(qrToken, "EasyAccessERD");
        const userId = req.userId;
        const { gateId } = decoded;

        // Determine the last action of the user at this gate
        const lastRecord = await GateRecordModel.findOne({ userId, gateId }).sort({ timestamp: -1 });

        let action = 'entry';
        if (lastRecord && lastRecord.action === 'entry') {
            action = 'exit';
        }

        const currentTimeUtcPlus6 = new Date(new Date().getTime() + (360 * 60000)); // 360 minutes = 6 hours

        // Create a new record
        const newRecord = new GateRecordModel({
            userId,
            gateId,
            action,
            timestamp: currentTimeUtcPlus6
        });
        await newRecord.save();

        res.json({ success: true, action, timestamp: newRecord.timestamp });
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: "Invalid QR token" });
        } else if (err.name === 'TokenExpiredError') {
            return res.status(400).json({ message: "QR token has expired" });
        } else {
            // Handle other unexpected errors
            console.error('Scan QR Error:', err);
            return res.status(500).json({ message: "An error occurred while processing your request" });
        }
    }
};