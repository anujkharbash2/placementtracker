import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";

export function useResumes() {
    const { token } = useAuth();
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const refresh = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/resumes`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Could not load your resumes.");
                return;
            }

            setError("");
            setResumes(data.data || data.resumes || []);
        } catch (err) {
            setError("Could not reach the server.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) refresh();
    }, [token, refresh]);

    // Returns { resume, error }
    const upload = useCallback(
        async (file) => {
            const formData = new FormData();
            formData.append("resume", file);

            try {
                // No Content-Type header: the browser sets it, boundary included
                const response = await fetch(`${API_BASE_URL}/api/resumes`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });
                const data = await response.json();

                if (!response.ok) {
                    return { resume: null, error: data.message || "Could not upload the resume." };
                }

                await refresh();
                return { resume: data.data, error: "" };
            } catch (err) {
                return { resume: null, error: "Could not reach the server." };
            }
        },
        [token, refresh]
    );

    // Returns "" on success, or an error message
    const remove = useCallback(
        async (id) => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/resumes/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();

                if (!response.ok) return data.message || "Could not delete the resume.";

                setResumes((prev) => prev.filter((r) => r.id !== id));
                return "";
            } catch (err) {
                return "Could not reach the server.";
            }
        },
        [token]
    );

    return { resumes, loading, error, refresh, upload, remove };
}