import { useEffect, useRef } from "react";
import styles from "./Dashboard.module.css";

// toast: { type: "success" | "error", message } or null
function Toast({ toast, onClose }) {
    const closeRef = useRef(onClose);
    closeRef.current = onClose;

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => closeRef.current(), 4000);
        return () => clearTimeout(timer);
    }, [toast]);

    if (!toast) return null;

    return (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : ""}`} role="status">
            {toast.message}
        </div>
    );
}

export default Toast;