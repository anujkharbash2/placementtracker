import styles from "./CheckboxGroup.module.css";

function CheckboxGroup({ label, options, selectedValues, onChange }) {
    function toggleValue(value) {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter((v) => v !== value));
        } else {
            onChange([...selectedValues, value]);
        }
    }

    return (
        <div className={styles.field}>
            {label && <label className={styles.label}>{label}</label>}
            <div className={styles.grid}>
                {options.map((opt) => (
                    <label key={opt.value} className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={selectedValues.includes(opt.value)}
                            onChange={() => toggleValue(opt.value)}
                        />
                        {opt.label}
                    </label>
                ))}
            </div>
        </div>
    );
}

export default CheckboxGroup;