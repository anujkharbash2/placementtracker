import Panel from "../../dashboard/Panel";
import { formatText, formatDateTimeIST, relativeTime } from "../../../utils/format";
import styles from "./AdminHome.module.css";

function ActivityFeed({ events }) {
    return (
        <Panel title="Recent activity" isEmpty={events.length === 0} emptyText="No recent activity">
            <ol className={styles.timeline}>
                {events.slice(0, 10).map((e) => (
                    <li key={e.id} className={styles.timelineItem}>
                        <div>
                            <strong>{formatText(e.student_name)}</strong> — {formatText(e.event)}
                        </div>
                        <div className={styles.rowMeta}>
                            {formatText(e.drive_title)} · {formatText(e.company_name)}
                        </div>
                        <time
                            className={styles.rowMeta}
                            dateTime={e.changed_at}
                            title={formatDateTimeIST(e.changed_at)}
                        >
                            {relativeTime(e.changed_at)}
                        </time>
                    </li>
                ))}
            </ol>
        </Panel>
    );
}

export default ActivityFeed;