import React, { createContext, useContext, useEffect, useState } from 'react'
import { PrivateAxios } from '../../environment/AxiosInstance';
import { logoutAndRedirect } from "../../utils/logout";


export const AuthContext = createContext();

// Build the flat userDetails shape that consumers across the app expect.
// Historically this was jwtDecode(token); now we derive the same fields
// from the /user/me payload so existing call sites keep working.
const buildUserDetails = (user) => {
    if (!user) return {};
    const settings = user.company?.generalSettings || {};
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        company_id: user.company_id,
        timezone: settings.timezone,
        currency_symbol: settings.symbol,
        currency_name: settings.currency_name,
        currency_code: settings.currency_code,
        is_variant_based: settings.is_variant_based === 1,
        min_purchase_amount: settings.min_purchase_amount,
        min_sale_amount: settings.min_sale_amount,
        position: user.position,
        is_production_planning: settings.is_production_planning,
        production_without_bom: settings.production_without_bom,
        has_master_pack: settings.has_master_pack,
    };
};

export const AuthProvider = ({ children }) => {
    // 'checking' until the initial /user/me round-trip resolves; protected
    // routes must wait on this before redirecting to /login, otherwise a
    // hard refresh on an authed page flashes the login screen.
    const [authStatus, setAuthStatus] = useState('checking');
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('auth_user')) || null; } catch { return null; }
    });
    const [userDetails, setUserDetails] = useState({});
    const [userPermissions, setUserPermissions] = useState(() => {
        try { return JSON.parse(localStorage.getItem('permissions')) || []; } catch { return []; }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isVariantBased, setIsVariantBased] = useState(false);
    const [getGeneralSettingssymbol, setGeneralSettingssymbol] = useState(false);

    // Called by Login.js + AuthenticateUser.js after a successful auth response.
    // The backend has already set the HttpOnly cookie; we just hydrate React state.
    const setAuthUser = (authData) => {
        localStorage.setItem('auth_user', JSON.stringify(authData.user));
        localStorage.setItem('permissions', JSON.stringify(authData.permissions || []));
        setUser(authData.user);
        setUserPermissions(authData.permissions || []);
        setUserDetails(buildUserDetails(authData.user));
        setAuthStatus('authed');
    };

    const MatchPermission = (permission) => {
        if (user?.position === "Owner") {
            return true;
        }
        if (userPermissions.length > 0) {
            return permission.some(p => userPermissions.includes(p));
        }
        return false;
    };

    const Logout = async () => {
        // MUST await: logoutAndRedirect() triggers a full page reload, which
        // cancels in-flight requests. If the cookie-clearing POST hasn't been
        // processed by the server yet, the next /user/me on app reload still
        // succeeds and the user is bounced back to /welcome.
        try {
            await PrivateAxios.post('user/logout');
        } catch (_err) {
            // Best-effort: even if the server call fails, clear local state
            // and force a redirect. The user can re-login from there.
        }
        setUser(null);
        setUserPermissions([]);
        setUserDetails({});
        setAuthStatus('anon');
        logoutAndRedirect();
    };

    // Bootstrap: ask the server who we are. If the cookie is valid we get back
    // user+permissions; if not, we land in 'anon' and protected routes will
    // redirect to /login.
    useEffect(() => {
        let cancelled = false;
        PrivateAxios.get('user/me')
            .then((res) => {
                if (cancelled) return;
                const me = res.data;
                setUser(me.user);
                setUserPermissions(me.permissions || []);
                setUserDetails(buildUserDetails(me.user));
                localStorage.setItem('auth_user', JSON.stringify(me.user));
                localStorage.setItem('permissions', JSON.stringify(me.permissions || []));
                setAuthStatus('authed');
            })
            .catch(() => {
                if (cancelled) return;
                localStorage.removeItem('auth_user');
                localStorage.removeItem('permissions');
                setUser(null);
                setUserPermissions([]);
                setUserDetails({});
                setAuthStatus('anon');
            });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (user) {
            setIsVariantBased(user.company?.generalSettings?.is_variant_based === 1);
            setGeneralSettingssymbol(user?.company?.generalSettings?.symbol);
        }
    }, [user]);

    const isLoggedIn = authStatus === 'authed';

    return <AuthContext.Provider value={{
        user,
        isVariantBased,
        setAuthUser,
        MatchPermission,
        userDetails,
        getGeneralSettingssymbol,
        isLoading,
        setIsLoading,
        Logout,
        isLoggedIn,
        authStatus,
    }}>
        {children}
    </AuthContext.Provider>
};

export const UserAuth = () => {
    const authContextValue = useContext(AuthContext);
    if (!authContextValue) {
        throw new Error("useAuth used outside of the provider");
    }
    return authContextValue;
};
