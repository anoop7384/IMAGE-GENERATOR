import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { config, uploader } from "cloudinary";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
// import sharp from "sharp";

import auth from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import Gallery from "./models/Gallery.js";
import profileRoutes from "./routes/profile.js";

const app = express();
const PORT = 9000;

//!Connect to mongodb
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Monodb connected");
  })
  .catch((e) => console.log(e));


//!Configure openai
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
//!Configure cloudinary
config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
//! Cors
//!Updated Cors Options
const corsOptions = {
  origin: ["http://localhost:5174", "http://localhost:5173"], // React dev servers
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
  credentials: true, // Allow cookies/auth headers to be sent
};

app.use(express.json());
// Use CORS with the updated options
app.use(cors(corsOptions));

//!Middlewares


// Function to save a single image from system file to the database
async function saveSingleImage(filePath, prompt, width, height) {
  try {
    // Upload image to Cloudinary with resizing transformation
    const image = await uploader.upload(filePath, {
      folder: "ai-art-work",
      transformation: [
        {
          width: width,
          height: height,
          crop: "fill", // Crop to fill the specified dimensions
        }
      ],
    });

    // Save image details to MongoDB
    const imageCreated = await Gallery.create({
      prompt: prompt, // Modify or add dynamic prompts if needed
      url: image.secure_url,
      public_id: image.public_id,
    });

    console.log(`Saved image: ${filePath}`);
    // console.log(imageCreated);

    return imageCreated;
  } catch (error) {
    console.error("Error saving image to database:", error);
  }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


//!Route
app.post("/generate-image", auth, async (req, res) => {
  const { prompt } = req.body;
  try {
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    });
    //Save the image into cloudinary
    const image = await uploader.upload(imageResponse.data[0].url, {
      folder: "ai-art-work",
    });
    //Save into mongodb
    const imageCreated = await Gallery.create({
      prompt: imageResponse.data[0].revised_prompt,
      url: imageResponse.data[0].url,
      public_id: image.public_id,
    });
    res.json(imageCreated);


  } catch (error) {
    console.log(error);
    res.json({ message: "Error generating image" });
  }
});

//!List images route
app.get("/images", async (req, res) => {
  try {
    const images = await Gallery.find().sort({ _id: -1 });
    res.json(images);
  } catch (error) {
    res.json({ message: "Error fetching images" });
  }
});

//!Route to download image
app.get("/download-image/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const image = await Gallery.findById(id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    const response = await fetch(image.url);
    const buffer = await response.buffer();
    const filePath = path.join(__dirname, `${image.public_id}.jpg`);

    fs.writeFileSync(filePath, buffer);
    res.download(filePath, (err) => {
      if (err) {
        console.log(err);
      }
      fs.unlinkSync(filePath); // Remove the file after download
    });
  } catch (error) {
    console.log(error);
    res.json({ message: "Error downloading image" });
  }
});

app.get("/share-image/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const image = await Gallery.findById(id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }
    const shareUrl = `https://www.yoursite.com/images/${id}`;
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent('Check out this AI-generated art: ' + shareUrl)}`;
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out this AI-generated art: ' + shareUrl)}`;

    res.json({
      facebook: facebookShareUrl,
      whatsapp: whatsappShareUrl,
      twitter: twitterShareUrl
    });
  } catch (error) {
    console.log(error);
    res.json({ message: "Error generating share links" });
  }
});

// Routes
app.use("/auth", authRoutes);

// Use the profile route
app.use("/api", auth, profileRoutes);


// Function to save images from system files to the database
async function saveImagesToDatabase(directoryPath, width, height) {
  try {
    // Read all files in the directory
    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
      const filePath = path.join(directoryPath, file);

      // Upload image to Cloudinary with resizing transformation
      const image = await uploader.upload(filePath, {
        folder: "ai-art-work",
        transformation: [
          {
            width: width,
            height: height,
            crop: "fill", // Crop to fill the specified dimensions
          }
        ],
      });

      // Save image details to MongoDB
      await Gallery.create({
        prompt: "Manual Upload", // Modify or add dynamic prompts if needed
        url: image.secure_url,
        public_id: image.public_id,
      });

      console.log(`Saved image: ${file}`);
    }

    console.log("All images have been saved to the database.");
  } catch (error) {
    console.error("Error saving images to database:", error);
  }
}

// Function to delete all images from both Cloudinary and MongoDB
async function deleteAllImages() {
  try {
    // Fetch all images from MongoDB
    const images = await Gallery.find();

    // Delete images from Cloudinary and MongoDB
    for (const image of images) {
      // Delete image from Cloudinary
      await uploader.destroy(image.public_id);

      // Delete image record from MongoDB
      await Gallery.deleteOne({ _id: image._id });

      console.log(`Deleted image: ${image.public_id}`);
    }

    console.log("All images have been deleted from both Cloudinary and MongoDB.");
  } catch (error) {
    console.error("Error deleting images:", error);
  }
}



//!Start the server
app.listen(PORT, console.log("Server is running..."));

// deleteAllImages();

// saveImagesToDatabase('photos', 1024, 1024);

