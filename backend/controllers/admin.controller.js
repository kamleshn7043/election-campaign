const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.adminLogin = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({ message: "Mobile & password required" });
    }

    const [rows] = await db.query(
      "SELECT * FROM admins WHERE mobile = ?",
      [mobile]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Admin not found" });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { admin_id: admin.admin_id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login success",
      token,
      admin: {
        admin_id: admin.admin_id,
        name: admin.name,
        mobile: admin.mobile
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



exports.createAdmin = async (req, res) => {
  try {
    const { name, mobile, password } = req.body;

    if (!name || !mobile || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // check duplicate
    const [exist] = await db.query(
      "SELECT admin_id FROM admins WHERE mobile=?",
      [mobile]
    );

    if (exist.length > 0) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO admins (name, mobile, password) VALUES (?,?,?)",
      [name, mobile, hashed]
    );

    res.json({ message: "✅ Admin created successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
