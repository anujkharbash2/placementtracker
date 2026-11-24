import { useState } from "react";

import styles from "./Recruiter.module.css";
import Sidebar from "../components/common/Sidebar";
import RecruiterHome from "../components/recruiter/home/RecruiterHome";
import CreateDriveForm from "../components/recruiter/CreateDriveForm";
import MyDrives from "../components/recruiter/MyDrives";
import TrackApplications from "../components/recruiter/TrackApplications";

function RecruiterDashboard() {
    const [activePage, setActivePage] = useState("dashboard");
    const [drivesRefreshKey, setDrivesRefreshKey] = useState(0);
    // Carries filters or a drive id from a dashboard card to the page it opens
    const [pageOptions, setPageOptions] = useState({});

    function goTo(page, options = {}) {
        setPageOptions(options);
        setActivePage(page);
    }

    const recruiterSidebarItems = [
        {
            label: "Dashboard",
            active: activePage === "dashboard",
            onClick: () => goTo("dashboard"),
        },
        {
            label: "Post Drive",
            active: activePage === "post-drive",
            onClick: () => goTo("post-drive"),
        },
        {
            label: "My Drives",
            active: activePage === "my-drives",
            onClick: () => goTo("my-drives"),
        },
        {
            label: "Track Applications",
            active: activePage === "track-applications",
            onClick: () => goTo("track-applications"),
        },
        {
            label: "Profile",
            active: activePage === "profile",
            onClick: () => goTo("profile"),
        },
    ];

    return (
        <div className={styles.recruiterDashboard}>
            <Sidebar items={recruiterSidebarItems} />

            <div className={styles.mainContent}>
                {activePage === "dashboard" && <RecruiterHome onNavigate={goTo} />}

                {activePage === "post-drive" && (
                    <CreateDriveForm
                        onCreated={() => {
                            setDrivesRefreshKey((k) => k + 1);
                            goTo("my-drives");
                        }}
                    />
                )}

                {activePage === "my-drives" && (
                    <MyDrives
                        refreshKey={drivesRefreshKey}
                        initialFilters={pageOptions.filters}
                    />
                )}

                {activePage === "track-applications" && (
                    <TrackApplications initialDriveId={pageOptions.driveId} />
                )}

                {activePage === "profile" && <h1>Manage Profile</h1>}
            </div>
        </div>
    );
}

export default RecruiterDashboard;