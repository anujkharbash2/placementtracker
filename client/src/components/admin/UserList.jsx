import styles from "./UserList.module.css";
import Button from "../common/Button";

function UserList({
    users,
    loading,
    error,
    title = "Manage Users",
    onEdit,
    onDeactivate,
    onReactivate,
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

            {users.length === 0 ? (
                <div className={styles.empty}>
                    No users found.
                </div>
            ) : (
                <div className={styles.tableContainer}>

                    <table className={styles.table}>

                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Mobile</th>
                                <th>Role</th>
                                <th>Edit</th>
                                <th>Action</th>
                                
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => (
                                <tr 
                                key={user.id}
                                className={
                                    user.is_active === false
                                        ? styles.deactivatedRow :""}>

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

                                    <td>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className={styles.editButton}
                                            onClick={() =>
                                                onEdit(user)
                                            }
                                        >
                                            Edit
                                        </Button>
                                    </td>

                                    <td>
    {user.is_active === false ? (
        <Button
            type="button"
            variant="success"
            onClick={() => onReactivate(user.id)}
        >
            Reactivate
        </Button>
    ) : (
        <Button
            type="button"
            variant="danger"
            onClick={() => onDeactivate(user.id)}
        >
            Deactivate
        </Button>
    )}
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