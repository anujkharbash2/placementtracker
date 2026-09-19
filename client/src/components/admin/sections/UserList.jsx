import styles from "./UserList.module.css";

function UserList({
    users,
    loading,
    error,
    title = "Manage Users",
}) {

    if (loading) {
        return (
            <div className={styles.wrapper}>
                <h2 className={styles.title}>
                    {title}
                </h2>

                <p className={styles.message}>
                    Loading users...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.wrapper}>
                <h2 className={styles.title}>
                    {title}
                </h2>

                <p className={styles.error}>
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>

            {/* Header */}
            <div className={styles.header}>

                <div>
                    <h2 className={styles.title}>
                        {title}
                    </h2>

                    <p className={styles.subtitle}>
                        View and manage registered users.
                    </p>
                </div>

                <span className={styles.count}>
                    {users.length} users
                </span>

            </div>

            {/* Empty state */}
            {users.length === 0 ? (
                <div className={styles.empty}>
                    No users found.
                </div>
            ) : (

                /* User table */
                <div className={styles.tableContainer}>

                    <table className={styles.table}>

                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Mobile</th>
                                <th>Role</th>
                            </tr>
                        </thead>

                        <tbody>

                            {users.map((user) => (
                                <tr key={user.id}>

                                    <td className={styles.name}>
                                        {user.name}
                                    </td>

                                    <td>
                                        {user.email}
                                    </td>

                                    <td>
                                        {user.mobile_number || "—"}
                                    </td>

                                    <td>
                                        <span
                                            className={`${styles.role} ${
                                                styles[user.role]
                                            }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>

                                </tr>
                            ))}

                        </tbody>

                    </table>

                </div>
            )}

        </div>
    );
}

export default UserList;