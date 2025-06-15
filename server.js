const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend
app.use(express.static(path.join(__dirname, "dist")));

// Proxy API requests to backend
app.use("/api", createProxyMiddleware({
    target: "https://student-id-info.com/", // your backend Railway URL
    changeOrigin: true,
    pathRewrite: { "^/api": "/api" }
}));

// Handle SPA routing
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist/index.html"));
});

app.listen(PORT, () => {
    console.log(`Frontend running on port ${PORT}`);
});
