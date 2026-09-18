import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import SuccessMessage from "../common/SuccessMessage";
import RoleToggle from "./RoleToggle";
import styles from "./CreateUserForm.module.css";

function CreateUserForm() {
    const { token } = useAuth();

    const [role, setRole] = useState("student");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [rollNumber, setRollNumber] = useState("");

    const [designation, setDesignation] = useState("");
    const [officialEmail, setOfficialEmail] = useState("");

    const [companies, setCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState("");
    const [addingNewCompany, setAddingNewCompany] = useState(false);
    const [companyName, setCompanyName] = useState("");
    const [industry, setIndustry] = useState("");
    const [website, setWebsite] = useState("");
    const [hrEmail, setHrEmail] = useState("");
    const [address, setAddress] = useState("");

    useEffect(() => {
        if (role !== "recruiter" || !token) return;

        async function fetchCompanies() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/companies`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (response.ok) {
                    setCompanies(data.companies || data);
                }
            } catch (err) {
                console.error("Failed to load companies", err);
            }
        }

        fetchCompanies();
    }, [role, token]);

    function resetForm() {
        setName("");
        setEmail("");
        setMobileNumber("");
        setDesignation("");
        setOfficialEmail("");
        setSelectedCompanyId("");
        setAddingNewCompany(false);
        setCompanyName("");
        setIndustry("");
        setWebsite("");
        setHrEmail("");
        setAddress("");
    }

    function validate() {
        if (!name || !email) {
            return "Name and email are required.";
        }
        if (role === "recruiter") {
            if (!designation || !officialEmail) {
                return "Designation and official email are required.";
            }
            if (!addingNewCompany && !selectedCompanyId) {
                return "Select a company or add a new one.";
            }
            if (addingNewCompany && (!companyName || !industry)) {
                return "Company name and industry are required for a new company.";
            }
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
            let companyId = selectedCompanyId;

            if (role === "recruiter" && addingNewCompany) {
                const companyResponse = await fetch(`${API_BASE_URL}/api/companies`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: companyName,
                        industry,
                        website,
                        hr_email: hrEmail,
                        address,
                    }),
                });

                const companyData = await companyResponse.json();

                if (!companyResponse.ok) {
                    setError(companyData.message || "Could not create company.");
                    setLoading(false);
                    return;
                }

                companyId = companyData.id || companyData.company?.id;
            }

            const payload = {
                name,
                email,
                mobile_number: mobileNumber,
                role,
                ...(role === "student" && {
                    roll_number: rollNumber,
              }),
                ...(role === "recruiter" && {
                    company_id: companyId,
                    designation,
                    official_email: officialEmail,
                }),
            };

            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Something went wrong.");
                return;
            }

            setSuccess(
                `${role === "student" ? "Student" : "Recruiter"} account created. Login credentials have been emailed.`
            );
            resetForm();
        } catch (err) {
            setError("Could not reach the server.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.wrapper}>
            <h3 className={styles.title}>Create New User</h3>

            <RoleToggle role={role} onChange={setRole} />

            <form onSubmit={handleSubmit}>
                <Input label="Name" id="name" value={name} onChange={(e) => setName(e.target.value)} />
                <Input label="Email" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input label="Enrollment Number" id="rollNumber" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} />

                {role === "recruiter" && (
                    <>
                        <Input label="Designation" id="designation" value={designation} onChange={(e) => setDesignation(e.target.value)} />
                        <Input label="Official Email" id="officialEmail" type="email" value={officialEmail} onChange={(e) => setOfficialEmail(e.target.value)} />

                        {!addingNewCompany && (
                            <>
                                <Select
                                    label="Company"
                                    id="company"
                                    value={selectedCompanyId}
                                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                                    placeholder="Select a company"
                                    options={companies.map((c) => ({ value: c.id, label: c.name }))}
                                />
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setAddingNewCompany(true)}
                                >
                                    + Add New Company
                                </Button>
                            </>
                        )}

                        {addingNewCompany && (
                            <>
                                <Input label="Company Name" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                                <Input label="Industry" id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
                                <Input label="Website" id="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
                                <Input label="HR Email" id="hrEmail" type="email" value={hrEmail} onChange={(e) => setHrEmail(e.target.value)} />
                                <Input label="Address" id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                                <Button
                                    variant="secondary"
                                    type="button"
                                    onClick={() => setAddingNewCompany(false)}
                                >
                                    Cancel — choose existing company instead
                                </Button>
                            </>
                        )}
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