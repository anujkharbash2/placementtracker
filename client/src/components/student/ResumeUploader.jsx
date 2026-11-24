import { useRef, useState } from "react";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import styles from "./ResumeUploader.module.css";

const MAX_BYTES = 2 * 1024 * 1024;

function ResumeUploader({ upload, onUploaded }) {
    const inputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    function reset() {
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
    }

    function handleChange(e) {
        const chosen = e.target.files[0] || null;
        setError("");

        if (!chosen) {
            setFile(null);
            return;
        }

        const isPdf =
            chosen.type === "application/pdf" || chosen.name.toLowerCase().endsWith(".pdf");
        if (!isPdf) {
            setError("Only PDF files are allowed.");
            reset();
            return;
        }
        if (chosen.size > MAX_BYTES) {
            setError("The file is larger than 2 MB.");
            reset();
            return;
        }

        setFile(chosen);
    }

    async function handleUpload() {
        if (!file) return;

        setUploading(true);
        setError("");

        const result = await upload(file);
        setUploading(false);

        if (result.error) {
            setError(result.error);
            return;
        }

        reset();
        if (onUploaded) onUploaded(result.resume);
    }

    return (
        <div>
            <div className={styles.row}>
                <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf"
                    className={styles.file}
                    onChange={handleChange}
                    disabled={uploading}
                />
                <Button type="button" variant="primary" disabled={!file || uploading} onClick={handleUpload}>
                    {uploading ? "Uploading..." : "Upload"}
                </Button>
            </div>
            <p className={styles.hint}>PDF only, up to 2 MB.</p>
            <ErrorMessage message={error} />
        </div>
    );
}

export default ResumeUploader;