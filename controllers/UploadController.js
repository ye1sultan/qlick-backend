export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded"
            });
        }

        res.json({
            url: `/uploads/${req.file.originalname}`,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to upload image"
        });
    }
}