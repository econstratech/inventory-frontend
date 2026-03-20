import React, { createContext, useContext, useEffect, useState } from 'react'
import { jwtDecode } from "jwt-decode";
// import { GeneralSettings} from '../../environment/GlobalApi';
// import { PrivateAxios } from '../../environment/AxiosInstance';
import { logoutAndRedirect } from "../../utils/logout";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(sessionStorage.getItem("token") || '');
    const [userDetails, setUserDetails] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [isVariantBased, setIsVariantBased] = useState(false);

    // const [getCustomer, setCustomer] = useState([]);
    // const [getUomData , setUomData] = useState([]);
    // const [productData, setProduct] = useState([]);
    const [getGeneralSettingssymbol, setGeneralSettingssymbol] = useState(false);
    // const [getGeneralSettingsDAddress, setGeneralSettingsDAddress] = useState(false);
    // const [getGeneralSettingsCAddress, setGeneralSettingsCAddress] = useState(false);
    // const [getGeneralSettingsSignature, setGeneralSettingsSignature] = useState(false);
    // const [getGeneralSettingsBatch, setGeneralSettingsBatch] = useState(false);
    // const [category, setCategory] = useState([]);
    // const [mode, setMode] = useState([]);
    // const [status, setStatus] = useState([]);
    // const [holidayList, setHolidayList] = useState([]); 
    // const [companysettings, setCompanysettings] = useState([]);
    // const [officeTimeList, setOfficeTimeList] = useState([]);
    const [userPermissions, setUserPermissions] = useState([]);
    //Login Store in localstorage
    const setAuthUser = (authData) => {
        // console.log("After login", authData);
        sessionStorage.setItem("token", authData.token);
        localStorage.setItem('auth_user', JSON.stringify(authData.user));
        localStorage.setItem('permissions', JSON.stringify(authData.permissions));
        setToken(authData.token);
        setUser(authData.user);
    };
    const MatchPermission = (permission) => {

        // check if user is owner, then allow all permissions
        if (user.position === "Owner") {
            return true;
        }
       
        if (userPermissions.length > 0) {
            const hasPermission = permission.some(permission =>
                userPermissions.includes(permission)
            );
            return hasPermission;
        } else {
            return false;
        }
    }
    //Logout from Dashboard
    const Logout = () => {
        setToken(""); // Clear token state
        setUser(null);
        logoutAndRedirect();
    }
    const getPermission = () => {
        const permissions = JSON.parse(localStorage.getItem('permissions')) || [];
        setUserPermissions(permissions);
    }

    // const OfficeTiming = async () => {
    //     PrivateAxios.get("office-time")
    //         .then((res) => {
    //             setOfficeTimeList(JSON.parse(res.data.data.working_days));
    //         }).catch((err) => {
    //             if (err.response.status == 401) {
    //                 Logout();
    //             }
    //         })
    // }   

    // const customer = async () => {
    //     PrivateAxios.get("customer/all-customers")
    //         .then((res) => {
    //             if(res.data.data){
    //                 setCustomer(res.data.data.rows);
    //             }
    //         }).catch((err) => {
    //             if (err.response.status == 401) {
    //                 Logout();
    //             }
    //         })
    // }
    // const productdata = async () => {
    //     PrivateAxios.get("product/list")
    //         .then((res) => {
    //             setProduct(res.data.data);
    //         }).catch((err) => {
    //             if (err.response.status == 401) {
    //                 Logout();
    //             }
    //         })
    // }
    
    useEffect(() => {
        // const fetchGeneralSettings = async () => {
        // try {
        //     const result = await GeneralSettings();

        //     //check if data is not null
        //     if (result.data) {
        //         setCompanysettings(result.data);
        //     }
        //     setGeneralSettingssymbol(result.data.currency ? result.data.currency.symbol : '');
        //     setGeneralSettingsDAddress(result.data && result.data.deliveryAddress);
        //     setGeneralSettingsCAddress(result.data && result.data.companyAddress);
        //     setGeneralSettingsSignature(result.data && result.data.signature);
        //     setGeneralSettingsBatch(result.data && result.data.enableBatchNumber);

        // } catch (error) {
        //     console.error("Error fetching general settings:", error);
        //     // Optionally, set an error state or show an error message
        // }
        // };
        // const AllCategories= async () => {
        //     try {
        //         const response = await PrivateAxios.get("product-category")
        //         setCategory(response.data.data);
        
        //     } catch (error) {
        //         if (error.response.status == 401) {
        //             Logout();
        //         }
        //     }
        // }
       
        // const uomdata = () => {
        //     PrivateAxios.get('/master/uom/list')
        //         .then((res) => {
        //             const responseData = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        //             setUomData(responseData);
        //         })
        //         .catch((err) => {
        //             console.error(err);
        //         });
        // };
        if (token) {
            getPermission();
            setUserDetails(jwtDecode(token));
            setUser(JSON.parse(localStorage.getItem("auth_user")) || null);

            // OfficeTiming();
            // productdata();
            // customer();
            // fetchGeneralSettings();
            // AllCategories();
            // uomdata();
        }
    }, [token])

    // Check if the company is variant based
    useEffect(() => {
        if (user) {
            setIsVariantBased(user.company.generalSettings.is_variant_based === 1);
            setGeneralSettingssymbol(user?.company?.generalSettings?.symbol);
        }
    }, [user])


    let isLoggedIn = !!token; //return true false

    return <AuthContext.Provider value={{ 
        user,
        isVariantBased,
        setAuthUser, 
        MatchPermission, 
        token,
        // getCustomer, 
        userDetails,
        getGeneralSettingssymbol, 
        // getGeneralSettingsBatch, 
        // getGeneralSettingsDAddress,
        // getGeneralSettingsCAddress,
        // getGeneralSettingsSignature, 
        isLoading, 
        setIsLoading, 
        // productData, 
        // holidayList, 
        // officeTimeList, 
        Logout, 
        isLoggedIn, 
        // mode, 
        // status,
        // category, 
        // getUomData, 
        // companysettings,
        }}>
        {children}
    </AuthContext.Provider>
}

export const UserAuth = () => {
    const authContextValue = useContext(AuthContext);
    if (!authContextValue) {
        throw new Error("useAuth used outside of the provider")
    }
    return authContextValue;
}