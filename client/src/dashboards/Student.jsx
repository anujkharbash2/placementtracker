import { useState } from "react";
import { useAuth } from "../context/AuthContext";

import styles from "./Student.module.css";
import Button from "../components/common/Button";
import Sidebar from "../components/common/Sidebar";
import StudentProfile from "../components/student/StudentProfile";
import AvailableDrives from "../components/student/AvailableDrives";
import ResumeManager from "../components/student/ResumeManager";
import MyApplications from "../components/student/MyApplications";


function StudentDashboard() {
    const { role, name, logout } = useAuth();
    const [activePage, setActivePage] = useState("dashboard");

    const studentSidebarItems = [
        {
            label: "Dashboard",
            active: activePage === "dashboard",
            onClick: () => setActivePage("dashboard"),
        },
        {
            label: "Opportunities",
            active: activePage === "opportunities",
            onClick: () => setActivePage("opportunities"),
        },
        {
            label: "Track Applications",
            active: activePage === "track-applications",
            onClick: () => setActivePage("track-applications"),
        },
        {
    label: "Resumes",
    active: activePage === "resumes",
    onClick: () => setActivePage("resumes"),
},
        {
            label: "Profile",
            active: activePage === "profile",
            onClick: () => setActivePage("profile"),
        },

    ];

    return (
        <div className={styles.studentDashboard}>
            <Sidebar items={studentSidebarItems} />

            <div className={styles.mainContent}>
                {activePage === "dashboard" && (
                    <>
                        <h1>Student Dashboard</h1>
                        <p>Logged in as: {name}</p>
                        <Button
                            variant="primary"
                            onClick={logout}
                            className={styles.logoutButton}
                        >
                            Logout
                        </Button>
                    </>
                )}

                {activePage === "opportunities" && (
                    <>
                        <h1>Explore Opportunities</h1>
                        <AvailableDrives onGoToProfile={() => setActivePage("profile")} />
                    </>
                )}

                {activePage === "track-applications" && (
                    <MyApplications />
                )}
                {activePage === "resumes" && (<ResumeManager />)}

                {activePage === "profile" && (
                    <StudentProfile />
                )}
            </div>
        </div>
    );
}

export default StudentDashboard;