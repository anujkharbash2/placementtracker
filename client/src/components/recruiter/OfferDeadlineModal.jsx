import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import styles from "./OfferDeadlineModal.module.css";

function OfferDeadlineModal({ applicant, onClose, onOffered }) {
    const { token } = useAuth();
    const [deadlineDays, setDeadlineDays] = useState("7");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit() {
        const days = Number(deadlineDays);
        if (!deadlineDays || Number.isNaN(days) || days <= 0) {
            setError("Enter a valid number of days.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/applications/${applicant.id}/offer`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ deadline_days: days }),
                }
            );
            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Could not extend the offer.");
                setSubmitting(false);
                return;
            }

            onOffered();
        } catch (err) {
            setError("Could not reach the server.");
            setSubmitting(false);
        }
    }

    return (
        <Modal title={`Make offer: ${applicant.name}`} onClose={onClose} busy={submitting}>
            <Input
                label="Days to respond"
                id="deadlineDays"
                type="number"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(e.target.value)}
            />
            <p className={styles.hint}>Defaults to 7 days if left unchanged.</p>

            <ErrorMessage message={error} />

            <div className={styles.actions}>
                <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                    Cancel
                </Button>
                <Button type="button" variant="primary" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Sending..." : "Extend offer"}
                </Button>
            </div>
        </Modal>
    );
}

export default OfferDeadlineModal;