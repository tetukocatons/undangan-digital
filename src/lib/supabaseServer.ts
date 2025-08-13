import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export const serverClient = () => createServerComponentClient({ cookies });
export const routeClient  = () => createRouteHandlerClient({ cookies });
