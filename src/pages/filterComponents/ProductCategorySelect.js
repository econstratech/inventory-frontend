import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Select from "react-select";
import { PrivateAxios } from "../../environment/AxiosInstance";

/**
 * Reusable Product Category Select with server-side search + pagination
 */
const ProductCategorySelect = ({
  value,
  onChange,
  error = null,
  onErrorClear = null,
  placeholder = "Select Category",
  isClearable = true,
  isSearchable = true,
  isDisabled = false,
  styles = {},
  theme,
  ...otherProps
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    perPage: 10,
  });
  const loadingRef = useRef(false);

  const fetchCategories = useCallback(
    async (page = 1, append = false, search = "") => {
      if (loadingRef.current) return;
  
      loadingRef.current = true;
      setLoading(true);
  
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
          status: "1",
          ...(search && search.trim() && { searchkey: search.trim() }),
        });
  
        const res = await PrivateAxios.get(
          `master/product-category?${params.toString()}`
        );
  
        const rawData = res.data?.data ?? res.data ?? {};
        const rows = Array.isArray(rawData?.rows) ? rawData.rows : [];
  
        const mapped = rows.map((item) => ({
          id: item.id,
          title: item.title,
          value: item.id,
          label: item.title,
        }));
  
        setOptions((prev) => {
          if (!append) return mapped;
  
          const existingIds = new Set(prev.map((x) => x.id));
          return [...prev, ...mapped.filter((x) => !existingIds.has(x.id))];
        });
  
        const pag = rawData?.pagination ?? {};
  
        setPagination({
          currentPage: Number(pag.current_page) || page,
          totalPages: Number(pag.total_pages) || 1,
          hasNextPage: Boolean(pag.has_next_page),
          perPage: Number(pag.per_page) || 10,
        });
      } catch (err) {
        console.error("Error fetching product categories:", err);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchCategories(1, false, "");
  }, [fetchCategories]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories(1, false, searchKey);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchKey, fetchCategories]);

  const handleMenuScrollToBottom = () => {
    if (!loading && pagination.hasNextPage) {
      fetchCategories(pagination.currentPage + 1, true, searchKey);
    }
  };

  const handleChange = (selectedOption) => {
    onChange?.(selectedOption);
    if (onErrorClear && error) onErrorClear();
  };

  const handleInputChange = (inputValue, meta) => {
    if (meta.action === "input-change") {
      setSearchKey(inputValue || "");
    }
  };

  // Normalize value (supports id or object)
  const normalizedValue = useMemo(() => {
    if (value == null || value === "") return null;

    const id = typeof value === "object" ? value?.id : value;

    return options.find((opt) => opt.id === id) || null;
  }, [value, options]);

  const defaultTheme = (t) => ({
    ...t,
    colors: {
      ...t.colors,
      primary25: "#ddddff",
      primary: "#6161ff",
    },
  });

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

  return (
    <Select
      placeholder={placeholder}
      value={normalizedValue}
      onChange={handleChange}
      options={options}
      isLoading={loading}
      isClearable={isClearable}
      isSearchable={isSearchable}
      isDisabled={isDisabled}
      getOptionLabel={(opt) => opt.label}
      getOptionValue={(opt) => opt.value}
      onMenuScrollToBottom={handleMenuScrollToBottom}
      onInputChange={handleInputChange}
      filterOption={() => true} // disable client filtering
      noOptionsMessage={({ inputValue }) =>
        inputValue
          ? `No categories found for "${inputValue}"`
          : "Type to search..."
      }
      theme={theme || defaultTheme}
      styles={defaultStyles}
      {...otherProps}
    />
  );
};

export default ProductCategorySelect;