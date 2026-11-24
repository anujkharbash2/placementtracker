import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";

export function usePlacementStatus() {
    const { token } = useAuth();
    const [isPlaced, setIsPlaced] = useState(false);

    useEffect(() => {
        if (!token) return;
        let cancelled = false;

        async function load() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/students/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) return;
                const data = await response.json();
                if (!cancelled) setIsPlaced(data.profile?.placement_status === "placed");
            } catch (err) {
                // Non-critical — the server enforces this regardless
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [token]);

    return isPlaced;
}