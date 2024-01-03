import mongoose from "mongoose";

const GateRecordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gateId: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    action: {
        type: String,
        enum: ['entry', 'exit'],
        required: true
    },
});

// Function to generate a hash from QR token
GateRecordSchema.methods.generateQRCodeHash = function(qrToken) {
    return crypto.createHash('sha256').update(qrToken).digest('hex');
};

export default mongoose.model("GateRecord", GateRecordSchema);