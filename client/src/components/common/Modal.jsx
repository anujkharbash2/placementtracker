import { useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";

function Modal({ title, onClose, busy = false, children }) {
    useEffect(() => {
        function onKey(e) {
            if (e.key === "Escape" && !busy) onClose();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose, busy]);

    return createPortal(
        <div className={styles.overlay} onClick={() => !busy && onClose()}>
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className={styles.title}>{title}</h3>
                {children}
            </div>
        </div>,
        document.body
    );
}

export default Modal;