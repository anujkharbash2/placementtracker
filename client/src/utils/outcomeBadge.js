export function getOutcomeBadge(application) {
    switch (application.outcome) {
        case "offer":
            return { status: "offer", label: "Offer" };
        case "offer_accepted":
            return { status: "offerAccepted", label: "Offer Accepted" };
        case "offer_declined":
            return { status: "offerDeclined", label: "Offer Declined" };
        case "offer_expired":
            return { status: "closed", label: "Offer Expired" };
        case "withdrawn":
            return { status: "closed", label: "Withdrawn" };
        case "rejected":
            return { status: "rejected", label: "Rejected" };
        default:
            return { status: "inProgress", label: application.current_round_name };
    }
}