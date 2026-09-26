import { useState } from "react";
import styles from "./EditUserForm.module.css";

function EditUserForm({
    user,
    onUpdate,
    onClose,
}) {
    const [name, setName] = useState(user.name || "");
    const [email, setEmail] = useState(user.email || "");
    const [mobileNumber, setMobileNumber] = useState(
        user.mobile_number || ""
    );

    const [rollNumber, setRollNumber] = useState(
        user.roll_number || ""
    );

    const [degree, setDegree] = useState(
        user.degree || ""
    );

    const [branch, setBranch] = useState(
        user.branch || ""
    );

    const [cgpa, setCgpa] = useState(
        user.cgpa ?? ""
    );

    const [activeBacklogs, setActiveBacklogs] = useState(
        user.active_backlogs ?? 0
    );

    const [admissionYear, setAdmissionYear] = useState(
        user.admission_year || ""
    );

    const [passingYear, setPassingYear] = useState(
        user.passing_year || ""
    );

    const [gender, setGender] = useState(
        user.gender || ""
    );

    const [category, setCategory] = useState(
        user.category || ""
    );

    const [placementStatus, setPlacementStatus] = useState(
        user.placement_status || "not_placed"
    );

    const [saving, setSaving] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        if (!name.trim() || !email.trim()) {
            alert("Name and email are required.");
            return;
        }

        if (user.role === "student") {
            if (
                !rollNumber.trim() ||
                !degree.trim() ||
                !branch.trim() ||
                !admissionYear ||
                !passingYear
            ) {
                alert(
                    "Please fill all required student fields."
                );
                return;
            }
        }

        const updatedData = {
            name: name.trim(),
            email: email.trim(),
            mobile_number: mobileNumber.trim() || null,
        };

        // Student fields
        if (user.role === "student") {
            updatedData.roll_number =
                rollNumber.trim();

            updatedData.degree =
                degree.trim();

            updatedData.branch =
                branch.trim();

            updatedData.cgpa =
                cgpa === "" ? null : Number(cgpa);

            updatedData.active_backlogs =
                Number(activeBacklogs);

            updatedData.admission_year =
                Number(admissionYear);

            updatedData.passing_year =
                Number(passingYear);

            updatedData.gender =
                gender || null;

            updatedData.category =
                category || null;

            updatedData.placement_status =
                placementStatus;
        }

        setSaving(true);

        try {
            await onUpdate(
                user.id,
                updatedData
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className={styles.overlay}>

            <div className={styles.modal}>

                <div className={styles.header}>
                    <div>
                        <h2>Edit User</h2>

                        <p className={styles.subtitle}>
                            Update user information
                        </p>
                    </div>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        disabled={saving}
                    >
                        ×
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className={styles.form}
                >

                    {/* =========================
                        BASIC USER INFORMATION
                    ========================== */}

                    <h3 className={styles.sectionTitle}>
                        Basic Information
                    </h3>

                    <div className={styles.field}>
                        <label>Name</label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Email</label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Mobile Number</label>

                        <input
                            type="text"
                            value={mobileNumber}
                            onChange={(e) =>
                                setMobileNumber(
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    {/* =========================
                        STUDENT INFORMATION
                    ========================== */}

                    {user.role === "student" && (
                        <>
                            <h3 className={styles.sectionTitle}>
                                Academic Information
                            </h3>

                            <div className={styles.field}>
                                <label>
                                    Roll Number
                                </label>

                                <input
                                    type="text"
                                    value={rollNumber}
                                    onChange={(e) =>
                                        setRollNumber(
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                            </div>

                            <div className={styles.field}>
                                <label>
                                    Degree
                                </label>

                                <input
                                    type="text"
                                    value={degree}
                                    onChange={(e) =>
                                        setDegree(
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                            </div>

                            <div className={styles.field}>
                                <label>
                                    Branch
                                </label>

                                <input
                                    type="text"
                                    value={branch}
                                    onChange={(e) =>
                                        setBranch(
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                            </div>

                            <div className={styles.row}>

                                <div className={styles.field}>
                                    <label>CGPA</label>

                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.01"
                                        value={cgpa}
                                        onChange={(e) =>
                                            setCgpa(
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>
                                        Active Backlogs
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={activeBacklogs}
                                        onChange={(e) =>
                                            setActiveBacklogs(
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                            </div>

                            <div className={styles.row}>

                                <div className={styles.field}>
                                    <label>
                                        Admission Year
                                    </label>

                                    <input
                                        type="number"
                                        value={admissionYear}
                                        onChange={(e) =>
                                            setAdmissionYear(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>
                                        Passing Year
                                    </label>

                                    <input
                                        type="number"
                                        value={passingYear}
                                        onChange={(e) =>
                                            setPassingYear(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>

                            </div>

                            <div className={styles.field}>
                                <label>Gender</label>

                                <select
                                    value={gender}
                                    onChange={(e) =>
                                        setGender(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        Select gender
                                    </option>
                                    <option value="male">
                                        Male
                                    </option>
                                    <option value="female">
                                        Female
                                    </option>
                                    <option value="other">
                                        Other
                                    </option>
                                    <option value="other">
                                        Rather not to say
                                    </option>
                                </select>
                            </div>

                            <div className={styles.field}>
                                <label>Category</label>

                                <select
                                    value={category}
                                    onChange={(e) =>
                                        setCategory(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        Select category
                                    </option>
                                    <option value="general">
                                        General
                                    </option>
                                    <option value="obc">
                                        OBC
                                    </option>
                                    <option value="sc">
                                        SC
                                    </option>
                                    <option value="st">
                                        ST
                                    </option>
                                    <option value="ews">
                                        EWS
                                    </option>
                                </select>
                            </div>

                            <div className={styles.field}>
                                <label>
                                    Placement Status
                                </label>

                                <select
                                    value={placementStatus}
                                    onChange={(e) =>
                                        setPlacementStatus(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="not_placed">
                                        Not Placed
                                    </option>

                                    <option value="placed">
                                        Placed
                                    </option>

                                    <option value="opted_out">
                                        Opted Out
                                    </option>
                                </select>
                            </div>
                        </>
                    )}

                    {/* Actions */}

                    <div className={styles.actions}>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default EditUserForm;