import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";

export const EMPTY_FILTERS = {
    status: "",
    timeline: "",
    type: "",
    company_id: "",
    search: "",
};

export function usePaginatedDrives(path, filters, page, limit, refreshKey = 0) {
    const { token } = useAuth();
    const [drives, setDrives] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) return;
        const controller = new AbortController();

        async function load() {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== "" && value !== null && value !== undefined) {
                    params.set(key, value);
                }
            });
            params.set("page", page);
            params.set("limit", limit);

            try {
                const response = await fetch(`${API_BASE_URL}${path}?${params}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal,
                });
                const data = await response.json();

                if (!response.ok) {
                    setError(data.message || "Could not load drives.");
                    setDrives([]);
                    return;
                }

                setDrives(data.data || []);
                setTotal(data.total ?? 0);
                setTotalPages(Math.max(1, data.totalPages ?? 1));
            } catch (err) {
                if (err.name === "AbortError") return;
                setError("Could not reach the server.");
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        load();
        return () => controller.abort();
    }, [token, path, filters, page, limit, refreshKey]);

    return { drives, total, totalPages, loading, error };
}