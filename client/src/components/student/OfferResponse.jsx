import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config";
import { formatCountdown, isOfferExpired } from "../../utils/driveDates";
import Button from "../common/Button";
import AcceptOfferModal from "./AcceptOfferModal";
import DeclineOfferModal from "./DeclineOfferModal";
import styles from "./OfferResponse.module.css";

// onResolved(type, message): type is "success", "blocked" (409/410) or "info" (400)
function OfferResponse({ application, driveTitle, onResolved }) {
    const { token } = useAuth();
    const [showAccept, setShowAccept] = useState(false);
    const [showDecline, setShowDecline] = useState(false);

    const expired = isOfferExpired(application.offer_expires_at);

    async function handleAccept() {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/applications/${application.id}/accept-offer`,
                { method: "POST", headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await response.json();

            if (response.status === 409) {
                setShowAccept(false);
                onResolved("blocked", "You have already accepted an offer elsewhere.");
                return "";
            }
            if (response.status === 410) {
                setShowAccept(false);
                onResolved("blocked", "This offer has expired — the deadline passed and it was not accepted.");
                return "";
            }
            if (response.status === 400) {
                setShowAccept(false);
                onResolved("info", data.message || "This application has already changed.");
                return "";
            }
            if (!response.ok) {
                return data.message || "Could not accept the offer.";
            }

            const withdrawn = data.withdrawn_applications ?? data.data?.withdrawn_applications;
            setShowAccept(false);
            onResolved(
                "success",
                withdrawn != null
                    ? `Offer accepted. ${withdrawn} other application${withdrawn === 1 ? "" : "s"} were automatically withdrawn.`
                    : "Offer accepted."
            );
            return "";
        } catch (err) {
            return "Could not reach the server.";
        }
    }

    async function handleDecline(reason) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/applications/${application.id}/decline-offer`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(reason ? { reason } : {}),
                }
            );
            const data = await response.json();

            if (response.status === 400) {
                setShowDecline(false);
                onResolved("info", data.message || "This application has already changed.");
                return "";
            }
            if (!response.ok) {
                return data.message || "Could not decline the offer.";
            }

            setShowDecline(false);
            onResolved("success", "Offer declined.");
            return "";
        } catch (err) {
            return "Could not reach the server.";
        }
    }

    if (expired) {
        return <p className={styles.expiredNote}>This offer's response window has passed.</p>;
    }

    return (
        <div className={styles.wrapper}>
            <p className={styles.countdown}>{formatCountdown(application.offer_expires_at)}</p>

            <div className={styles.actions}>
                <Button type="button" variant="primary" onClick={() => setShowAccept(true)}>
                    Accept
                </Button>
                <Button type="button" variant="danger" onClick={() => setShowDecline(true)}>
                    Decline
                </Button>
            </div>

            {showAccept && (
                <AcceptOfferModal
                    driveTitle={driveTitle}
                    onConfirm={handleAccept}
                    onClose={() => setShowAccept(false)}
                />
            )}

            {showDecline && (
                <DeclineOfferModal
                    driveTitle={driveTitle}
                    onConfirm={handleDecline}
                    onClose={() => setShowDecline(false)}
                />
            )}
        </div>
    );
}

export default OfferResponse;