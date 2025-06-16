import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";

// ES module workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve Vite-built frontend from dist/
app.use(express.static(path.join(__dirname, "dist")));

// ✅ Proxy only requests starting with /api
app.use(
    "/api",
    createProxyMiddleware({
        target: "https://student-id-info-back.up.railway.app",
        changeOrigin: true,
        pathRewrite: { "^/api": "/api" }
    })
);

// For SPA: redirect all unknown paths to index.html
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist/index.html"));
});

app.listen(PORT, () => {
    console.log(`🚀 Frontend running on http://localhost:${PORT}`);
});