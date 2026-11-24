// color: chart fill and badge tint. text: badge text (darker, so it stays readable).
export const OUTCOME_META = {
    in_progress: { label: "In progress", color: "#0e4c92", text: "#0e4c92" },
    offer: { label: "Offer extended", color: "#b8860b", text: "#8a6508" },
    offer_accepted: { label: "Offer accepted", color: "#2e7d32", text: "#2e7d32" },
    offer_declined: { label: "Offer declined", color: "#6b6b6b", text: "#555555" },
    offer_expired: { label: "Offer expired", color: "#9a9a9a", text: "#6f6f6f" },
    rejected: { label: "Rejected", color: "#b3261e", text: "#b3261e" },
    withdrawn: { label: "Withdrawn", color: "#b4b4b4", text: "#6f6f6f" },
};

export const OUTCOME_ORDER = Object.keys(OUTCOME_META);

export function getOutcomeMeta(outcome) {
    return OUTCOME_META[outcome] || { label: String(outcome), color: "#6b6b6b", text: "#555555" };
}