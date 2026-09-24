// Set VITE_CONTENT_MODE=api at build time to reconnect the administration backend.
export const staticContentMode = import.meta.env.VITE_CONTENT_MODE !== 'api'
