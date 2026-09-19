const express = require("express");
const router = express.Router();

const pool = require("./db");
const { verifyToken, requireRole } = require("./authMiddleware");

// GET /api/users
router.get(
    "/users",
    verifyToken,
    requireRole("admin"),
    async (req, res) => {
        try {
            const { role } = req.query;

            let query = `
                SELECT
                    id,
                    name,
                    email,
                    mobile_number,
                    role,
                    must_reset_password
                FROM users
            `;

            const values = [];

            if (role) {
                if (!["student", "recruiter", "admin"].includes(role)) {
                    return res.status(400).json({
                        error: true,
                        message: "Invalid role",
                    });
                }

                query += ` WHERE role = $1`;
                values.push(role);
            }

            query += ` ORDER BY id DESC`;

            const result = await pool.query(query, values);

            return res.status(200).json({
                success: true,
                users: result.rows,
            });

        } catch (err) {
            console.error("GET /api/users error:", err);

            return res.status(500).json({
                error: true,
                message: "Server error",
            });
        }
    }
);

module.exports = router;