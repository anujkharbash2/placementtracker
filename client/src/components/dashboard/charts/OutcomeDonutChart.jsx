import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import ChartCard from "../ChartCard";
import { getOutcomeMeta } from "../../../constants/outcomes";
import { formatNumber } from "../../../utils/format";

function OutcomeDonutChart({ data }) {
    const rows = (data || []).map((r) => {
        const meta = getOutcomeMeta(r.outcome);
        return { name: meta.label, value: r.count, color: meta.color };
    });
    const isEmpty = rows.length === 0 || rows.every((r) => !r.value);
    const summary = rows.map((r) => `${r.name}: ${formatNumber(r.value)}`).join(". ");

    return (
        <ChartCard title="Outcome breakdown" isEmpty={isEmpty} summary={`Application outcomes. ${summary}`}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={rows}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="55%"
                        outerRadius="80%"
                        paddingAngle={2}
                        stroke="#ffffff"
                    >
                        {rows.map((r) => (
                            <Cell key={r.name} fill={r.color} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [formatNumber(value), name]} />
                    <Legend formatter={(value, entry) => `${value}: ${formatNumber(entry.payload.value)}`} />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>
    );
}

export default OutcomeDonutChart;