import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config";
import Modal from "../common/Modal";
import Select from "../common/Select";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import styles from "./CorrectApplicationModal.module.css";

function CorrectApplicationModal({ applicant, rounds, onClose, onCorrected }) {
    const { token } = useAuth();

    const [roundOrder, setRoundOrder] = useState("");
    const [outcome, setOutcome] = useState("");
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const outcomeOptions = [
        { value: "in_progress", label: "In progress" },
        { value: "offer", label: "Offer" },
        { value: "rejected", label: "Rejected" },
    ];

    async function handleSubmit() {
        if (!roundOrder && !outcome) {
            setError("Set at least a round or an outcome to apply a correction.");
            return;
        }

        setSubmitting(true);
        setError("");

        const body = {};
        if (roundOrder) body.round_order = Number(roundOrder);
        if (outcome) body.outcome = outcome;
        if (reason.trim()) body.reason = reason.trim();

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/applications/${applicant.id}/correct`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(body),
                }
            );
            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Could not apply the correction.");
                return;
            }

            onCorrected();
        } catch (err) {
            setError("Could not reach the server.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal title={`Correct: ${applicant.name}`} onClose={onClose} busy={submitting}>
            <p className={styles.note}>
                Use this only to fix a mistake — moving the wrong applicant, or rejecting by
                accident. This bypasses the normal advance/reject flow.
            </p>

            <Select
                label="Set round (optional)"
                id="correctRound"
                value={roundOrder}
                onChange={(e) => setRoundOrder(e.target.value)}
                placeholder="Leave unchanged"
                options={rounds.map((r) => ({ value: String(r.round_order), label: r.name }))}
            />

            <Select
                label="Set outcome (optional)"
                id="correctOutcome"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="Leave unchanged"
                options={outcomeOptions}
            />

            <div className={styles.field}>
                <label className={styles.label} htmlFor="correctReason">Reason (optional)</label>
                <textarea
                    id="correctReason"
                    className={styles.textarea}
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
            </div>

            <ErrorMessage message={error} />

            <div className={styles.actions}>
                <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                    Cancel
                </Button>
                <Button type="button" variant="primary" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Applying..." : "Apply correction"}
                </Button>
            </div>
        </Modal>
    );
}

export default CorrectApplicationModal;