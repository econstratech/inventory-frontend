import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Axios } from "../../environment/AxiosInstance";
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import { UserAuth } from "./Auth";

function AuthenticateUser() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthUser } = UserAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingUser, setIsFetchingUser] = useState(false);
  const [userFetchError, setUserFetchError] = useState("");
  const [erpUserData, setErpUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const hasToken = token.trim().length > 0;
  const erpBaseUrl = process.env.REACT_APP_BMS_ERP_API_URL || "";

  useEffect(() => {
    const fetchUserFromErp = async () => {
      setIsLoading(true);
      if (!hasToken || !erpBaseUrl) return;

      // Check if third party token is already in local storage, redirect to welcome page
      const thirdPartyToken = localStorage.getItem("third_party_token");
      const systemAuth = localStorage.getItem("auth_user");
      // const systemAuthData = systemAuth ? JSON.parse(systemAuth) : null;
      if (thirdPartyToken && systemAuth && thirdPartyToken === token) {
        navigate("/welcome");
        return;
      }

      setIsFetchingUser(true);
      setUserFetchError("");
      try {
        const normalizedBase = erpBaseUrl.replace(/\/+$/, "");

        const response = await axios.get(`${normalizedBase}/user/get-bms-user-permission-list`, {
          headers: {
            authentication: token,
          },
        });
        setErpUserData(response.data?.data || response.data || null);
        // Save third party token in local storage, to prevent multiple requests
        // localStorage.setItem("third_party_token", token);
        setIsLoading(false);
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to fetch user details from ERP.";
        setUserFetchError(message);
      } finally {
        setIsFetchingUser(false);
        setIsLoading(false);
      }
    };

    fetchUserFromErp();
  }, [hasToken, token, erpBaseUrl]);

  const handleAllow = async () => {
    if (!hasToken || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        service_name: "BMS Task Management Login",
        service_method: "POST",
        service_url: `${erpBaseUrl}user/validate-third-party-user`,
        token_hash: token,
      }
      const res = await Axios.post("/user/validate-third-party-user", payload);
      if (res.status === 200 && res.data.status) {
        const authData = {
          token: res.data.data.tokenData,
          user: res.data.data.user,
          permissions: res.data.data.permissions,
        }
        setAuthUser(authData);
        localStorage.setItem("third_party_token", token);
        SuccessMessage(res.data.message);
        navigate("/welcome");
      } else {
        // ErrorMessage("You're not authorized to access this system.");
        setUserFetchError("Sorry, You're not authorized to access this system.");
        navigate("/login");
      }
    } catch (err) {
      if (err?.response?.data?.message) {
        setUserFetchError("Sorry, You're not authorized to access this system.");
      } else {
        setUserFetchError("Token validation failed. Please try again.");
      }

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <React.Fragment>
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4 p-md-5">
              <h4 className="mb-3">Login Authorization</h4>
              <p className="text-muted mb-4">
                <strong>Growthh Inventory Management System</strong> is requesting access to your account. Click
                <strong> Allow</strong> to validate and continue.
              </p>

              {!hasToken && (
                <div className="alert alert-danger mb-4">
                  Invalid authentication link. Token is missing.
                </div>
              )}
              {hasToken && !erpBaseUrl && (
                <div className="alert alert-danger mb-4">
                  ERP API URL is missing. Please set
                  <strong> REACT_APP_BMS_ERP_API_URL</strong> in environment.
                </div>
              )}

              {isFetchingUser && (
                <div className="alert alert-info mb-4">Fetching user details...</div>
              )}
              {userFetchError && (
                <div className="alert alert-danger mb-4">{userFetchError}</div>
              )}
              {erpUserData && !userFetchError && (
                <div className="alert alert-success mb-4">
                  User details fetched successfully.
                </div>
              )}

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAllow}
                disabled={!hasToken || !erpBaseUrl || isSubmitting || !erpUserData}
              >
                {isSubmitting ? "Validating..." : "Allow"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </React.Fragment>
  );
}

export default AuthenticateUser;
