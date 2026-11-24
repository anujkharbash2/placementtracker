import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config";
import { useResumes } from "../../hooks/useResumes";
import { formatFileSize } from "../../utils/formatFileSize";
import { formatDateTime } from "../../utils/driveDates";
import Modal from "../common/Modal";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import ResumeUploader from "./ResumeUploader";
import styles from "./ApplyModal.module.css";

function ApplyModal({ drive, onClose, onApplied, onRefreshNeeded }) {
    const { token } = useAuth();
    const { resumes, loading, error: loadError, upload } = useResumes();

    const [selectedId, setSelectedId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [reasons, setReasons] = useState([]);

    // Start with the newest resume selected
    useEffect(() => {
        if (selectedId === null && resumes.length > 0) {
            const newest = [...resumes].sort(
                (a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)
            )[0];
            setSelectedId(newest.id);
        }
    }, [resumes, selectedId]);

    async function handleSubmit() {
        if (selectedId === null) {
            setError("Choose a resume or upload one first.");
            return;
        }

        setSubmitting(true);
        setError("");
        setReasons([]);

        try {
            const response = await fetch(`${API_BASE_URL}/api/applications`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ drive_id: drive.id, resume_id: selectedId }),
            });
            const data = await response.json();

            if (!response.ok) {
    setReasons(data.reasons || []);
    setError(data.message || "Could not submit your application.");
    onRefreshNeeded();
    return;
}

            onApplied();
        } catch (err) {
            setError("Could not reach the server.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal title="Apply to this drive" onClose={onClose} busy={submitting}>
            <p className={styles.driveTitle}>
                {drive.title} · {drive.company_name}
            </p>

            <h4 className={styles.sectionTitle}>Choose a resume</h4>

            {loading && <p>Loading your resumes...</p>}
            <ErrorMessage message={loadError} />
            {!loading && !loadError && resumes.length === 0 && (
                <p className={styles.empty}>You have no resumes yet. Upload one below.</p>
            )}

            <div className={styles.resumeList}>
                {resumes.map((resume) => (
                    <label key={resume.id} className={styles.option}>
                        <input
                            type="radio"
                            name="resume"
                            checked={selectedId === resume.id}
                            onChange={() => setSelectedId(resume.id)}
                            disabled={submitting}
                        />
                        <span>
                            <span className={styles.name}>{resume.original_name}</span>
                            <span className={styles.meta}>
                                {formatFileSize(resume.file_size)} · {formatDateTime(resume.uploaded_at)}
                            </span>
                        </span>
                    </label>
                ))}
            </div>

            <h4 className={styles.sectionTitle}>Or upload a new one</h4>
            <ResumeUploader upload={upload} onUploaded={(resume) => setSelectedId(resume.id)} />

            {error && (
                <div className={styles.errorBox}>
                    <div>{error}</div>
                    {reasons.length > 0 && (
                        <ul className={styles.reasons}>
                            {reasons.map((reason, i) => (
                                <li key={i}>{reason}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <div className={styles.actions}>
                <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                    Cancel
                </Button>
                <Button
                    type="button"
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={submitting || selectedId === null}
                >
                    {submitting ? "Submitting..." : "Submit application"}
                </Button>
            </div>
        </Modal>
    );
}

export default ApplyModal;