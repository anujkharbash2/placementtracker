import styles from "./RecruiterHome.module.css";

function MineToggle({ checked, onChange }) {
    return (
        <label className={styles.toggle}>
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            My drives only
        </label>
    );
}

export default MineToggle;