import Panel from "../../dashboard/Panel";
import { formatNumber } from "../../../utils/format";
import dash from "../../dashboard/Dashboard.module.css";
import styles from "./AdminHome.module.css";

function IncompleteProfilesPanel({ count, onView }) {
    return (
        <Panel
            title="Incomplete student profiles"
            isEmpty={count === 0}
            emptyText="All student profiles are complete 🎉"
            footer={
                <button type="button" className={dash.linkButton} onClick={onView}>
                    View students
                </button>
            }
        >
            <p className={styles.bigNumber}>{formatNumber(count)}</p>
            <p className={styles.rowMeta}>students haven't completed their profile</p>
        </Panel>
    );
}

export default IncompleteProfilesPanel;