import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useResumes } from "../../hooks/useResumes";
import { openResume } from "../../utils/openResume";
import { formatFileSize } from "../../utils/formatFileSize";
import { formatDateTime } from "../../utils/driveDates";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import ResumeUploader from "./ResumeUploader";
import styles from "./ResumeManager.module.css";

function ResumeManager() {
    const { token } = useAuth();
    const { resumes, loading, error, upload, remove } = useResumes();
    const [actionError, setActionError] = useState("");

    async function handleView(id) {
        setActionError("");
        const message = await openResume(id, token);
        if (message) setActionError(message);
    }

    async function handleDelete(resume) {
        if (!window.confirm(`Delete "${resume.original_name}"?`)) return;
        setActionError("");
        const message = await remove(resume.id);
        if (message) setActionError(message);
    }

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.heading}>My Resumes</h2>

            <div className={styles.uploadBox}>
                <h4>Upload a new resume</h4>
                <ResumeUploader upload={upload} />
            </div>

            <ErrorMessage message={error || actionError} />

            {loading && <p>Loading your resumes...</p>}
            {!loading && !error && resumes.length === 0 && (
                <p>You haven't uploaded any resumes yet.</p>
            )}

            <div className={styles.list}>
                {resumes.map((resume) => (
                    <div key={resume.id} className={styles.item}>
                        <div>
                            <div className={styles.name}>
                                {resume.original_name}
                                {resume.in_use && <span className={styles.inUse}>In use</span>}
                            </div>
                            <div className={styles.meta}>
                                {formatFileSize(resume.file_size)} · Uploaded {formatDateTime(resume.uploaded_at)}
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <Button type="button" variant="outline" onClick={() => handleView(resume.id)}>
                                View
                            </Button>
                            <span title={resume.in_use ? "This resume is attached to an application" : ""}>
                                <Button
                                    type="button"
                                    variant="danger"
                                    disabled={resume.in_use}
                                    onClick={() => handleDelete(resume)}
                                >
                                    Delete
                                </Button>
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ResumeManager;