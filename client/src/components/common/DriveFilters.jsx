import { useState, useEffect } from "react";
import Input from "./Input";
import Select from "./Select";
import Button from "./Button";
import styles from "./DriveFilters.module.css";

const STATUS_OPTIONS = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
];

const TIMELINE_OPTIONS = [
    { value: "current", label: "Current" },
    { value: "past", label: "Past" },
];

const TYPE_OPTIONS = [
    { value: "job", label: "Job" },
    { value: "internship", label: "Internship" },
];

function DriveFilters({ filters, onChange, onClear, companies }) {
    const [searchText, setSearchText] = useState(filters.search);

    // Wait for a pause in typing before hitting the server
    useEffect(() => {
        if (searchText.trim() === filters.search) return;
        const timer = setTimeout(() => onChange({ search: searchText.trim() }), 400);
        return () => clearTimeout(timer);
    }, [searchText]); // eslint-disable-line react-hooks/exhaustive-deps

    function handleClear() {
        setSearchText("");
        onClear();
    }

    return (
        <div className={styles.bar}>
            <Input
                label="Search title"
                id="filterSearch"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
            />

            <Select
                label="Status"
                id="filterStatus"
                value={filters.status}
                onChange={(e) => onChange({ status: e.target.value })}
                placeholder="All statuses"
                options={STATUS_OPTIONS}
            />

            <Select
                label="Timeline"
                id="filterTimeline"
                value={filters.timeline}
                onChange={(e) => onChange({ timeline: e.target.value })}
                placeholder="All dates"
                options={TIMELINE_OPTIONS}
            />

            <Select
                label="Type"
                id="filterType"
                value={filters.type}
                onChange={(e) => onChange({ type: e.target.value })}
                placeholder="All types"
                options={TYPE_OPTIONS}
            />

            {companies && companies.length > 0 && (
                <Select
                    label="Company"
                    id="filterCompany"
                    value={filters.company_id}
                    onChange={(e) => onChange({ company_id: e.target.value })}
                    placeholder="All companies"
                    options={companies.map((c) => ({ value: c.id, label: c.name }))}
                />
            )}

            <div className={styles.clear}>
                <Button type="button" variant="outline" onClick={handleClear}>
                    Clear filters
                </Button>
            </div>
        </div>
    );
}

export default DriveFilters;