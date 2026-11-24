import { formatNumber } from "../../utils/format";
import styles from "./Dashboard.module.css";

// accent: "amber" | "red" | undefined. Only cards with onClick are interactive.
function StatCard({ icon, label, value, subtext, accent, flagLabel, onClick }) {
    const accentClass =
        accent === "amber" ? styles.accentAmber : accent === "red" ? styles.accentRed : "";

    const content = (
        <>
            <span className={styles.cardIcon} aria-hidden="true">{icon}</span>
            <span className={styles.cardValue}>{formatNumber(value)}</span>
            <span className={styles.cardLabel}>{label}</span>
            {subtext && <span className={styles.cardSub}>{subtext}</span>}
            {flagLabel && <span className={styles.flag}>{flagLabel}</span>}
        </>
    );

    if (onClick) {
        return (
            <button
                type="button"
                className={`${styles.card} ${styles.cardClickable} ${accentClass}`}
                onClick={onClick}
            >
                {content}
            </button>
        );
    }

    return <div className={`${styles.card} ${accentClass}`}>{content}</div>;
}

export default StatCard;