// Deadlines are date/times treated as IST, so compare exact moments
export function isDeadlinePassed(deadline) {
    if (!deadline) return false;
    const d = new Date(deadline);
    if (Number.isNaN(d.getTime())) return false;
    return d.getTime() < Date.now();
}

// Prefer the server's flag when a row has one
export function isDriveClosed(drive) {
    if (typeof drive.deadline_passed === "boolean") return drive.deadline_passed;
    return isDeadlinePassed(drive.application_deadline);
}

export function formatDateTime(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return (
        d.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }) + " IST"
    );
}
export function formatCountdown(expiresAt) {
    if (!expiresAt) return "";
    const target = new Date(expiresAt);
    if (Number.isNaN(target.getTime())) return "";
    return `Respond by ${target.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    })} IST`;
}

export function isOfferExpired(expiresAt) {
    if (!expiresAt) return false;
    const target = new Date(expiresAt);
    if (Number.isNaN(target.getTime())) return false;
    return Date.now() > target.getTime();
}

export const formatDeadline = formatDateTime;