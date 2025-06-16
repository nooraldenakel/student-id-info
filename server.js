import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve frontend build
app.use(express.static(path.join(__dirname, "dist")));

// ✅ Correct proxy setup
app.use(
    "/api",
    createProxyMiddleware({
        target: "https://student-id-info-back-none.up.railway.app", // 🔁 use backend's real Railway URL
        changeOrigin: true,
        pathRewrite: { "^/api": "" }
    })
);
app.use(
    "/student",
    createProxyMiddleware({
        target: "https://student-id-info-back-none.up.railway.app",
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
