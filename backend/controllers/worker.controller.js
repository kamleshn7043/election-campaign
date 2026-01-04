const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* =========================
   WORKER LOGIN
========================= */
exports.workerLogin = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({ message: "Mobile & password required" });
    }

    const [rows] = await db.query(
      "SELECT * FROM workers WHERE mobile = ?",
      [mobile]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Worker not found" });
    }

    const worker = rows[0];
    const isMatch = await bcrypt.compare(password, worker.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      {
        worker_id: worker.worker_id,
        role: "worker",
        area: worker.area
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login success",
      token,
      worker: {
        worker_id: worker.worker_id,
        name: worker.name,
        mobile: worker.mobile,
        area: worker.area
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



/* =========================
   CREATE WORKER (ADMIN)
========================= */
exports.createWorker = async (req, res) => {
  try {
    const { name, mobile, password, area } = req.body;

    if (!name || !mobile || !password || !area) {
      return res.status(400).json({ message: "All fields required" });
    }

    // duplicate check
    const [exist] = await db.query(
      "SELECT worker_id FROM workers WHERE mobile = ?",
      [mobile]
    );

    if (exist.length > 0) {
      return res.status(400).json({ message: "Worker already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO workers (name, mobile, password, area) VALUES (?,?,?,?)",
      [name, mobile, hashed, area]
    );

    res.json({ message: "✅ Worker created successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/* =========================
   WORKER VIEW OWN AREA VOTERS
========================= */
exports.getAreaVoters = async (req, res) => {
  try {
    
    if (req.user.role !== "worker") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { area } = req.user;

    const [rows] = await db.query(
      "SELECT * FROM voters WHERE area = ? ORDER BY created_at DESC",
      [area]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/* =========================
   WORKER UPDATE SUPPORT
========================= */
exports.updateSupport = async (req, res) => {
  try {
    if (req.user.role !== "worker") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { mobile } = req.params;
    const { support } = req.body;

    await db.query(
      "UPDATE voters SET support = ? WHERE mobile = ?",
      [support, mobile]
    );

    res.json({ message: "✅ Support updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
