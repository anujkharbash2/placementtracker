import styles from "./Dashboard.module.css";

function DashboardSkeleton({ cards = 8, panels = 3, blocks = 1 }) {
    return (
        <div className={styles.page} aria-busy="true" aria-label="Loading dashboard">
            <div className={styles.cardGrid}>
                {Array.from({ length: cards }, (_, i) => (
                    <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`} />
                ))}
            </div>

            <div className={styles.threeCol}>
                {Array.from({ length: panels }, (_, i) => (
                    <div key={i} className={`${styles.skeleton} ${styles.skeletonPanel}`} />
                ))}
            </div>

            {Array.from({ length: blocks }, (_, i) => (
                <div key={i} className={`${styles.skeleton} ${styles.skeletonBlock}`} />
            ))}
        </div>
    );
}

export default DashboardSkeleton;