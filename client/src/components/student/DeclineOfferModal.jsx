import { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import styles from "./DeclineOfferModal.module.css";

// onConfirm(reason) must return "" on success, or an error message string
function DeclineOfferModal({ driveTitle, onConfirm, onClose }) {
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function handleConfirm() {
        setSubmitting(true);
        setError("");
        const message = await onConfirm(reason.trim());
        if (message) {
            setError(message);
            setSubmitting(false);
        }
    }

    return (
        <Modal title="Decline this offer?" onClose={onClose} busy={submitting}>
            <p className={styles.driveTitle}>{driveTitle}</p>

            <label className={styles.label} htmlFor="declineReason">Reason (optional)</label>
            <textarea
                id="declineReason"
                className={styles.textarea}
                rows={3}
                placeholder="You can skip this if you'd rather not say"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={submitting}
            />

            <ErrorMessage message={error} />

            <div className={styles.actions}>
                <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                    Cancel
                </Button>
                <Button type="button" variant="danger" onClick={handleConfirm} disabled={submitting}>
                    {submitting ? "Declining..." : "Decline offer"}
                </Button>
            </div>
        </Modal>
    );
}

export default DeclineOfferModal;