import styles from "./ErrorMessage.module.css";

function ErrorMessage({ message }) {
    if (!message) return null;
    return <p className={styles.error}>{message}</p>;
}

export default ErrorMessage;