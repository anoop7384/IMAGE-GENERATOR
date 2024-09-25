// routes/profile.js
import express from "express";
import User from "../models/User.js";
import Gallery from "../models/Gallery.js";

const router = express.Router();

// routes/profile.js
router.get("/profile", async (req, res) => {
    try {
        const userId = req.user.id; // Assuming you have user ID from token (JWT middleware)
        const user = await User.findById(userId).populate("savedImages");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            name: user.name,
            email: user.email,
            savedImages: user.savedImages,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


// Add saved image to the user's profile
router.post("/profile/:userId/saveImage", async (req, res) => {
    try {
        const { userId } = req.params;
        const { imageId } = req.body;

        // Find the user and the image
        const user = await User.findById(userId);
        const image = await Gallery.findById(imageId);

        if (!user || !image) {
            return res.status(404).json({ message: "User or image not found" });
        }

        // Add the image to the savedImages array if it's not already saved
        if (!user.savedImages.includes(image._id)) {
            user.savedImages.push(image._id);
            await user.save();
        }

        res.status(200).json({ message: "Image saved successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Remove saved image from the user's profile
router.delete("/profile/:userId/removeImage", async (req, res) => {
    try {
        const { userId } = req.params;
        const { imageId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Remove the image from the savedImages array
        user.savedImages = user.savedImages.filter(
            (imgId) => imgId.toString() !== imageId
        );
        await user.save();

        res.status(200).json({ message: "Image removed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
