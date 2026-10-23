// Reads the (non-secret) payload of a login token to see if it's a demo session.
// The server is what actually enforces read-only access; this is only for the UI.
export const isDemoToken = (token) => {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(payload)).demo === true
  } catch {
    return false
  }
}

export const DEMO_MESSAGE = 'Demo mode is read-only. Changes are disabled.'
