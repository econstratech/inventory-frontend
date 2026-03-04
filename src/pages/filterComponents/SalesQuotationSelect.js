import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import { PrivateAxios } from "../../environment/AxiosInstance";

/**
 * Reusable Sales Quotation Select component with search and pagination
 * 
 * @param {Object} props
 * @param {Object|number|string} props.value - The selected quotation (object with {id, reference_number} or quotation ID)
 * @param {Function} props.onChange - Callback when quotation is selected. Receives (selectedOption) where selectedOption has { id, reference_number, value, label, ...quotationData }
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.isClearable - Whether the select can be cleared
 * @param {boolean} props.isSearchable - Whether the select is searchable
 * @param {boolean} props.isDisabled - Whether the select is disabled
 * @param {Object} props.styles - Custom styles for react-select
 * @param {number} props.limit - Number of items per page (default: 15)
 * @param {Object} props.error - Error state for styling
 * @param {Function} props.onErrorClear - Callback to clear error
 * @param {Object} props.otherProps - Additional props passed to react-select
 */
const SalesQuotationSelect = ({
  value,
  onChange,
  placeholder = "Search and select sales quotation...",
  isClearable = true,
  isSearchable = true,
  isDisabled = false,
  styles = {},
  limit = 15,
  error = null,
  onErrorClear = null,
  ...otherProps
}) => {
  const [quotationOptions, setQuotationOptions] = useState([]);
  const [quotationSearchInput, setQuotationSearchInput] = useState("");
  const [isLoadingQuotations, setIsLoadingQuotations] = useState(false);
  const [quotationPagination, setQuotationPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);

  // Function to load quotations from API with search and pagination
  const loadQuotations = useCallback(async (searchKey = "", page = 1) => {
    setIsLoadingQuotations(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        type: "availableQuotations",
        ...(searchKey && searchKey.trim() !== "" && { search: searchKey.trim() }),
      }).toString();
      const response = await PrivateAxios.get(`/sales/all-sale-quotation?${queryParams}`);
      const resData = response.data?.data;
      if (resData && resData.pagination && Array.isArray(resData.rows)) {
        const options = resData.rows.map((item) => ({
          ...item,
          value: item.id,
          label: item.reference_number || "N/A",
        }));
        setQuotationOptions(options);
        const pagination = resData.pagination;
        setQuotationPagination({
          currentPage: pagination.current_page || page,
          totalPages: pagination.total_pages || 1,
          hasNextPage: pagination.has_next_page || false,
          hasPrevPage: pagination.has_prev_page || false,
        });
      } else {
        setQuotationOptions([]);
      }
    } catch (error) {
      console.error("Error fetching sales quotations:", error);
      setQuotationOptions([]);
    } finally {
      setIsLoadingQuotations(false);
      setHasInitialLoaded(true);
    }
  }, [limit]);

  // Debounced search handler - reset to page 1 on search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (hasInitialLoaded) {
        loadQuotations(quotationSearchInput || "", 1);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [quotationSearchInput, hasInitialLoaded, loadQuotations]);

  // Load initial quotations on mount only once
  useEffect(() => {
    if (!hasInitialLoaded) {
      loadQuotations();
    }
  }, [hasInitialLoaded, loadQuotations]);

  // Handle pagination navigation
  const handleQuotationNextPage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quotationPagination.hasNextPage && !isLoadingQuotations) {
      loadQuotations(quotationSearchInput, quotationPagination.currentPage + 1);
    }
  };

  const handleQuotationPrevPage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quotationPagination.hasPrevPage && quotationPagination.currentPage > 1 && !isLoadingQuotations) {
      loadQuotations(quotationSearchInput, quotationPagination.currentPage - 1);
    }
  };

  // Custom QuotationsMenuList component with pagination
  const QuotationsMenuList = (props) => (
    <div {...props.innerProps}>
      {props.children}
      {(quotationPagination.hasNextPage || quotationPagination.hasPrevPage) && (
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
            onClick={handleQuotationPrevPage}
            disabled={!quotationPagination.hasPrevPage || isLoadingQuotations}
            style={{
              padding: "4px 12px",
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
              backgroundColor: quotationPagination.hasPrevPage ? "#fff" : "#f5f5f5",
              cursor: quotationPagination.hasPrevPage ? "pointer" : "not-allowed",
              color: quotationPagination.hasPrevPage ? "#333" : "#999",
              fontSize: "12px",
            }}
          >
            ← Previous
          </button>
          <span style={{ fontSize: "12px", color: "#666" }}>
            Page {quotationPagination.currentPage} of {quotationPagination.totalPages}
          </span>
          <button
            type="button"
            onClick={handleQuotationNextPage}
            disabled={!quotationPagination.hasNextPage || isLoadingQuotations}
            style={{
              padding: "4px 12px",
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
              backgroundColor: quotationPagination.hasNextPage ? "#fff" : "#f5f5f5",
              cursor: quotationPagination.hasNextPage ? "pointer" : "not-allowed",
              color: quotationPagination.hasNextPage ? "#333" : "#999",
              fontSize: "12px",
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );

  // Handle quotation selection change
  const handleChange = (selectedOption) => {
    if (onChange) {
      onChange(selectedOption);
    }
    
    // Clear error if error clear handler is provided
    if (onErrorClear && error) {
      onErrorClear();
    }
  };

  // Normalize value prop - handle both object and ID formats
  const normalizedValue = React.useMemo(() => {
    if (!value) return null;
    
    // If value is already an object with id/reference_number, use it
    if (typeof value === "object" && value.id) {
      return {
        ...value,
        value: value.id,
        label: value.reference_number || "N/A",
      };
    }
    
    // If value is an ID (number or string), find it in options
    const quotationId = typeof value === "object" ? value.quotation_id : value;
    if (quotationId) {
      const found = quotationOptions.find((opt) => opt.id === quotationId || opt.value === quotationId);
      if (found) {
        return {
          ...found,
          value: found.id,
          label: found.reference_number || "N/A",
        };
      }
    }
    
    return null;
  }, [value, quotationOptions]);

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
        setQuotationSearchInput(inputValue);
      }}
      options={quotationOptions}
      isLoading={isLoadingQuotations}
      isClearable={isClearable}
      isSearchable={isSearchable}
      isDisabled={isDisabled}
      filterOption={() => true} // Disable client-side filtering for server-side search
      components={{ MenuList: QuotationsMenuList }}
      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
      menuPosition="fixed"
      noOptionsMessage={({ inputValue }) =>
        inputValue ? `No quotations found for "${inputValue}"` : "Type to search quotations..."
      }
      styles={defaultStyles}
      {...otherProps}
    />
  );
};

export default SalesQuotationSelect;
