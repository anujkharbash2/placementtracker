import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import SuccessMessage from "../common/SuccessMessage";
import styles from "./StudentProfile.module.css";
import { DEGREE_OPTIONS, BRANCH_OPTIONS_BY_DEGREE } from "../../constants/academicOptions";



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