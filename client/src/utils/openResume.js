import { API_BASE_URL } from "../config";

// Returns "" on success, or an error message
export async function openResume(resumeId, token) {
    // Open the tab now, inside the click, so the browser doesn't block it
    const win = window.open("", "_blank");
    if (!win) {
        return "Your browser blocked the pop-up. Allow pop-ups for this site and try again.";
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}/file`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            let message = "Could not open the resume.";
            try {
                const data = await response.json();
                message = data.message || message;
            } catch (err) {
                // the response wasn't JSON
            }
            win.close();
            return message;
        }

        const blob = await response.blob();
        const pdf = new Blob([blob], { type: "application/pdf" });
        const url = URL.createObjectURL(pdf);
        win.location.href = url;
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        return "";
    } catch (err) {
        win.close();
        return "Could not reach the server.";
    }
}