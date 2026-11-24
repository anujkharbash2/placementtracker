import Button from "./Button";
import styles from "./FilterTabs.module.css";

function FilterTabs({ options, value, onChange }) {
    return (
        <div className={styles.row}>
            {options.map((opt) => (
                <Button
                    key={opt.value}
                    type="button"
                    variant={value === opt.value ? "primary" : "outline"}
                    onClick={() => onChange(opt.value)}
                >
                    {opt.label}
                </Button>
            ))}
        </div>
    );
}

export default FilterTabs;