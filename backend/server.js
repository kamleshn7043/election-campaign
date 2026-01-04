require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const adminRoutes = require("./routes/admin.routes");
const workerRoutes = require("./routes/worker.routes");
const voterRoutes = require("./routes/voter.routes"); // ✅ MISSING LINE FIXED

const app = express();

app.use(cors());
app.use(express.json());

// ✅ STATIC FRONTEND SERVE
app.use(express.static(path.join(__dirname, "public")));

// ✅ ROUTES
app.use("/api/admin", adminRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/voters", voterRoutes);

// app.listen(5000, () => {
//   console.log("🚀 Backend running on port 5000");
// });


app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});
