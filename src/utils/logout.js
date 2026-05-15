// The auth cookie is HttpOnly and cleared by POST /user/logout (fired from
// the AuthProvider). All we do here is wipe the local UI hydration mirror
// (auth_user / permissions in localStorage) and bounce to the entry page.
export const clearAuthStorage = () => {
  localStorage.removeItem("auth_user");
  localStorage.removeItem("permissions");
  localStorage.removeItem("third_party_token");
};

export const logoutAndRedirect = (navigate, redirectPath = "/") => {
  clearAuthStorage();

  if (typeof navigate === "function") {
    navigate(redirectPath, { replace: true });
    return;
  }

  if (typeof window !== "undefined") {
    window.location.assign(redirectPath);
  }
};
