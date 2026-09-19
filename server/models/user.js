router.get(
    '/users',
    verifyToken,
    requireRole('admin'),
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
                if (!['student', 'recruiter', 'admin'].includes(role)) {
                    return res.status(400).json({
                        error: true,
                        message: 'Invalid role'
                    });
                }

                query += ` WHERE role = $1`;
                values.push(role);
            }

            query += ` ORDER BY id DESC`;

            const result = await pool.query(query, values);

            res.json({
                success: true,
                users: result.rows
            });

        } catch (err) {
            console.error(err);

            res.status(500).json({
                error: true,
                message: 'Server error'
            });
        }
    }
);