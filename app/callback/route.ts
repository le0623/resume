import { handleAuth } from '@workos-inc/authkit-nextjs';

// Redirect the user to `/` after successful sign in
// The redirect can be customized: `handleAuth({ returnPathname: '/foo' })`
export const GET = handleAuth({ baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:25925' });
