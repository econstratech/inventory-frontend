import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import { PrivateAxios } from "../../environment/AxiosInstance";

/**
 * Reusable Customer Select component with search and pagination
 * 
 * @param {Object} props
 * @param {Object|number|string} props.value - The selected customer (object with {id, name} or customer ID)
 * @param {Function} props.onChange - Callback when customer is selected. Receives (selectedOption) where selectedOption has { id, name, value, label, ...customerData }
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.isClearable - Whether the select can be cleared
 * @param {boolean} props.isSearchable - Whether the select is searchable
 * @param {boolean} props.isDisabled - Whether the select is disabled
 * @param {Object} props.styles - Custom styles for react-select
 * @param {number} props.limit - Number of items per page (default: 15)
 * @param {Object} props.error - Error state for styling
 * @param {Function} props.onErrorClear - Callback to clear error
 * @param {...Object} props.otherProps - Additional props passed to react-select
 */
const CustomerSelect = ({
  value,
  onChange,
  placeholder = "Search and select customer...",
  isClearable = true,
  isSearchable = true,
  isDisabled = false,
  styles = {},
  limit = 15,
  error = null,
  onErrorClear = null,
  ...otherProps
}) => {
  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerSearchInput, setCustomerSearchInput] = useState("");
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [customerPagination, setCustomerPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);

  // Function to load customers from API with search and pagination
  const loadCustomers = useCallback(async (searchKey = "", page = 1) => {
    setIsLoadingCustomers(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...(searchKey && searchKey.trim() !== "" && { search: searchKey.trim() }),
      }).toString();
      const response = await PrivateAxios.get(`customer/all-customers?${queryParams}`);
      const resData = response.data?.data;
      if (resData && Array.isArray(resData.rows)) {
        const options = resData.rows.map((item) => ({
          ...item,
          value: item.id,
          label: item.name || "N/A",
        }));
        setCustomerOptions(options);
        const total = resData.total ?? 0;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        setCustomerPagination({
          currentPage: page,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        });
      } else {
        setCustomerOptions([]);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomerOptions([]);
    } finally {
      setIsLoadingCustomers(false);
      setHasInitialLoaded(true);
    }
  }, [limit]);

  // Debounced search handler - reset to page 1 on search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (hasInitialLoaded) {
        loadCustomers(customerSearchInput || "", 1);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [customerSearchInput, hasInitialLoaded, loadCustomers]);

  // Load initial customers on mount only once
  useEffect(() => {
    if (!hasInitialLoaded) {
      loadCustomers();
    }
  }, [hasInitialLoaded, loadCustomers]);

  // Handle pagination navigation
  const handleCustomerNextPage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (customerPagination.hasNextPage && !isLoadingCustomers) {
      loadCustomers(customerSearchInput, customerPagination.currentPage + 1);
    }
  };

  const handleCustomerPrevPage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (customerPagination.hasPrevPage && customerPagination.currentPage > 1 && !isLoadingCustomers) {
      loadCustomers(customerSearchInput, customerPagination.currentPage - 1);
    }
  };

  // Custom CustomersMenuList component with pagination
  const CustomersMenuList = (props) => (
    <div {...props.innerProps}>
      {props.children}
      {(customerPagination.hasNextPage || customerPagination.hasPrevPage) && (
        <div
          style={{
            padding: "8px 12px",
            borderTop: "1px solid #e0e0e0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#f5f5f5",
          }}
        >
          <button
            type="button"
            onClick={handleCustomerPrevPage}
            disabled={!customerPagination.hasPrevPage || isLoadingCustomers}
            style={{
              padding: "4px 12px",
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
              backgroundColor: customerPagination.hasPrevPage ? "#fff" : "#f5f5f5",
              cursor: customerPagination.hasPrevPage ? "pointer" : "not-allowed",
              color: customerPagination.hasPrevPage ? "#333" : "#999",
              fontSize: "12px",
            }}
          >
            ← Previous
          </button>
          <span style={{ fontSize: "12px", color: "#666" }}>
            Page {customerPagination.currentPage} of {customerPagination.totalPages}
          </span>
          <button
            type="button"
            onClick={handleCustomerNextPage}
            disabled={!customerPagination.hasNextPage || isLoadingCustomers}
            style={{
              padding: "4px 12px",
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
              backgroundColor: customerPagination.hasNextPage ? "#fff" : "#f5f5f5",
              cursor: customerPagination.hasNextPage ? "pointer" : "not-allowed",
              color: customerPagination.hasNextPage ? "#333" : "#999",
              fontSize: "12px",
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );

  // Handle customer selection change
  const handleChange = (selectedOption) => {
    if (onChange) {
      onChange(selectedOption);
    }
    
    // Clear error if error clear handler is provided
    if (onErrorClear && error) {
      onErrorClear();
    }
  };

  // Normalize value prop - handle both object and ID formats. Return stable option reference when found to avoid unnecessary re-renders/loops.
  const normalizedValue = React.useMemo(() => {
    if (!value) return null;

    const customerId = typeof value === "object" ? (value.id ?? value.customer_id) : value;
    if (customerId) {
      const found = customerOptions.find((opt) => opt.id === customerId || opt.value === customerId);
      if (found) return found; // stable reference from options array
    }

    if (typeof value === "object" && value.id) {
      return { ...value, value: value.id, label: value.name || "N/A" };
    }

    return null;
  }, [value, customerOptions]);

  // Default styles with error state support
  const defaultStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "38px",
      borderColor: error ? "#ff4d4f" : base.borderColor,
      ...(styles.control ? styles.control(base, state) : {}),
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
      ...(styles.menuPortal ? styles.menuPortal(base) : {}),
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      ...(styles.menu ? styles.menu(base) : {}),
    }),
    ...styles,
  };

  return (
    <Select
      placeholder={placeholder}
      value={normalizedValue}
      onChange={handleChange}
      onInputChange={(inputValue) => {
        setCustomerSearchInput(inputValue);
      }}
      options={customerOptions}
      isLoading={isLoadingCustomers}
      isClearable={isClearable}
      isSearchable={isSearchable}
      isDisabled={isDisabled}
      filterOption={() => true} // Disable client-side filtering for server-side search
      components={{ MenuList: CustomersMenuList }}
      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
      menuPosition="fixed"
      noOptionsMessage={({ inputValue }) =>
        inputValue ? `No customers found for "${inputValue}"` : "Type to search customers..."
      }
      styles={defaultStyles}
      {...otherProps}
    />
  );
};

export default CustomerSelect;
