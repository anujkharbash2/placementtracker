import styles from "./StatusBadge.module.css";

function StatusBadge({ status, label }) {
    if (!status) return null;
    return (
       <span className={`${styles.badge} ${styles[status] || styles.neutral}`}>
            {label || status}
        </span>
    );
}

export default StatusBadge;