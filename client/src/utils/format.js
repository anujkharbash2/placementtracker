const IST = "Asia/Kolkata";
export const DASH = "—";

const isBlank = (v) => v === null || v === undefined || v === "";

function toDate(v) {
    if (isBlank(v)) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
}

export function formatText(v) {
    return isBlank(v) ? DASH : String(v);
}

export function formatNumber(v) {
    if (isBlank(v) || Number.isNaN(Number(v))) return DASH;
    return Number(v).toLocaleString("en-IN");
}

export function formatPercent(v) {
    if (isBlank(v) || Number.isNaN(Number(v))) return DASH;
    return `${Number(v).toFixed(1)}%`;
}

export function formatDateIST(v) {
    const d = toDate(v);
    if (!d) return DASH;
    return d.toLocaleDateString("en-IN", { timeZone: IST, day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTimeIST(v) {
    const d = toDate(v);
    if (!d) return DASH;
    return d.toLocaleString("en-IN", {
        timeZone: IST,
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

export function formatTimeIST(v) {
    const d = toDate(v);
    if (!d) return DASH;
    return d.toLocaleTimeString("en-IN", { timeZone: IST, hour: "numeric", minute: "2-digit", hour12: true });
}

// For chart axes: the API sends plain "YYYY-MM-DD" dates
export function formatChartDate(ymd) {
    if (isBlank(ymd)) return DASH;
    const d = new Date(`${ymd}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) return String(ymd);
    return d.toLocaleDateString("en-IN", { timeZone: "UTC", day: "numeric", month: "short" });
}

export function formatChartDateFull(ymd) {
    if (isBlank(ymd)) return DASH;
    const d = new Date(`${ymd}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) return String(ymd);
    return d.toLocaleDateString("en-IN", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "always" });

// "2 hours ago", "in 3 days"
export function relativeTime(v) {
    const d = toDate(v);
    if (!d) return "";
    const diff = d.getTime() - Date.now();
    const abs = Math.abs(diff);
    if (abs < 60000) return "just now";
    if (abs < 3600000) return rtf.format(Math.round(diff / 60000), "minute");
    if (abs < 86400000) return rtf.format(Math.round(diff / 3600000), "hour");
    return rtf.format(Math.round(diff / 86400000), "day");
}

// For deadlines and expiries: "in 2 days" or "expired"
export function expiryHint(v) {
    const d = toDate(v);
    if (!d) return "";
    const diff = d.getTime() - Date.now();
    if (diff <= 0) return "expired";
    if (diff < 60000) return "in under a minute";
    return relativeTime(v);
}

export function isWithinHours(v, hours) {
    const d = toDate(v);
    if (!d) return false;
    const diff = d.getTime() - Date.now();
    return diff > 0 && diff <= hours * 3600000;
}