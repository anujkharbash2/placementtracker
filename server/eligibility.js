function checkEligibility(s, d) {
  const reasons = [];
  const incomplete = s.cgpa === null || !s.branch || !s.degree || s.passing_year === null;
  if (incomplete) return ['Complete your profile first'];

  const lower = (arr) => arr.map((x) => String(x).toLowerCase());

  if (d.min_cgpa !== null && Number(s.cgpa) < Number(d.min_cgpa))
    reasons.push(`Minimum CGPA ${d.min_cgpa} required`);
  if (d.max_backlogs !== null && s.active_backlogs > d.max_backlogs)
    reasons.push(`Active backlogs must be ${d.max_backlogs} or fewer`);
  if (d.allowed_branches && !lower(d.allowed_branches).includes(s.branch.toLowerCase()))
    reasons.push('Your branch is not eligible');
  if (d.allowed_degrees && !lower(d.allowed_degrees).includes(s.degree.toLowerCase()))
    reasons.push('Your degree is not eligible');
  if (d.eligible_passing_years && !d.eligible_passing_years.includes(s.passing_year))
    reasons.push('Your passing year is not eligible');

  return reasons;
}

module.exports = { checkEligibility };