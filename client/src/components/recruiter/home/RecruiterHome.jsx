import { useState } from "react";
import { useDashboard } from "../../../hooks/useDashboard";
import DashboardHeader from "../../dashboard/DashboardHeader";
import DashboardSkeleton from "../../dashboard/DashboardSkeleton";
import ErrorState from "../../dashboard/ErrorState";
import StatCard from "../../dashboard/StatCard";
import QuickLinks from "../../dashboard/QuickLinks";
import MineToggle from "./MineToggle";
import RejectedDrivesPanel from "./RejectedDrivesPanel";
import OffersAwaitingPanel from "./OffersAwaitingPanel";
import StaleApplicantsPanel from "./StaleApplicantsPanel";
import PipelineSection from "./PipelineSection";
import RecentApplicantsTable from "./RecentApplicantsTable";
import dash from "../../dashboard/Dashboard.module.css";

const STORAGE_KEY = "recruiter_home_mine";

function readMine() {
    try {
        return localStorage.getItem(STORAGE_KEY) === "true";
    } catch (err) {
        return false;
    }
}

// onNavigate(page, options): switches the Recruiter sidebar page
function RecruiterHome({ onNavigate }) {
    const [mine, setMine] = useState(readMine);

    // Toggling keeps the old data on screen (dimmed) until the newest response arrives
    const { data, loading, refreshing, error, refresh } = useDashboard(
    "/api/dashboard/recruiter",
    { mine: mine ? "true" : undefined }
);

    function handleToggle(next) {
        setMine(next);
        try {
            localStorage.setItem(STORAGE_KEY, String(next));
        } catch (err) {
            // storage unavailable; the toggle still works for this session
        }
    }

    const openDrive = (driveId) => onNavigate("track-applications", { driveId });
    const myDrives = (filters) => () => onNavigate("my-drives", { filters });
    const createDrive = () => onNavigate("post-drive");

    const c = data?.cards || {};
    const attention = data?.needs_attention || {};
    const companyName = data?.company?.name;

    return (
        <div className={dash.page}>
            <DashboardHeader
                title={`${companyName ? `${companyName} — ` : ""}Recruiter Home`}
                generatedAt={data?.generated_at}
                onRefresh={refresh}
                refreshing={refreshing || loading}
            >
                <MineToggle checked={mine} onChange={handleToggle} />
            </DashboardHeader>

            {error && <ErrorState error={error} onRetry={refresh} />}
            {loading && !error && <DashboardSkeleton cards={8} panels={3} blocks={2} />}

            {data && !error && (
                <div className={`${dash.page} ${refreshing ? dash.dim : ""}`}>
                    <div className={dash.cardGrid}>
                        <StatCard label="Pending drives" value={c.drives_pending} onClick={myDrives({ status: "pending" })} />
                        <StatCard label="Approved drives" value={c.drives_approved} onClick={myDrives({ status: "approved" })} />
                        <StatCard
                           
                            label="Rejected drives"
                            value={c.drives_rejected}
                            accent={c.drives_rejected > 0 ? "red" : undefined}
                            flagLabel={c.drives_rejected > 0 ? "Needs attention" : undefined}
                            onClick={myDrives({ status: "rejected" })}
                        />
                        <StatCard
                           
                            label="Active drives"
                            value={c.active_drives}
                            onClick={myDrives({ status: "approved", timeline: "current" })}
                        />
                        <StatCard label="Total applicants" value={c.total_applicants} />
                        <StatCard label="Offers extended" value={c.offers_extended} />
                        <StatCard label="Offers accepted" value={c.offers_accepted} />
                        <StatCard  label="Offers declined" value={c.offers_declined} />
                    </div>

                    <h2 className={dash.sectionTitle}>Needs attention</h2>
                    <div className={dash.threeCol}>
                        <RejectedDrivesPanel drives={attention.rejected_drives || []} onCreate={createDrive} />
                        <OffersAwaitingPanel offers={attention.offers_awaiting_response || []} onOpenDrive={openDrive} />
                        <StaleApplicantsPanel applicants={attention.stale_applicants || []} onOpenDrive={openDrive} />
                    </div>

                    <PipelineSection
                        pipeline={data.pipeline || []}
                        onOpenDrive={openDrive}
                        onCreateDrive={createDrive}
                    />

                    <RecentApplicantsTable applicants={data.recent_applicants || []} onOpenDrive={openDrive} />

                    <h2 className={dash.sectionTitle}>Quick links</h2>
                    <QuickLinks
                        links={[
                            { label: "Create drive", onClick: createDrive },
                            { label: "My Drives", onClick: () => onNavigate("my-drives") },
                        ]}
                    />
                </div>
            )}
        </div>
    );
}

export default RecruiterHome;