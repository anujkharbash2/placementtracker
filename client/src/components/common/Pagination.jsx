import Button from "./Button";
import styles from "./Pagination.module.css";

function Pagination({ page, totalPages, total, onPageChange }) {
    return (
        <div className={styles.bar}>
            <span className={styles.info}>
                {total} drive{total === 1 ? "" : "s"} · Page {page} of {totalPages}
            </span>

            {totalPages > 1 && (
                <div className={styles.buttons}>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={page <= 1}
                        onClick={() => onPageChange(page - 1)}
                    >
                        Previous
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={page >= totalPages}
                        onClick={() => onPageChange(page + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}

export default Pagination;