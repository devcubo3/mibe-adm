export { createClient } from './client';

// Backward-compatible singleton for service files
// createBrowserClient returns a singleton internally, so this is safe
import { createClient } from './client';
export const supabase = createClient();
