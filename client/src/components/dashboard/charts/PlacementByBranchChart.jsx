import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import ChartCard from "../ChartCard";
import { formatNumber, formatPercent } from "../../../utils/format";
import styles from "../Dashboard.module.css";

function BranchTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const row = payload[0].payload;

    return (
        <div className={styles.tooltip}>
            {row.branch}: {formatNumber(row.placed_students)} of {formatNumber(row.total_students)} placed (
            {formatPercent(row.placement_percentage)})
        </div>
    );
}

function PlacementByBranchChart({ data }) {
    const rows = data || [];
    const summary = rows.map((r) => `${r.branch}: ${formatPercent(r.placement_percentage)}`).join(". ");

    return (
        <ChartCard
            title="Placement % by branch"
            isEmpty={rows.length === 0}
            summary={`Placement percentage by branch. ${summary}`}
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="branch"
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={48} />
                    <Tooltip content={<BranchTooltip />} />
                    <Bar dataKey="placement_percentage" name="Placement %" fill="#0e4c92" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
}

export default PlacementByBranchChart;