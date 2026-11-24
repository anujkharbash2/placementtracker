import styles from "./Dashboard.module.css";

function ChartCard({ title, isEmpty, summary, children }) {
    return (
        <section className={styles.chartCard}>
            <h3 className={styles.panelTitle}>{title}</h3>

            {isEmpty ? (
                <p className={styles.empty}>No data yet</p>
            ) : (
                <>
                    <div className={styles.chartBox}>{children}</div>
                    {summary && <p className={styles.srOnly}>{summary}</p>}
                </>
            )}
        </section>
    );
}

export default ChartCard;