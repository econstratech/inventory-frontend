export const clearAuthStorage = () => {
  sessionStorage.removeItem("token");
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
