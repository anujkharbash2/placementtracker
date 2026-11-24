import { useState } from "react";
import Panel from "../../dashboard/Panel";
import Button from "../../common/Button";
import PipelineCard from "./PipelineCard";
import dash from "../../dashboard/Dashboard.module.css";
import styles from "./RecruiterHome.module.css";

const PAGE_SIZE = 6;

function PipelineSection({ pipeline, onOpenDrive, onCreateDrive }) {
    const [visible, setVisible] = useState(PAGE_SIZE);

    if (pipeline.length === 0) {
        return (
            <Panel title="Pipeline overview">
                <div className={styles.firstDrive}>
                    <p>You haven't created any drives yet.</p>
                    <Button type="button" variant="primary" onClick={onCreateDrive}>
                        Create your first drive
                    </Button>
                </div>
            </Panel>
        );
    }

    return (
        <section>
            <h2 className={dash.sectionTitle}>Pipeline overview</h2>

            <div className={styles.pipelineGrid}>
                {pipeline.slice(0, visible).map((drive) => (
                    <PipelineCard key={drive.drive_id} drive={drive} onOpen={onOpenDrive} />
                ))}
            </div>

            {visible < pipeline.length && (
                <Button type="button" variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                    Show more
                </Button>
            )}
        </section>
    );
}

export default PipelineSection;