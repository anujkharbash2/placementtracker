import Panel from "../../dashboard/Panel";
import { formatText, formatDateTimeIST } from "../../../utils/format";
import dash from "../../dashboard/Dashboard.module.css";

function RecentApplicantsTable({ applicants, onOpenDrive }) {
    return (
        <Panel title="Recent applicants" isEmpty={applicants.length === 0} emptyText="No applicants yet">
            <div className={dash.tableWrap}>
                <table className={dash.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Roll no.</th>
                            <th>Branch</th>
                            <th>CGPA</th>
                            <th>Drive</th>
                            <th>Applied</th>
                            <th>Current round</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applicants.slice(0, 10).map((a) => (
                            <tr
                                key={a.application_id}
                                className={dash.rowClickable}
                                tabIndex={0}
                                onClick={() => onOpenDrive(a.drive_id)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") onOpenDrive(a.drive_id);
                                }}
                            >
                                <td>{formatText(a.student_name)}</td>
                                <td>{formatText(a.roll_number)}</td>
                                <td>{formatText(a.branch)}</td>
                                <td>{formatText(a.cgpa)}</td>
                                <td>{formatText(a.drive_title)}</td>
                                <td>{formatDateTimeIST(a.applied_at)}</td>
                                <td>{formatText(a.current_round_name)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Panel>
    );
}

export default RecentApplicantsTable;