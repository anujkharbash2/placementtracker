import { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import styles from "./AcceptOfferModal.module.css";

// onConfirm must return "" on success, or an error message string
function AcceptOfferModal({ driveTitle, onConfirm, onClose }) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function handleConfirm() {
        setSubmitting(true);
        setError("");
        const message = await onConfirm();
        if (message) {
            setError(message);
            setSubmitting(false);
        }
    }

    return (
        <Modal title="Accept this offer?" onClose={onClose} busy={submitting}>
            <p className={styles.driveTitle}>{driveTitle}</p>

            <div className={styles.warning}>
                Accepting this offer will withdraw all your other applications and lock you
                from applying to new drives. <strong>This cannot be undone.</strong>
            </div>

            <ErrorMessage message={error} />

            <div className={styles.actions}>
                <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                    Cancel
                </Button>
                <Button type="button" variant="primary" onClick={handleConfirm} disabled={submitting}>
                    {submitting ? "Accepting..." : "Yes, accept this offer"}
                </Button>
            </div>
        </Modal>
    );
}

export default AcceptOfferModal;