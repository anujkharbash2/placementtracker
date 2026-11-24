import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import styles from "./RejectModal.module.css";

// onConfirm(reason) must return "" on success, or an error message string
function RejectModal({ driveTitle, onConfirm, onCancel }) {
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        function onKey(e) {
            if (e.key === "Escape" && !submitting) onCancel();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onCancel, submitting]);

    async function handleSubmit(e) {
        e.preventDefault();

        const trimmed = reason.trim();
        if (!trimmed) {
            setError("Please enter a reason for rejecting this drive.");
            return;
        }

        setSubmitting(true);
        setError("");

        const message = await onConfirm(trimmed);
        if (message) {
            setError(message);
            setSubmitting(false);
        }
    }

    return createPortal(
        <div className={styles.overlay} onClick={() => !submitting && onCancel()}>
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="rejectTitle"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 id="rejectTitle" className={styles.title}>Reject drive</h3>
                <p className={styles.driveTitle}>{driveTitle}</p>

                <form onSubmit={handleSubmit}>
                    <label className={styles.label} htmlFor="rejectReason">
                        Reason (the recruiter will see this)
                    </label>
                    <textarea
                        id="rejectReason"
                        className={styles.textarea}
                        rows={4}
                        autoFocus
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />

                    <ErrorMessage message={error} />

                    <div className={styles.actions}>
                        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="danger" disabled={submitting}>
                            {submitting ? "Rejecting..." : "Reject drive"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

export default RejectModal;