import { useState, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useDashboard } from "../../../hooks/useDashboard";
import { formatPercent } from "../../../utils/format";
import DashboardHeader from "../../dashboard/DashboardHeader";
import DashboardSkeleton from "../../dashboard/DashboardSkeleton";
import ErrorState from "../../dashboard/ErrorState";
import StatCard from "../../dashboard/StatCard";
import QuickLinks from "../../dashboard/QuickLinks";
import Toast from "../../dashboard/Toast";
import PlacementByBranchChart from "../../dashboard/charts/PlacementByBranchChart";
import ApplicationsTrendChart from "../../dashboard/charts/ApplicationsTrendChart";
import OutcomeDonutChart from "../../dashboard/charts/OutcomeDonutChart";
import PendingDrivesPanel from "./PendingDrivesPanel";
import ExpiringOffersPanel from "./ExpiringOffersPanel";
import IncompleteProfilesPanel from "./IncompleteProfilesPanel";
import ActivityFeed from "./ActivityFeed";
import dash from "../../dashboard/Dashboard.module.css";

// onNavigate(page, options): switches the Admin sidebar page, e.g. onNavigate("all-drives", { filters })
function AdminHome({ onNavigate }) {
    const { name } = useAuth();
    const { data, loading, refreshing, error, refresh, reloadQuietly, mutate } = useDashboard(
    "/api/dashboard/admin",
    {}
);

    const [toast, setToast] = useState(null);
    const closeToast = useCallback(() => setToast(null), []);

    function handleReviewed(driveId, action) {
        // Remove the row straight away, then re-fetch so every server-computed number updates
        mutate((prev) =>
            prev
                ? {
                      ...prev,
                      needs_attention: {
                          ...prev.needs_attention,
                          pending_drives: (prev.needs_attention?.pending_drives || []).filter(
                              (d) => d.id !== driveId
                          ),
                      },
                  }
                : prev
        );
        setToast({ type: "success", message: action === "approve" ? "Drive approved." : "Drive rejected." });
        reloadQuietly();
    }

    const c = data?.cards || {};
    const attention = data?.needs_attention || {};
    const charts = data?.charts || {};

    return (
        <div className={dash.page}>
            <DashboardHeader
                title={`Welcome, ${name || "Admin"}`}
                generatedAt={data?.generated_at}
                onRefresh={refresh}
                refreshing={refreshing || loading}
            />

            {error && <ErrorState error={error} onRetry={refresh} />}
            {loading && !error && <DashboardSkeleton cards={7} panels={3} blocks={2} />}

            {data && !error && (
                <div className={`${dash.page} ${refreshing ? dash.dim : ""}`}>
                    <div className={dash.cardGrid}>
                        <StatCard
                        
                            label="Total students"
                            value={c.total_students}
                            onClick={() => onNavigate("students")}
                        />
                        <StatCard
                            
                            label="Placed students"
                            value={c.placed_students}
                            subtext={`${formatPercent(c.placement_percentage)} placed`}
                        />
                        <StatCard  label="Total companies" value={c.total_companies} />
                        <StatCard
                            
                            label="Total recruiters"
                            value={c.total_recruiters}
                            onClick={() => onNavigate("recruiters")}
                        />
                        <StatCard
                          
                            label="Active drives"
                            value={c.active_drives}
                            onClick={() =>
                                onNavigate("all-drives", { filters: { status: "approved", timeline: "current" } })
                            }
                        />
                        <StatCard
                          
                            label="Pending approvals"
                            value={c.pending_approvals}
                            accent={c.pending_approvals > 0 ? "amber" : undefined}
                            flagLabel={c.pending_approvals > 0 ? "Needs review" : undefined}
                            onClick={() => onNavigate("pending-drives")}
                        />
                        <StatCard label="Offers accepted" value={c.offers_accepted} />
                    </div>

                    <h2 className={dash.sectionTitle}>Needs attention</h2>
                    <div className={dash.threeCol}>
                        <PendingDrivesPanel
                            drives={attention.pending_drives || []}
                            onReviewed={handleReviewed}
                            onViewAll={() => onNavigate("pending-drives")}
                        />
                        <ExpiringOffersPanel offers={attention.expiring_offers || []} />
                        <IncompleteProfilesPanel
                            count={attention.incomplete_profiles_count}
                            onView={() => onNavigate("students")}
                        />
                    </div>

                    <h2 className={dash.sectionTitle}>Insights</h2>
                    <div className={dash.chartGrid}>
                        <PlacementByBranchChart data={charts.placement_by_branch} />
                        <ApplicationsTrendChart data={charts.applications_last_30_days} />
                        <OutcomeDonutChart data={charts.outcome_breakdown} />
                    </div>

                    <ActivityFeed events={data.recent_activity || []} />

                    <h2 className={dash.sectionTitle}>Quick links</h2>
                    <QuickLinks
                        links={[
                            { label: "Create user", onClick: () => onNavigate("create-user") },
                            { label: "All Drives", onClick: () => onNavigate("all-drives") },
                            { label: "Users list", onClick: () => onNavigate("students") },
                            { label: "Reports", disabled: true, tooltip: "Coming soon" },
                        ]}
                    />
                </div>
            )}

            <Toast toast={toast} onClose={closeToast} />
        </div>
    );
}

export default AdminHome;