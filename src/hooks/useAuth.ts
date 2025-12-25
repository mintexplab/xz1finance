import { useAuth0 } from "@auth0/auth0-react";

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const signOut = async () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const signIn = async () => {
    await loginWithRedirect();
  };

  return {
    user: isAuthenticated ? user : null,
    session: isAuthenticated ? { user } : null,
    loading: isLoading,
    signOut,
    signIn,
    getAccessToken: getAccessTokenSilently,
    isAuthenticated,
  };
}
