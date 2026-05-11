import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import { PrivateAxios } from "../../environment/AxiosInstance";

const StoreSelect = ({
  value,
  onChange,
  error = null,
  onErrorClear = null,
  placeholder = "Select Store",
  isClearable = true,
  isSearchable = true,
  isDisabled = false,
  cwhfg = false,
  styles = {},
  ...otherProps
}) => {
  const [storeOptions, setStoreOptions] = useState([]);
  const [storeSearchInput, setStoreSearchInput] = useState("");
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);

  // Function to load stores from API with search
  const loadStores = useCallback(async (searchKey = "") => {
    setIsLoadingStores(true);
    try {
      const queryParams = new URLSearchParams({
        ...(searchKey && searchKey.trim() !== "" && { searchkey: searchKey.trim() }),
        ...(cwhfg && { cwhfg: "true" }),
      }).toString();

      const response = await PrivateAxios.get(`/warehouse?${queryParams}`);
      const storeData = response.data?.data;

      if (storeData && storeData.length > 0) {
        const options = storeData.map((item) => ({
          value: item.id,
          label: `${item.name || "N/A"} (${item.city || "N/A"})`,
          storeData: item, // Store full store data for later use
        }));
        
        setStoreOptions(options);
      } else {
        setStoreOptions([]);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      setStoreOptions([]);
    } finally {
      setIsLoadingStores(false);
      setHasInitialLoaded(true);
    }
  }, [cwhfg]);

  // Load stores on mount
  useEffect(() => {
    if (!hasInitialLoaded) {
      loadStores();
    }
  }, [hasInitialLoaded, loadStores]);

  // Debounced search handler
  useEffect(() => {
    if (!hasInitialLoaded) {
      return;
    }

    const timeoutId = setTimeout(() => {
      loadStores(storeSearchInput || "");
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [storeSearchInput, hasInitialLoaded, loadStores]);

  // Handle store selection change
  const handleChange = (selectedOption) => {
    if (onChange) {
      onChange(selectedOption);
    }
    
    // Clear error if error clear handler is provided
    if (onErrorClear && error) {
      onErrorClear();
    }
  };

  // Use option from storeOptions when possible so value reference is stable (avoids re-render loops)
  const normalizedValue = React.useMemo(() => {
    if (!value) return null;
    const id = typeof value === "object" && value !== null ? value.value : value;
    if (id != null) {
      const found = storeOptions.find((opt) => opt.value === id);
      if (found) return found;
    }
    return value;
  }, [value, storeOptions]);

  // Render the store name with FG/RM badges (matches the store-list card design).
  const formatOptionLabel = (option) => {
    const store = option?.storeData || {};
    const isFg = Number(store.is_fg_store) === 1;
    const isRm = Number(store.is_rm_store) === 1;
    return (
      <span className="d-inline-flex align-items-center flex-wrap" style={{ gap: 6 }}>
        <span>{option.label}</span>
        {isFg && <span className="badge bg-success">FG Store</span>}
        {isRm && <span className="badge bg-info">RM Store</span>}
      </span>
    );
  };

  // Default styles with error state support
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
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
      ...(styles.menuPortal ? styles.menuPortal(base) : {}),
    }),
    ...styles,
  };

  return (
    <Select
      placeholder={placeholder}
      value={normalizedValue}
      onChange={handleChange}
      onInputChange={(inputValue) => {
        setStoreSearchInput(inputValue);
      }}
      options={storeOptions}
      isLoading={isLoadingStores}
      isClearable={isClearable}
      isSearchable={isSearchable}
      isDisabled={isDisabled}
      formatOptionLabel={formatOptionLabel}
      filterOption={() => true} // Disable client-side filtering for server-side search
      noOptionsMessage={({ inputValue }) =>
        inputValue
          ? `No stores found for "${inputValue}"`
          : "Type to search stores..."
      }
      styles={defaultStyles}
      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      menuPosition="fixed"
      {...otherProps}
    />
  );
};

export default StoreSelect;
