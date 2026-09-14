import styles from "./Input.module.css";

function Input({ label, id, type = "text", value, onChange, error, ...rest }) {
    return (
        <div className={styles.field}>
            {label && (
                <label className={styles.label} htmlFor={id}>
                    {label}
                </label>
            )}
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                className={`${styles.input} ${error ? styles.inputError : ""}`}
                {...rest}
            />
        </div>
    );
}

export default Input;