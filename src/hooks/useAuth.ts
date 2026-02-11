import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

const ALLOWED_EMAIL = "malith@xz1.ca";

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const checkedRef = useRef(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !checkedRef.current) {
      checkedRef.current = true;
      if (user.email !== ALLOWED_EMAIL) {
        toast.error("Unauthorized: access restricted to malith@xz1.ca");
        logout({ logoutParams: { returnTo: window.location.origin } });
      }
    }
    if (!isAuthenticated) {
      checkedRef.current = false;
    }
  }, [isLoading, isAuthenticated, user, logout]);

  const isAuthorized = isAuthenticated && user?.email === ALLOWED_EMAIL;

  const signOut = async () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const signIn = async () => {
    await loginWithRedirect();
  };

  return {
    user: isAuthorized ? user : null,
    session: isAuthorized ? { user } : null,
    loading: isLoading,
    signOut,
    signIn,
    getAccessToken: getAccessTokenSilently,
    isAuthenticated: isAuthorized,
  };
}
