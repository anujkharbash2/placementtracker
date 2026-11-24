import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";

// Rounds can't change once a drive has applications, so caching per drive_id
// for the session is safe and avoids re-fetching the same list repeatedly.
const cache = new Map();

export function useDriveRounds(driveId) {
    const { token } = useAuth();
    const [rounds, setRounds] = useState(() => cache.get(driveId) || []);
    const [loading, setLoading] = useState(!cache.has(driveId));
    const [error, setError] = useState("");

    useEffect(() => {
        if (!driveId || !token) return;

        if (cache.has(driveId)) {
            setRounds(cache.get(driveId));
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError("");

        async function load() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/drives/${driveId}/rounds`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();

                if (!response.ok) {
                    if (!cancelled) setError(data.message || "Could not load rounds.");
                    return;
                }

                const list = data.data || [];
                cache.set(driveId, list);
                if (!cancelled) setRounds(list);
            } catch (err) {
                if (!cancelled) setError("Could not reach the server.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [driveId, token]);

    return { rounds, loading, error };
}