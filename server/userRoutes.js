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

//Update User using PUT /api/users/:id

router.put(
    "/users/:id",
    verifyToken,
    requireRole("admin"),
    async (req, res) => {
        try {
            const userId = parseInt(req.params.id);

            if (isNaN(userId)) {
                return res.status(400).json({
                    error: true,
                    message: "Invalid user ID",
                });
            }

            const { name, email, mobile_number } = req.body;

            //Basic validation
            if(!name || !email) {
                return res.status(400).json({
                    error: true,
                    message: "Name and email are required",
                })
            }

            //Check user
            const existingUser = await pool.query('SELECT id FROM users WHERE id =$1', [userId]);

            if (existingUser.rows.length === 0) {
                return res.status(404).json({
                    error: true,
                    message: "User not found",
                })
            }

            //Update user
            const result = await pool.query(
                'UPDATE users SET name = $1, email = $2, mobile_number = $3 WHERE id = $4 RETURNING id, name, email, mobile_number, role, must_reset_password',
                [name, email, mobile_number || null, userId]

            );

            return res.status(200).json({
                success: true,
                message: "User updated successfully",
                user: result.rows[0],   
            })

        } catch(err) {
            console.error("PUT /api/users/:id error:", err);

            //Postgres error handling
            if (err.code ==="23505") {
                return res.status(409).json({
                    error: true,
                    message: "Email already exists",
                });
            }   

            return res.status(500).json({
                error: true,
                message: "Server error",
            });
        }
    }
);

// =====================================================
// DELETE USER
// DELETE /api/users/:id
// =====================================================
router.delete(
    "/users/:id",
    verifyToken,    
    requireRole("admin"),
    async(req, res) => {
        try {
            const userId = parseInt(req.params.id);

            if (isNaN(userId)) {
                return res.status(400).json({
                    error: true,
                    message: "Invalid user ID",
                });
            }

            //Prevent admin from deleting themselves
            if (req.user.userId === userId) {
                return res.status(403).json({
                    error: true,
                    message: "You cannot delete your own account",
                });
            }

            //Check if user exists
            const existingUser = await pool.query('SELECT id, role FROM users WHERE id = $1', [userId]);
            if (existingUser.rows.length === 0) {
                return res.status(404).json({
                    error: true,
                    message: "User not found",
                });
            }
            //Delete user
            //Uss student se related saara data khallas
            //ye sab delete cascade ki wajah se hoga

            await pool.query('DELETE FROM users WHERE id = $1', [userId]);

            return res.status(200).json({
                success: true,
                message: "User deleted successfully",
            });

        } catch (err) {
            console.error("DELETE /api/users/:id error:", err);

            return res.status(500).json({
                error: true,
                message: "Server error",
            });
        }
    }
);       


module.exports = router;