import { useState } from "react";
import styles from "./DriveCard.module.css";

function DriveCard({ summary, badge, children }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={styles.card}>
            <button
                type="button"
                className={styles.summaryRow}
                onClick={() => setExpanded((prev) => !prev)}
            >
                <div className={styles.summaryText}>{summary}</div>
                <div className={styles.summaryRight}>
                    {badge}
                    <span className={styles.chevron}>{expanded ? "▲" : "▼"}</span>
                </div>
            </button>

            {expanded && <div className={styles.details}>{children}</div>}
        </div>
    );
}

export default DriveCard;