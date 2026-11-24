import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";

// Set to false once the endpoints are live
const USE_MOCK = false;

function buildQuery(params) {
    const search = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== false) {
            search.set(key, value);
        }
    });
    const text = search.toString();
    return text ? `?${text}` : "";
}

// path: "/api/dashboard/admin". params: query params. mockBuilder(params): returns the `data` object.
export function useDashboard(path, params, mockBuilder) {
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null); // { code, message }

    const latestRequest = useRef(0);
    const hasData = useRef(false);
    const mockRef = useRef(mockBuilder);
    const logoutRef = useRef(logout);
    const navigateRef = useRef(navigate);
    mockRef.current = mockBuilder;
    logoutRef.current = logout;
    navigateRef.current = navigate;

    const paramsKey = JSON.stringify(params || {});

    const load = useCallback(
        async ({ quiet = false } = {}) => {
            if (!token) return;

            // Only the newest request may update state, so fast toggling can't show stale data
            const requestId = ++latestRequest.current;
            const isCurrent = () => requestId === latestRequest.current;

            const fail = (code, message) => {
                // A failed background refresh keeps the last good data on screen
                if (quiet && hasData.current) return;
                hasData.current = false;
                setData(null);
                setError({ code, message });
            };

            if (hasData.current) {
                setRefreshing(true);
            } else {
                setLoading(true);
                setError(null);
            }

            try {
                const query = JSON.parse(paramsKey);

            

                const response = await fetch(`${API_BASE_URL}${path}${buildQuery(query)}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!isCurrent()) return;

                if (response.status === 401) {
                    logoutRef.current();
                    navigateRef.current("/login", { replace: true });
                    return;
                }
                if (response.status === 403) {
                    fail(403, "Access denied");
                    return;
                }

                const body = await response.json().catch(() => null);
                if (!isCurrent()) return;

                if (!response.ok || !body?.data) {
                    fail(response.status, body?.message || "Could not load the dashboard.");
                    return;
                }

                setData(body.data);
                hasData.current = true;
                setError(null);
            } catch (err) {
                if (isCurrent()) fail(0, "Could not reach the server.");
            } finally {
                if (isCurrent()) {
                    setLoading(false);
                    setRefreshing(false);
                }
            }
        },
        [token, path, paramsKey]
    );

    useEffect(() => {
        load();
        return () => {
            latestRequest.current += 1; // drop any in-flight response on unmount or param change
        };
    }, [load]);

    return {
        data,
        loading,
        refreshing,
        error,
        refresh: () => load(),
        reloadQuietly: () => load({ quiet: true }),
        mutate: setData,
    };
}