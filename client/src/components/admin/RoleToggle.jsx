import styles from "./RoleToggle.module.css";

function RoleToggle({ role, onChange }) {
    return (
        <div className={styles.toggle}>
            <button
                type="button"
                className={`${styles.option} ${role === "student" ? styles.active : ""}`}
                onClick={() => onChange("student")}
            >
                Student
            </button>
            <button
                type="button"
                className={`${styles.option} ${role === "recruiter" ? styles.active : ""}`}
                onClick={() => onChange("recruiter")}
            >
                Recruiter
            </button>
        </div>
    );
}

export default RoleToggle;