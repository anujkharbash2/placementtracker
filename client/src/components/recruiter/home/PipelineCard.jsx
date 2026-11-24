import StatusBadge from "../../common/StatusBadge";
import Button from "../../common/Button";
import OutcomeBadge from "../../dashboard/OutcomeBadge";
import { OUTCOME_ORDER } from "../../../constants/outcomes";
import { formatText, formatNumber } from "../../../utils/format";
import styles from "./RecruiterHome.module.css";

function PipelineCard({ drive, onOpen }) {
    const rounds = [...(drive.rounds || [])].sort((a, b) => a.round_order - b.round_order);
    const chips = OUTCOME_ORDER.filter((key) => drive.outcomes?.[key] > 0);
    const isApproved = drive.approval_status === "approved";

    return (
        <article className={styles.pipelineCard}>
            <header className={styles.pipelineHeader}>
                <div>
                    <h4>{formatText(drive.title)}</h4>
                    <p className={styles.rowMeta}>Created by {formatText(drive.created_by_name)}</p>
                </div>
                <div className={styles.pipelineRight}>
                    <StatusBadge status={drive.approval_status} />
                    <span className={styles.rowMeta}>{formatNumber(drive.total_applicants)} applicants</span>
                </div>
            </header>

            {isApproved ? (
                <>
                    <p className={styles.funnelLabel}>Currently at each round</p>
                    {rounds.length === 0 ? (
                        <p className={styles.rowMeta}>No rounds to show</p>
                    ) : (
                        <ol className={styles.funnel}>
                            {rounds.map((round) => (
                                <li key={round.round_id} className={styles.funnelStep}>
                                    <span className={styles.funnelCount}>{formatNumber(round.count)}</span>
                                    <span className={styles.funnelName}>{round.name}</span>
                                </li>
                            ))}
                        </ol>
                    )}
                </>
            ) : (
                <p className={styles.rowMeta}>
                    {drive.approval_status === "pending"
                        ? "No applicants yet (awaiting approval)"
                        : "No applicants (this drive was rejected)"}
                </p>
            )}

            {chips.length > 0 && (
                <ul className={styles.chips}>
                    {chips.map((key) => (
                        <li key={key}>
                            <OutcomeBadge outcome={key} count={drive.outcomes[key]} />
                        </li>
                    ))}
                </ul>
            )}

            {isApproved && (
                <div>
                    <Button type="button" variant="outline" onClick={() => onOpen(drive.drive_id)}>
                        View applicants
                    </Button>
                </div>
            )}
        </article>
    );
}

export default PipelineCard;
