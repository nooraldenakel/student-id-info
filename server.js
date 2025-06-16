import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";

// ES module workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, "dist")));

// ✅ Proxy API calls
app.use(
    "/api",
    createProxyMiddleware({
        target: "https://student-id-info-back-none.up.railway.app",
        changeOrigin: true,
        pathRewrite: { "^/api": "/api" }
    })
);

// SPA fallback
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist/index.html"));
});

app.listen(PORT, () => {
    console.log(`Frontend running on port ${PORT}`);
});
