import mongoose from "mongoose";
//!---Gallery model-----


const gallerySchema = new mongoose.Schema(
    {
        prompt: String,
        url: String,
        public_id: String,
    },
    {
        timestamps: true,
    }
);
const Gallery = mongoose.model("Gallery", gallerySchema);
export default Gallery;