import styles from "./ApplicationTracker.module.css";

function ApplicationTracker({ rounds, application }) {
    if (!rounds || rounds.length === 0) return null;

    if (application.outcome === "rejected") {
        return <div className={styles.rejected}>This application was not taken forward.</div>;
    }

    const allDone = ["offer", "offer_accepted", "offer_declined"].includes(application.outcome);

    return (
        <div className={styles.tracker}>
            {rounds.map((round) => {
                const state = allDone
                    ? "done"
                    : round.round_order < application.current_round_order
                    ? "done"
                    : round.round_order === application.current_round_order
                    ? "current"
                    : "upcoming";

                return (
                    <div key={round.id} className={`${styles.step} ${styles[state]}`}>
                        <div className={styles.dot}>{state === "done" ? "✓" : round.round_order}</div>
                        <div>{round.name}</div>
                    </div>
                );
            })}
        </div>
    );
}

export default ApplicationTracker;