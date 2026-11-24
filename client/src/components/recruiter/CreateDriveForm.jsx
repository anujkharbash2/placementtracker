import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config";
import Input from "../common/Input";
import Select from "../common/Select";
import CheckboxGroup from "../common/CheckboxGroup";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import SuccessMessage from "../common/SuccessMessage";
import RoundsEditor from "./RoundsEditor"; 
import styles from "./CreateDriveForm.module.css";
import { DEGREE_OPTIONS, ALL_BRANCH_OPTIONS } from "../../constants/academicOptions";
const TYPE_OPTIONS = [
    { value: "job", label: "Job" },
    { value: "internship", label: "Internship" },
];



function CreateDriveForm({ onCreated }) {
    const { token } = useAuth();

    const [title, setTitle] = useState("");
    const [type, setType] = useState("job");
    const [numberOfOpenings, setNumberOfOpenings] = useState("");
    const [applicationDeadline, setApplicationDeadline] = useState("");
    const [description, setDescription] = useState("");
    const [minCgpa, setMinCgpa] = useState("");
    const [maxBacklogs, setMaxBacklogs] = useState("");
    const [allowedBranches, setAllowedBranches] = useState([]);
    const [allowedDegrees, setAllowedDegrees] = useState([]);
    const [eligiblePassingYears, setEligiblePassingYears] = useState("");
    const [packageOrStipend, setPackageOrStipend] = useState("");
    const [jobLocation, setJobLocation] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [rounds, setRounds] = useState([]);
    function toIstIso(value) {
    // datetime-local gives "2026-10-05T18:00"; this makes it "2026-10-05T18:00:00+05:30"
    return value.length === 16 ? `${value}:00+05:30` : `${value}+05:30`;
}

    function validate() {
        if (!title || !type || !numberOfOpenings || !applicationDeadline) {
            return "Title, type, number of openings, and application deadline are required.";
        }
        if (rounds.length > 0 && rounds.some((r) => !r.trim())) {
    return "Every round needs a name, or remove the empty one.";
}
        return "";
    }

    function resetForm() {
        setTitle("");
        setType("job");
        setNumberOfOpenings("");
        setApplicationDeadline("");
        setDescription("");
        setMinCgpa("");
        setMaxBacklogs("");
        setAllowedBranches([]);
        setAllowedDegrees([]);
        setEligiblePassingYears("");
        setPackageOrStipend("");
        setJobLocation("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

    const years = eligiblePassingYears
    .split(",")
    .map((y) => y.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => !Number.isNaN(n)); 
    
    const payload = {
    title,
    type,
    number_of_openings: Number(numberOfOpenings),
    application_deadline: toIstIso(applicationDeadline),
    description,
    min_cgpa: minCgpa === "" ? undefined : Number(minCgpa),
    max_backlogs: maxBacklogs === "" ? undefined : Number(maxBacklogs),
    allowed_branches: allowedBranches.length ? allowedBranches : undefined,
    allowed_degrees: allowedDegrees.length ? allowedDegrees : undefined,
    eligible_passing_years: years.length ? years : undefined,
    package_or_stipend: packageOrStipend,
    job_location: jobLocation,
    rounds: rounds.length > 0 ? rounds.map((r) => r.trim()) : undefined,
};

        try {
            const response = await fetch(`${API_BASE_URL}/api/drives`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Could not create drive.");
                return;
            }

            setSuccess(data.message || "Drive created. Awaiting admin approval.");
            resetForm();
            if (onCreated) onCreated();
        } catch (err) {
            setError("Could not reach the server.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.wrapper}>
            <h3 className={styles.title}>Create Drive</h3>

            <form onSubmit={handleSubmit}>
                <Input label="Title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} />

                <Select
                    label="Type"
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    options={TYPE_OPTIONS}
                />

                <Input
                    label="Number of Openings"
                    id="numberOfOpenings"
                    type="number"
                    value={numberOfOpenings}
                    onChange={(e) => setNumberOfOpenings(e.target.value)}
                />

                <Input
    label="Application Deadline (IST)"
    id="applicationDeadline"
    type="datetime-local"
    value={applicationDeadline}
    onChange={(e) => setApplicationDeadline(e.target.value)}
/>

                <div className={styles.field}>
                    <label className={styles.label} htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        className={styles.textarea}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                    />
                </div>
                <RoundsEditor rounds={rounds} onChange={setRounds} />   {/* ← add this */}


                <Input label="Minimum CGPA" id="minCgpa" value={minCgpa} onChange={(e) => setMinCgpa(e.target.value)} />
                <Input label="Max Backlogs Allowed" id="maxBacklogs" value={maxBacklogs} onChange={(e) => setMaxBacklogs(e.target.value)} />

                <CheckboxGroup
                    label="Allowed Branches"
                    options={ALL_BRANCH_OPTIONS}
                    selectedValues={allowedBranches}
                    onChange={setAllowedBranches}
                />

                <CheckboxGroup
                    label="Allowed Degrees"
                    options={DEGREE_OPTIONS}
                    selectedValues={allowedDegrees}
                    onChange={setAllowedDegrees}
                />

                <Input
                    label="Eligible Passing Years (comma-separated, e.g. 2025, 2026)"
                    id="eligiblePassingYears"
                    value={eligiblePassingYears}
                    onChange={(e) => setEligiblePassingYears(e.target.value)}
                />

                <Input label="Package / Stipend" id="packageOrStipend" value={packageOrStipend} onChange={(e) => setPackageOrStipend(e.target.value)} />
                <Input label="Job Location" id="jobLocation" value={jobLocation} onChange={(e) => setJobLocation(e.target.value)} />

                <Button variant="primary" type="submit" disabled={loading} className={styles.submitButton}>
                    {loading ? "Creating..." : "Create Drive"}
                </Button>

                <ErrorMessage message={error} />
                <SuccessMessage message={success} />
            </form>
        </div>
    );
}

export default CreateDriveForm;