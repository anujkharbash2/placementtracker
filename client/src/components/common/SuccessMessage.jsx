import styles from "./SuccessMessage.module.css";

function SuccessMessage({ message }) {
    if (!message) return null;
    return <p className={styles.success}>{message}</p>;
}

export default SuccessMessage;