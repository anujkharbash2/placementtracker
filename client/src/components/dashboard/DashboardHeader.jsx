import Button from "../common/Button";
import { formatTimeIST, DASH } from "../../utils/format";
import styles from "./Dashboard.module.css";

function DashboardHeader({ title, generatedAt, onRefresh, refreshing, children }) {
    return (
        <div className={styles.header}>
            <h1 className={styles.headerTitle}>{title}</h1>

            <div className={styles.headerRight}>
                {children}
                <span className={styles.updated}>
                    Last updated: {generatedAt ? formatTimeIST(generatedAt) : DASH}
                </span>
                <Button type="button" variant="outline" onClick={onRefresh} disabled={refreshing}>
                    {refreshing ? "Refreshing..." : "Refresh"}
                </Button>
            </div>
        </div>
    );
}

export default DashboardHeader;