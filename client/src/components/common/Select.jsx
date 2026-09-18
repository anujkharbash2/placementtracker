import styles from "./Select.module.css";

function Select({ label, id, value, onChange, options, placeholder }) {
    return (
        <div className={styles.field}>
            {label && (
                <label className={styles.label} htmlFor={id}>
                    {label}
                </label>
            )}
            <select id={id} value={value} onChange={onChange} className={styles.select}>
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default Select;