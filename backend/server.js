require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const adminRoutes = require("./routes/admin.routes");
const workerRoutes = require("./routes/worker.routes");
const voterRoutes = require("./routes/voter.routes");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 STATIC FRONTEND
app.use(express.static(path.join(__dirname, "public")));

// 🔥 API ROUTES
app.use("/api/admin", adminRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/voters", voterRoutes);

// 🔥 RENDER COMPATIBLE PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port", PORT);
});
