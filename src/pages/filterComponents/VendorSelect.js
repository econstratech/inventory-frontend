import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import { PrivateAxios } from "../../environment/AxiosInstance";

/**
 * Reusable vendor dropdown with server-side search (searchkey) and pagination.
 * Options are vendor rows: { id, vendor_name, email, address, mobile }.
 * @param {Object} props.value - Selected vendor object or { id } for display
 * @param {Function} props.onChange - (selectedVendor) => void
 * @param {string} props.placeholder
 * @param {string} props.error - Error message (shows red border)
 * @param {Function} props.onErrorClear
 * @param {Object} props.styles - Custom styles for react-select
 * @param {Object} props.otherProps - Additional props for react-select
 */
const VendorSelect = ({
  value,
  onChange,
  error = null,
  onErrorClear = null,
  placeholder = "Search and select vendor...",
  isClearable = true,
  isSearchable = true,
  isDisabled = false,
  styles = {},
  theme,
  ...otherProps
}) => {
  const [vendorOptions, setVendorOptions] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);

  const loadVendors = useCallback(async (page = 1, searchKey = "", append = false) => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (searchKey && String(searchKey).trim() !== "") {
        params.searchkey = String(searchKey).trim();
      }
      const response = await PrivateAxios.get("vendor", { params });
      const { rows = [], pagination: pag } = response.data?.data ?? {};
      setPagination(pag || null);
      setVendorOptions((prev) => (append ? [...prev, ...rows] : rows));
    } catch (err) {
      console.error("Error fetching vendors:", err);
      if (!append) setVendorOptions([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasInitialLoaded) {
      loadVendors(1, "", false);
      setHasInitialLoaded(true);
    }
  }, [hasInitialLoaded, loadVendors]);

  useEffect(() => {
    if (!hasInitialLoaded) return;
    const timeoutId = setTimeout(() => {
      loadVendors(1, searchInput, false);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchInput, hasInitialLoaded, loadVendors]);

  const handleMenuScrollToBottom = () => {
    if (loading || !pagination?.has_next_page) return;
    loadVendors(pagination.next_page, searchInput, true);
  };

  const handleChange = (selectedOption) => {
    if (onChange) onChange(selectedOption);
    if (onErrorClear && error) onErrorClear();
  };

  const normalizedValue = React.useMemo(() => {
    if (!value) return null;
    const id = value?.id ?? value?.value;
    if (id == null) return value;
    const found = vendorOptions.find((opt) => opt.id === id);
    if (found) return found;
    return value;
  }, [value, vendorOptions]);

  const defaultStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "38px",
      borderColor: error ? "#ff4d4f" : base.borderColor,
      ...(styles.control ? styles.control(base, state) : {}),
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      ...(styles.menu ? styles.menu(base) : {}),
    }),
    ...styles,
  };

  const defaultTheme = (t) => ({
    ...t,
    colors: {
      ...t.colors,
      primary25: "#ddddff",
      primary: "#6161ff",
    },
  });

  return (
    <Select
      placeholder={placeholder}
      value={normalizedValue}
      onChange={handleChange}
      onInputChange={(inputValue) => setSearchInput(inputValue)}
      options={vendorOptions}
      getOptionLabel={(option) => option.vendor_name ?? ""}
      getOptionValue={(option) => option.id}
      isLoading={loading}
      onMenuScrollToBottom={handleMenuScrollToBottom}
      filterOption={() => true}
      noOptionsMessage={({ inputValue }) =>
        inputValue
          ? `No vendors found for "${inputValue}"`
          : "Type to search vendors..."
      }
      isClearable={isClearable}
      isSearchable={isSearchable}
      isDisabled={isDisabled}
      styles={defaultStyles}
      theme={theme || defaultTheme}
      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
      menuPosition="fixed"
      {...otherProps}
    />
  );
};

export default VendorSelect;
