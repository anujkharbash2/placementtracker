// Call this before acting on any application with outcome 'offer'.
// If its deadline has passed, flips it to 'offer_expired' and returns true.
async function expireIfPastDeadline(client, application) {
  if (application.outcome === 'offer' && application.offer_expires_at &&
      new Date(application.offer_expires_at) < new Date()) {
    await client.query(
      `UPDATE applications SET outcome = 'offer_expired', updated_at = NOW() WHERE id = $1`,
      [application.id]
    );
    await client.query(
      `INSERT INTO status_history (application_id, status, changed_by) VALUES ($1, 'Offer expired — deadline passed, not accepted', NULL)`,
      [application.id]
    );
    return true;
  }
  return false;
}

module.exports = { expireIfPastDeadline };