export const DEGREE_OPTIONS = [
    { value: "B.Tech", label: "B.Tech" },
    { value: "Dual B.Tech-M.Tech", label: "Dual B.Tech - M.Tech" },
    { value: "M.Tech", label: "M.Tech" },
    { value: "Integrated M.Tech", label: "Integrated M.Tech" },
    { value: "Integrated BS-MS", label: "Integrated BS - MS (Interdisciplinary Sciences)" },
    { value: "Integrated BBA-MBA", label: "Integrated BBA - MBA" },
    { value: "BA LLB", label: "BA LLB" },
    { value: "BBA LLB", label: "BBA LLB" },
    { value: "BA (Honours)", label: "BA (Honours) in Media, Arts & Design" },
    { value: "MSc", label: "MSc" },
    { value: "MA", label: "MA" },
    { value: "MBA", label: "MBA" },
    { value: "MCA", label: "MCA" },
    { value: "LLM", label: "LLM (Master of Laws)" },
    { value: "MS", label: "MS" },
];

// Maps each degree to its available branches/specializations.
// A degree missing from this object has no branch choice — the field is hidden for it.
export const BRANCH_OPTIONS_BY_DEGREE = {
    "B.Tech": [
        { value: "Computer Science & Engineering", label: "Computer Science & Engineering" },
        { value: "Mathematics & Computing", label: "Mathematics & Computing" },
    ],
    "Dual B.Tech-M.Tech": [
        { value: "Computer Science & Engineering", label: "Computer Science & Engineering" },
    ],
    "M.Tech": [
        { value: "Computer Science & Engineering", label: "Computer Science & Engineering" },
    ],
    "Integrated M.Tech": [
        { value: "Computer Science & Engineering", label: "Computer Science & Engineering" },
    ],
    "MSc": [
        { value: "Applied Mathematics", label: "Applied Mathematics" },
        { value: "Biotechnology", label: "Biotechnology" },
        { value: "Computer Science", label: "Computer Science" },
    ],
    "MA": [
        { value: "Economics", label: "Economics" },
        { value: "International Relations", label: "International Relations" },
        { value: "Sociology", label: "Sociology" },
        { value: "Journalism and Digital Media", label: "Journalism and Digital Media" },
        { value: "Communication for Sustainable Development", label: "Communication for Sustainable Development" },
    ],
    "MS": [
        { value: "Climate Change and Sustainability", label: "Climate Change and Sustainability" },
        { value: "Business Analytics", label: "Business Analytics" },
    ],
    "Integrated BS-MS": [
        { value: "Interdisciplinary Sciences", label: "Interdisciplinary Sciences" },
    ],
};

// Flattened, de-duplicated list of every branch across all degrees —
// useful for CreateDriveForm, where a recruiter can select branches
// without first picking one specific degree.
export const ALL_BRANCH_OPTIONS = Array.from(
    new Map(
        Object.values(BRANCH_OPTIONS_BY_DEGREE)
            .flat()
            .map((branch) => [branch.value, branch])
    ).values()
);