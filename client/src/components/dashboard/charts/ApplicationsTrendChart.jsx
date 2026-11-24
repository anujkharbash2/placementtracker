import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import ChartCard from "../ChartCard";
import { formatChartDate, formatChartDateFull, formatNumber } from "../../../utils/format";

function ApplicationsTrendChart({ data }) {
    const rows = data || [];
    const isEmpty = rows.length === 0 || rows.every((r) => !r.count);

    return (
        <ChartCard
            title="Applications, last 30 days"
            isEmpty={isEmpty}
            summary="Line chart of applications received per day over the last 30 days."
        >
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={formatChartDate} minTickGap={28} tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} width={40} />
                    <Tooltip
                        labelFormatter={formatChartDateFull}
                        formatter={(value) => [formatNumber(value), "Applications"]}
                    />
                    <Line
                        type="linear"
                        dataKey="count"
                        name="Applications"
                        stroke="#0e4c92"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </ChartCard>
    );
}

export default ApplicationsTrendChart;