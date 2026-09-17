import { useState } from "react";
import Input from "../common/Input";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import SuccessMessage from "../common/SuccessMessage";
import RoleToggle from "./RoleToggle";
import styles from "./CreateUserForm.module.css";

function CreateUserForm() {
    const [role, setRole] = useState("student");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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

    const [designation, setDesignation] = useState("");
    const [officialEmail, setOfficialEmail] = useState("");
    const [recruiterMobile, setRecruiterMobile] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [industry, setIndustry] = useState("");
    const [website, setWebsite] = useState("");
    const [hrEmail, setHrEmail] = useState("");
    const [address, setAddress] = useState("");

    function validate() {
        if (!name || !email || !password || !mobileNumber) {
            return "Name, email, password, and mobile number are required.";
        }
        if (role === "student") {
            if (!rollNumber || !degree || !branch || !cgpa || !admissionYear || !passingYear) {
                return "Please fill all required student fields.";
            }
        }
        if (role === "recruiter") {
            if (!designation || !officialEmail || !companyName || !industry) {
                return "Please fill all required recruiter and company fields.";
            }
        }
        return "";
    }

    function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            setSuccess(`${role === "student" ? "Student" : "Recruiter"} account created successfully.`);
        }, 1000);
    }

    return (
        <div className={styles.wrapper}>
            <h3 className={styles.title}>Create New User</h3>

            <RoleToggle role={role} onChange={setRole} />

            <form onSubmit={handleSubmit}>
                <Input label="Name" id="name" value={name} onChange={(e) => setName(e.target.value)} />
                <Input label="Email" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input label="Password" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <Input label="Mobile Number" id="mobileNumber" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />

                {role === "student" && (
                    <>
                        <Input label="Roll Number" id="rollNumber" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} />
                        <Input label="Degree" id="degree" value={degree} onChange={(e) => setDegree(e.target.value)} />
                        <Input label="Branch" id="branch" value={branch} onChange={(e) => setBranch(e.target.value)} />
                        <Input label="CGPA" id="cgpa" value={cgpa} onChange={(e) => setCgpa(e.target.value)} />
                        <Input label="Active Backlogs" id="activeBacklogs" value={activeBacklogs} onChange={(e) => setActiveBacklogs(e.target.value)} />
                        <Input label="Admission Year" id="admissionYear" value={admissionYear} onChange={(e) => setAdmissionYear(e.target.value)} />
                        <Input label="Passing Year" id="passingYear" value={passingYear} onChange={(e) => setPassingYear(e.target.value)} />
                        <Input label="Gender (optional)" id="gender" value={gender} onChange={(e) => setGender(e.target.value)} />
                        <Input label="Category (optional)" id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
                    </>
                )}

                {role === "recruiter" && (
                    <>
                        <Input label="Designation" id="designation" value={designation} onChange={(e) => setDesignation(e.target.value)} />
                        <Input label="Official Email" id="officialEmail" type="email" value={officialEmail} onChange={(e) => setOfficialEmail(e.target.value)} />
                        <Input label="Recruiter Mobile Number" id="recruiterMobile" value={recruiterMobile} onChange={(e) => setRecruiterMobile(e.target.value)} />

                        <Input label="Company Name" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                        <Input label="Industry" id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
                        <Input label="Website" id="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
                        <Input label="HR Email" id="hrEmail" type="email" value={hrEmail} onChange={(e) => setHrEmail(e.target.value)} />
                        <Input label="Address" id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </>
                )}

                <Button variant="primary" type="submit" disabled={loading} className={styles.submitButton}>
                    {loading ? "Creating..." : "Create Account"}
                </Button>

                <ErrorMessage message={error} />
                <SuccessMessage message={success} />
            </form>
        </div>
    );
}

export default CreateUserForm;