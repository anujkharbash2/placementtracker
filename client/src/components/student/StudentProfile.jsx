import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import SuccessMessage from "../common/SuccessMessage";
import styles from "./StudentProfile.module.css";

const DEGREE_OPTIONS = [
    { value: "B.Tech", label: "B.Tech" },
    { value: "Dual B.Tech-M.Tech", label: "Dual B.Tech - M.Tech" },
    { value: "M.Tech", label: "M.Tech" },
    { value: "Integrated M.Tech", label: "Integrated M.Tech" },
    { value: "Integrated BS-MS", label: "Integrated BS - MS (Interdisciplinary Sciences)" },
    { value: "Integrated BBA-MBA", label: "Integrated BBA - MBA" },
    { value: "BA LLB", label: "BA LLB" },
    { value: "BBA LLB", label: "BBA LLB" },
    { value: "BA (Honours)", label: "BA (Honours) in Media, Arts & Design" },
    { value: "MSc", label: "MSc" },
    { value: "MA", label: "MA" },
    { value: "MBA", label: "MBA" },
    { value: "MCA", label: "MCA" },
    { value: "LLM", label: "LLM (Master of Laws)" },
    { value: "MS", label: "MS" },
];

// Maps each degree to its available branches/specializations.
// A degree missing from this object has no branch choice — the field is hidden for it.
const BRANCH_OPTIONS_BY_DEGREE = {
    "B.Tech": [
        { value: "Computer Science & Engineering", label: "Computer Science & Engineering" },
        { value: "Mathematics & Computing", label: "Mathematics & Computing" },
    ],
    "Dual B.Tech-M.Tech": [
        { value: "CSE", label: "CSE" },
    ],
    "M.Tech": [
        { value: "Computer Science & Engineering", label: "Computer Science & Engineering" },
    ],
    "Integrated M.Tech": [
        { value: "Computer Science & Engineering", label: "Computer Science & Engineering" },
    ],
    "MSc": [
        { value: "Applied Mathematics", label: "Applied Mathematics" },
        { value: "Biotechnology", label: "Biotechnology" },
        { value: "Computer Science", label: "Computer Science" },
    ],
    "MA": [
        { value: "Economics", label: "Economics" },
        { value: "International Relations", label: "International Relations" },
        { value: "Sociology", label: "Sociology" },
        { value: "Journalism and Digital Media", label: "Journalism and Digital Media" },
        { value: "Communication for Sustainable Development", label: "Communication for Sustainable Development" },
    ],
    "MS": [
        { value: "Climate Change and Sustainability", label: "Climate Change and Sustainability" },
        { value: "Business Analytics", label: "Business Analytics" },
    ],
    "Integrated BS-MS": [
        { value: "Interdisciplinary Sciences", label: "Interdisciplinary Sciences" },
    ],
};

function StudentProfile() {
    const { token } = useAuth();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [rollNumber, setRollNumber] = useState("");

    const [degree, setDegree] = useState("");
    const [branch, setBranch] = useState("");
    const [cgpa, setCgpa] = useState("");
    const [activeBacklogs, setActiveBacklogs] = useState("");
    const [admissionYear, setAdmissionYear] = useState("");
    const [passingYear, setPassingYear] = useState("");
    const [gender, setGender] = useState("");
    const [category, setCategory] = useState("");

    const currentBranchOptions = BRANCH_OPTIONS_BY_DEGREE[degree] || [];
    const hasBranchOptions = currentBranchOptions.length > 0;

    useEffect(() => {
        if (!token) return;

        async function fetchProfile() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/students/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();

                if (response.ok && data.profile) {
                    const p = data.profile;
                    setName(p.name || "");
                    setEmail(p.email || "");
                    setMobileNumber(p.mobile_number || "");
                    setRollNumber(p.roll_number || "");
                    setDegree(p.degree || "");
                    setBranch(p.branch || "");
                    setCgpa(p.cgpa ?? "");
                    setActiveBacklogs(p.active_backlogs ?? "");
                    setAdmissionYear(p.admission_year || "");
                    setPassingYear(p.passing_year || "");
                    setGender(p.gender || "");
                    setCategory(p.category || "");
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setFetching(false);
            }
        }

        fetchProfile();
    }, [token]);

    function validate() {
        if (!degree || !admissionYear || !passingYear) {
            return "Degree, admission year, and passing year are required.";
        }
        if (hasBranchOptions && !branch) {
            return "Please select a branch/specialization.";
        }
        if (cgpa !== "" && (cgpa < 0 || cgpa > 10)) {
            return "CGPA must be between 0 and 10.";
        }
        if (activeBacklogs !== "" && activeBacklogs < 0) {
            return "Active backlogs cannot be negative.";
        }
        return "";
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

        try {
            const response = await fetch(`${API_BASE_URL}/api/students/profile`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    degree,
                    branch: hasBranchOptions ? branch : "",
                    cgpa,
                    active_backlogs: activeBacklogs,
                    admission_year: admissionYear,
                    passing_year: passingYear,
                    gender,
                    category,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Could not update profile.");
                return;
            }

            setSuccess("Profile updated successfully.");
        } catch (err) {
            setError("Could not reach the server.");
        } finally {
            setLoading(false);
        }
    }

    if (fetching) {
        return <p>Loading profile...</p>;
    }

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>Manage Profile</h2>
            <p className={styles.hint}>
                Complete your academic details to become eligible for placement drives.
            </p>

            <form onSubmit={handleSubmit}>
                <Input label="Name" id="name" value={name} disabled />
                <Input label="Email" id="email" value={email} disabled />
                <Input label="Mobile Number" id="mobileNumber" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
                <Input label="Roll Number" id="rollNumber" value={rollNumber} disabled />

                <Select
                    label="Degree"
                    id="degree"
                    value={degree}
                    onChange={(e) => {
                        setDegree(e.target.value);
                        setBranch("");
                    }}
                    placeholder="Select degree"
                    options={DEGREE_OPTIONS}
                />

                {hasBranchOptions && (
                    <Select
                        label="Branch / Specialization"
                        id="branch"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        placeholder="Select branch"
                        options={currentBranchOptions}
                    />
                )}

                <Input label="CGPA" id="cgpa" value={cgpa} onChange={(e) => setCgpa(e.target.value)} />
                <Input label="Active Backlogs" id="activeBacklogs" value={activeBacklogs} onChange={(e) => setActiveBacklogs(e.target.value)} />
                <Input label="Admission Year" id="admissionYear" value={admissionYear} onChange={(e) => setAdmissionYear(e.target.value)} />
                <Input label="Passing Year" id="passingYear" value={passingYear} onChange={(e) => setPassingYear(e.target.value)} />
                <Input label="Gender (optional)" id="gender" value={gender} onChange={(e) => setGender(e.target.value)} />
                <Input label="Category (optional)" id="category" value={category} onChange={(e) => setCategory(e.target.value)} />

                <Button variant="primary" type="submit" disabled={loading} className={styles.submitButton}>
                    {loading ? "Saving..." : "Save Profile"}
                </Button>

                <ErrorMessage message={error} />
                <SuccessMessage message={success} />
            </form>
        </div>
    );
}

export default StudentProfile;