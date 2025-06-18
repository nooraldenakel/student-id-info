import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve frontend build
app.use(express.static(path.join(__dirname, "dist")));


// Configure multer to store uploaded files in memory or on disk
const storage = multer.memoryStorage(); // or use diskStorage() to save to folder
const upload = multer({ storage });

app.use(cors({
    origin: "https://www.alayen-student-info.site",
    credentials: true
}));

// Define Patch endpoint
app.patch("/student/:examCode", upload.single("image"), (req, res) => {
    console.log("✅ Received PATCH /student/:examCode");

    const authHeader = req.headers.authorization;
    console.log("🔐 Authorization Header:", authHeader);
    const examCode = req.params.examCode;
    const image = req.file; // image file from formData
    const birthDate = req.body.birthDate; // text from formData

    console.log("📥 Incoming POST to /student/:examCode");
    console.log("🧪 Received Exam Code:", examCode);
    console.log("🎂 Received Birth Date:", birthDate);
    console.log("📦 req.body:", req.body);
    console.log("📦 req.file:", req.file);
    if (image) {
        console.log("🖼️ Image Info:");
        console.log(" - fieldname:", image.fieldname);
        console.log(" - originalname:", image.originalname);
        console.log(" - mimetype:", image.mimetype);
        console.log(" - size (bytes):", image.size);
    } else {
        console.warn("❌ No image uploaded in 'image' field");
    }

    if (!authHeader || !image || !birthDate) {
        return res.status(403).json({ error: "Missing data or unauthorized" });
    }

    // You can now process the image or store it in DB, etc.
    res.json({ success: true, message: "Received", examCode, birthDate });
});

// ✅ Correct proxy setup
app.use(
    "/",
    createProxyMiddleware({
        target: "https://student-id-info-back-production.up.railway.app", // 🔁 use backend's real Railway URL
        changeOrigin: true,
    })
);
app.use(
    "/api",
    createProxyMiddleware({
        target: "https://student-id-info-back-production.up.railway.app", // 🔁 use backend's real Railway URL
        changeOrigin: true,
    })
);
app.use(
    "/student",
    createProxyMiddleware({
        target: "https://student-id-info-back-production.up.railway.app",
        changeOrigin: true
    })
);

// Handle SPA routing
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist/index.html"));
});

app.listen(PORT, () => {
    console.log(`✅ Frontend server running at http://localhost:${PORT}`);
});
