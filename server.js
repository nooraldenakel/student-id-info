import express from "express";
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

// Define POST endpoint
app.post("/student/:examCode", upload.single("image"), (req, res) => {
    const examCode = req.params.examCode;
    const image = req.file; // image file from formData
    const birthDate = req.body.birthDate; // text from formData

    console.log("📦 Image:", image?.originalname);
    console.log("🎓 Exam Code:", examCode);
    console.log("🎂 Birth Date:", birthDate);

    if (!image || !birthDate) {
        return res.status(400).json({ error: "Missing image or birthDate" });
    }

    // You can now process the image or store it in DB, etc.
    res.json({ success: true, message: "Data received", examCode, birthDate });
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
