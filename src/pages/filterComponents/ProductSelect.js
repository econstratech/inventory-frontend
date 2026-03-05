import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import { PrivateAxios } from "../../environment/AxiosInstance";

// Stable default so useCallback(..., [queryParams]) doesn't change every render
const EMPTY_QUERY_PARAMS = {};

/**
 * Reusable Product Select component with search and pagination
 * 
 * @param {Object} props
 * @param {string|number} props.value - The selected product ID
 * @param {Object} props.selectedProductData - The full product data object for the selected product (used when product is not in current options)
 * @param {Function} props.onChange - Callback when product is selected. Receives (selectedOption) where selectedOption has { value, label, productData }
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.isClearable - Whether the select can be cleared
 * @param {boolean} props.isSearchable - Whether the select is searchable
 * @param {boolean} props.isDisabled - Whether the select is disabled
 * @param {Object} props.styles - Custom styles for react-select
 * @param {number} props.limit - Number of items per page (default: 5)
 * @param {Object} props.error - Error state for styling
 * @param {Function} props.onErrorClear - Callback to clear error
 * @param {Object} props.otherProps - Additional props passed to react-select
 */
const ProductSelect = ({
  value,
  selectedProductData = null,
  onChange,
  placeholder = "Search and select product...",
  isClearable = true,
  isSearchable = true,
  isDisabled = false,
  styles = {},
  limit = 10,
  queryParams = EMPTY_QUERY_PARAMS,
  error = null,
  onErrorClear = null,
  ...otherProps
}) => {
  const [productOptions, setProductOptions] = useState([]);
  const [productSearchInput, setProductSearchInput] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productPagination, setProductPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Function to load products from API with search and pagination
  const loadProducts = useCallback(async (searchKey = "", page = 1) => {
    setIsLoadingProducts(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        type: 'search',
        ...(searchKey && searchKey.trim() !== "" && { searchkey: searchKey.trim() }),
        ...queryParams,
      }).toString();

      const response = await PrivateAxios.get(`/product/list?${params}`);
      const productData = response.data?.data;

      if (productData && productData.rows) {
        const options = productData.rows.map((item) => {
          let label = `${item.product_name || "N/A"} (${item.product_code || "N/A"})`;
          if (item.productAttributeValues && Array.isArray(item.productAttributeValues)) {
            for (const attrValue of item.productAttributeValues) {
              if (attrValue.productAttribute && attrValue.productAttribute.name) {
                label += `, ${attrValue.productAttribute.name}: ${attrValue.value}`;
              }
            }
          }
          return {
            value: item.id,
            label: label,
            productData: item, // Store full product data for later use
          };
        });
        
        setProductOptions(options);

        // Update pagination state
        if (productData.pagination) {
          setProductPagination({
            currentPage: productData.pagination.current_page || page,
            totalPages: productData.pagination.total_pages || 1,
            hasNextPage: productData.pagination.has_next_page || false,
            hasPrevPage: productData.pagination.has_prev_page || false,
          });
        }
      } else {
        setProductOptions([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProductOptions([]);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [limit, queryParams]);

  // Debounced search handler - reset to page 1 on search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (productSearchInput !== "") {
        loadProducts(productSearchInput, 1);
      }
    }, 300);
  
    return () => clearTimeout(timeoutId);
  }, [productSearchInput, loadProducts]);

  // Load initial products on mount only once
  useEffect(() => {
    loadProducts("", 1);
  }, [loadProducts]);

  // Handle pagination navigation
  const handleNextPage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (productPagination.hasNextPage && !isLoadingProducts) {
      loadProducts(productSearchInput, productPagination.currentPage + 1);
    }
  };

  const handlePrevPage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (productPagination.hasPrevPage && productPagination.currentPage > 1 && !isLoadingProducts) {
      loadProducts(productSearchInput, productPagination.currentPage - 1);
    }
  };

  // Custom ProductsMenuList component with pagination
  const ProductsMenuList = (props) => {
    return (
      <div {...props.innerProps}>
        {props.children}
        {(productPagination.hasNextPage || productPagination.hasPrevPage) && (
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
              onClick={handlePrevPage}
              disabled={!productPagination.hasPrevPage || isLoadingProducts}
              style={{
                padding: "4px 12px",
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
                backgroundColor: productPagination.hasPrevPage ? "#fff" : "#f5f5f5",
                cursor: productPagination.hasPrevPage ? "pointer" : "not-allowed",
                color: productPagination.hasPrevPage ? "#333" : "#999",
                fontSize: "12px",
              }}
            >
              ← Previous
            </button>
            <span style={{ fontSize: "12px", color: "#666" }}>
              Page {productPagination.currentPage} of {productPagination.totalPages}
            </span>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={!productPagination.hasNextPage || isLoadingProducts}
              style={{
                padding: "4px 12px",
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
                backgroundColor: productPagination.hasNextPage ? "#fff" : "#f5f5f5",
                cursor: productPagination.hasNextPage ? "pointer" : "not-allowed",
                color: productPagination.hasNextPage ? "#333" : "#999",
                fontSize: "12px",
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    );
  };

  // Handle product selection change
  const handleChange = (selectedOption) => {
    if (onChange) {
      onChange(selectedOption);
    }
    
    // Clear error if error clear handler is provided
    if (onErrorClear && error) {
      onErrorClear();
    }
  };

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

  // Create option from selectedProductData if value is not in productOptions
  const createOptionFromProductData = (productData) => {
    if (!productData) return null;
    
    let label = `${productData.product_name || "N/A"} (${productData.product_code || "N/A"})`;
    if (productData.productAttributeValues && Array.isArray(productData.productAttributeValues)) {
      for (const attrValue of productData.productAttributeValues) {
        if (attrValue.productAttribute && attrValue.productAttribute.name) {
          label += `, ${attrValue.productAttribute.name}: ${attrValue.value}`;
        }
      }
    }
    
    return {
      value: productData.id,
      label: label,
      productData: productData,
    };
  };

  // Find the selected option based on value prop
  // If not found in options but selectedProductData is provided, create option from it
  const selectedOption = value
    ? productOptions.find((option) => option.value === value) || 
      (selectedProductData && selectedProductData.id === value ? createOptionFromProductData(selectedProductData) : null)
    : null;

  return (
    <Select
      placeholder={placeholder}
      value={selectedOption}
      onChange={handleChange}
      onInputChange={(inputValue) => {
        setProductSearchInput(inputValue);
      }}
      options={productOptions}
      isLoading={isLoadingProducts}
      isClearable={isClearable}
      isSearchable={isSearchable}
      isDisabled={isDisabled}
      filterOption={() => true} // Disable client-side filtering for server-side search
      components={{ MenuList: ProductsMenuList }}
      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      menuPosition="fixed"
      noOptionsMessage={({ inputValue }) =>
        inputValue
          ? `No products found for "${inputValue}"`
          : "Type to search products..."
      }
      styles={defaultStyles}
      {...otherProps}
    />
  );
};

export default ProductSelect;
