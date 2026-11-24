import styles from "./Dashboard.module.css";

function Panel({ title, isEmpty, emptyText, footer, children }) {
    return (
        <section className={styles.panel}>
            <h3 className={styles.panelTitle}>{title}</h3>
            {isEmpty ? <p className={styles.empty}>{emptyText}</p> : children}
            {footer && !isEmpty && <div className={styles.panelFooter}>{footer}</div>}
        </section>
    );
}

export default Panel;