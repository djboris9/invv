// Shared helpers for Invv hooks.
// Note: due to PocketBase's isolated handler contexts, this module must be
// loaded with require() inside each handler that uses it.

module.exports = {
  userFromAuth: (authRecord) => {
    if (!authRecord) return ""
    return authRecord.getString("email")
  },
};
