import { getOutcomeMeta } from "../../constants/outcomes";
import { formatNumber } from "../../utils/format";
import styles from "./OutcomeBadge.module.css";

function OutcomeBadge({ outcome, count }) {
    const meta = getOutcomeMeta(outcome);

    return (
        <span
            className={styles.badge}
            style={{ "--badge-text": meta.text, "--badge-bg": `${meta.color}26` }}
        >
            {meta.label}
            {count !== undefined ? `: ${formatNumber(count)}` : ""}
        </span>
    );
}

export default OutcomeBadge;