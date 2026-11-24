import styles from "./DriveDetails.module.css";

function DriveDetails({ drive }) {
    return (
        <>
            {drive.description && <p className={styles.description}>{drive.description}</p>}

            <div className={styles.grid}>
                {drive.package_or_stipend && (
                    <div><strong>Package/Stipend:</strong> {drive.package_or_stipend}</div>
                )}
                {drive.job_location && (
                    <div><strong>Location:</strong> {drive.job_location}</div>
                )}
                {drive.number_of_openings != null && (
                    <div><strong>Openings:</strong> {drive.number_of_openings}</div>
                )}
                {drive.min_cgpa != null && (
                    <div><strong>Min CGPA:</strong> {drive.min_cgpa}</div>
                )}
                {drive.max_backlogs != null && (
                    <div><strong>Max Backlogs:</strong> {drive.max_backlogs}</div>
                )}
                {drive.allowed_branches?.length > 0 && (
                    <div><strong>Branches:</strong> {drive.allowed_branches.join(", ")}</div>
                )}
                {drive.allowed_degrees?.length > 0 && (
                    <div><strong>Degrees:</strong> {drive.allowed_degrees.join(", ")}</div>
                )}
                {drive.eligible_passing_years?.length > 0 && (
                    <div><strong>Passing Years:</strong> {drive.eligible_passing_years.join(", ")}</div>
                )}
            </div>
        </>
    );
}

export default DriveDetails;