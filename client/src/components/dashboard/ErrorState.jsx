import Button from "../common/Button";
import styles from "./Dashboard.module.css";

function ErrorState({ error, onRetry }) {
    const forbidden = error.code === 403;

    return (
        <div className={styles.errorBox} role="alert">
            <p>{forbidden ? "Access denied" : error.message}</p>
            {!forbidden && (
                <Button type="button" variant="primary" onClick={onRetry}>
                    Retry
                </Button>
            )}
        </div>
    );
}

export default ErrorState;