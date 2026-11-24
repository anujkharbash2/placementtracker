import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import RejectModal from "./RejectModal";
import styles from "./ReviewActions.module.css";

function ReviewActions({ drive, onReviewed }) {
    const { token } = useAuth();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [rejecting, setRejecting] = useState(false);

    // Returns an error message, or "" on success
    async function send(action, body) {
        setBusy(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            if (body) headers["Content-Type"] = "application/json";

            const response = await fetch(`${API_BASE_URL}/api/drives/${drive.id}/${action}`, {
                method: "PATCH",
                headers,
                body: body ? JSON.stringify(body) : undefined,
            });
            const data = await response.json();

            if (!response.ok) return data.message || `Could not ${action} drive.`;
            return "";
        } catch (err) {
            return "Could not reach the server.";
        } finally {
            setBusy(false);
        }
    }

    async function handleApprove() {
    setError("");
    const message = await send("approve");
    if (message) setError(message);
    else onReviewed("approve");
}

async function handleReject(reason) {
    const message = await send("reject", { reason });
    if (message) return message;
    setRejecting(false);
    onReviewed("reject");
    return "";
}

    return (
        <div className={styles.wrapper}>
            <div className={styles.actions}>
                <Button type="button" variant="primary" disabled={busy} onClick={handleApprove}>
                    Approve
                </Button>
                <Button type="button" variant="danger" disabled={busy} onClick={() => setRejecting(true)}>
                    Reject
                </Button>
            </div>

            <ErrorMessage message={error} />

            {rejecting && (
                <RejectModal
                    driveTitle={drive.title}
                    onConfirm={handleReject}
                    onCancel={() => setRejecting(false)}
                />
            )}
        </div>
    );
}

export default ReviewActions;