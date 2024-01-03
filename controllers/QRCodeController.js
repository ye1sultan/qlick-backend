import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';

export const getQR = async (req, res) => {
    const generateQRCodeJWT = () => {
        const payload = {
            gateId: 'GATE_01'
        };

        const token = jwt.sign(payload, "EasyAccessERD", { expiresIn: '1m' });
        return token;
    };

    // Function to create a QR code
    const createQRCode = async () => {
        try {
            const jwtToken = generateQRCodeJWT();
            const url = await QRCode.toDataURL(jwtToken);
            return url;
        } catch (err) {
            console.error('Error generating QR code:', err);
            return null;
        }
    };

    // Refresh QR Code every minute
    let currentQRCodeURL = await createQRCode();
    setInterval(async () => {
        currentQRCodeURL = await createQRCode();
    }, 60000); // 60,000 milliseconds = 1 minute

    if (currentQRCodeURL) {
        res.json({ qrCodeURL: currentQRCodeURL });
    } else {
        res.status(500).json({ message: "Error generating QR code" });
    }
}