const db = require("../config/db");

exports.uploadExcelVoters = async (req, res) => {
  try {
    const { voters } = req.body;

    if (!voters || voters.length === 0) {
      return res.status(400).json({ message: "No data received" });
    }

    for (let v of voters) {
      await db.query(
        `INSERT IGNORE INTO voters
        (name, age, gender, address, mobile, area, support)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          v.name,
          v.age || 0,
          v.gender || "Other",
          v.address || "",
          v.mobile,
          v.area,
          "Neutral"
        ]
      );
    }

    res.json({ message: "Excel Uploaded" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};


/* =========================
   ADMIN ADD VOTER
========================= */
exports.addVoter = async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      address,
      mobile,
      area,
      support
    } = req.body;

    if (!name || !age || !gender || !address || !mobile || !area) {
      return res.status(400).json({ message: "All fields required" });
    }

    // duplicate mobile check
    const [exist] = await db.query(
      "SELECT voter_id FROM voters WHERE mobile = ?",
      [mobile]
    );

    if (exist.length > 0) {
      return res.status(400).json({ message: "Voter already exists" });
    }

    await db.query(
      `INSERT INTO voters 
      (name, age, gender, address, mobile, area, support)
      VALUES (?,?,?,?,?,?,?)`,
      [name, age, gender, address, mobile, area, support || "Neutral"]
    );

    res.json({ message: "✅ Voter added successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



/* =========================
   ADMIN VIEW ALL VOTERS
========================= */
exports.getAllVoters = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM voters ORDER BY created_at DESC"
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/* =========================
   ADMIN DELETE VOTER
========================= */
exports.deleteVoter = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    await db.query(
      "DELETE FROM voters WHERE voter_id = ?",
      [req.params.id]
    );

    res.json({ message: "✅ Voter deleted" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};



/* =========================
   ADMIN UPDATE SUPPORT
========================= */
exports.updateSupport = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const { support } = req.body;

    await db.query(
      "UPDATE voters SET support = ? WHERE voter_id = ?",
      [support, id]
    );

    res.json({ message: "✅ Support updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



exports.getSingleVoter = async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM voters WHERE voter_id = ?",
    [req.params.id]
  );
  res.json(rows[0]);
};

exports.updateVoter = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, age, gender, address, area, support } = req.body;

    await db.query(
      `UPDATE voters 
       SET name=?, age=?, gender=?, address=?, area=?, support=?
       WHERE voter_id=?`,
      [name, age, gender, address, area, support, req.params.id]
    );

    res.json({ message: "✅ Voter updated successfully" });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.deleteVoter = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;

    await db.query(
      "DELETE FROM voters WHERE voter_id = ?",
      [id]
    );

    res.json({ message: "✅ Voter deleted" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
