import { useSession, signIn, signOut } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getEmbed, tabSignOut } from "libs";

// implements custom hooks with tanstack query for asynchronous state management
// concepts described here: https://tkdodo.eu/blog/react-query-as-a-state-manager
// more on query key structure: https://tkdodo.eu/blog/effective-react-query-keys#structure
// more on dependent queries: https://tanstack.com/query/v5/docs/framework/react/guides/dependent-queries
// more on retries (default 3): https://tanstack.com/query/v5/docs/framework/react/guides/query-retries
// secures UI components via these methods: https://next-auth.js.org/getting-started/client#require-session

export const useTableauSession = (userName, secureData) => {
  const queryClient = useQueryClient();
  
  
  // set to an empty array if enumerated function parameters are not available in array
  const queryKey = [userName].every(param => param != null) ? ["tableau", "embed", userName] : [];

  const { status: session_status, data: session_data } = useSession({
    required: true, // only 2 states: loading and authenticated https://next-auth.js.org/getting-started/client#require-session
    async onUnauthenticated() {
      // The user is not authenticated, handle it here.
      const { error, status, ok } = await signIn('demo-user', { redirect: false, ID: userName, ...secureData });
    }
  });

    // Check if the current session username matches the provided username
    const usernameMismatch = session_data?.userName && session_data.userName !== userName
    || session_data?.tableauUrl !== secureData?.tableauUrl
    || session_data?.siteName !== secureData?.siteName
    || session_data?.caClientId !== secureData?.caClientId
    || session_data?.caSecretId !== secureData?.caSecretId
    || session_data?.caSecretValue !== secureData?.caSecretValue;

    console.log(`usernameMismatch: ${usernameMismatch}`);
  // If there's a mismatch, force re-authentication
  if (usernameMismatch) {
    (async ()=>{
      await signOut({redirect:false});
      await tabSignOut(session_data.tableauUrl);  
      await signIn('demo-user', { redirect: false, ID: userName, ...secureData });
      queryClient.invalidateQueries(queryKey); // Invalidate the query cache
    });
  }

  // controls dependent query
  const signedIn = session_status === 'authenticated';



  // tanstack query hook
  return useQuery({
    queryKey: queryKey,
    queryFn: () => {
      return getEmbed(session_data.user.email);
    },
    enabled: signedIn,
    cacheTime: Infinity, // caches embed token without garbage collection, refresh via auth error handler
  });
}
