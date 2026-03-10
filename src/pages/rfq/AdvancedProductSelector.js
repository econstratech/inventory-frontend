import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Select from "react-select";
import { PrivateAxios } from "../../environment/AxiosInstance";

const AdvancedProductSelector = ({ show, onHide, onProductSelect }) => {
  const [productCategories, setProductCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categorySearchKey, setCategorySearchKey] = useState("");
  const [categoryPagination, setCategoryPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    perPage: 10,
  });
  const [productSKUs, setProductSKUs] = useState([]);
  const [productNames, setProductNames] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearchKey, setProductSearchKey] = useState("");
  const [productPagination, setProductPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    perPage: 20,
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedSKU, setSelectedSKU] = useState(null);
  const [selectedProductName, setSelectedProductName] = useState(null);
  const [filteredSKUs, setFilteredSKUs] = useState([]);
  const [filteredNames, setFilteredNames] = useState([]);

  const fetchProductCategories = async (page = 1, append = false, searchKey = categorySearchKey) => {
    if (categoryLoading) return;
    setCategoryLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        status: "1",
        ...(searchKey && searchKey.trim() !== "" && { searchkey: searchKey.trim() }),
      });
      const response = await PrivateAxios.get(`master/product-category?${params.toString()}`);
      const data = response.data?.data || {};
      const rows = Array.isArray(data?.rows) ? data.rows : [];
      const pagination = data?.pagination || {};

      const mapped = rows.map((item) => ({
        value: item.id,
        label: item.title,
      }));

      setProductCategories((prev) => {
        if (!append) return mapped;
        const existing = new Set(prev.map((x) => String(x.value)));
        const uniqueNew = mapped.filter((x) => !existing.has(String(x.value)));
        return [...prev, ...uniqueNew];
      });

      setCategoryPagination({
        currentPage: Number(pagination.current_page) || page,
        totalPages: Number(pagination.total_pages) || 1,
        hasNextPage: Boolean(pagination.has_next_page),
        perPage: Number(pagination.per_page) || 10,
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setCategoryLoading(false);
    }
  };

  const fetchBrands = async () => {
    setBrandsLoading(true);
    try {
      const response = await PrivateAxios.get("master/brand/list");
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      setBrands(
        data.map((item) => ({
          value: item.id,
          label: item.name,
          description: item.description,
        }))
      );
    } catch (error) {
      console.error("Error fetching brands:", error);
      setBrands([]);
    } finally {
      setBrandsLoading(false);
    }
  };

  // Fetch product categories on mount
  useEffect(() => {
    fetchProductCategories(1, false);
    fetchBrands();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProductCategories(1, false, categorySearchKey);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [categorySearchKey]);

  const handleCategoryMenuScrollToBottom = () => {
    if (categoryLoading || !categoryPagination.hasNextPage) return;
    fetchProductCategories(categoryPagination.currentPage + 1, true, categorySearchKey);
  };

  const fetchCategoryProducts = async (
    categoryId,
    brandId,
    page = 1,
    append = false,
    searchKey = productSearchKey
  ) => {
    if ((!categoryId && !brandId) || productsLoading) return;
    setProductsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(categoryId && { product_category_id: String(categoryId) }),
        ...(brandId && { brand_id: String(brandId) }),
        ...(searchKey && searchKey.trim() !== "" && { searchkey: searchKey.trim() }),
      });

      const response = await PrivateAxios.get(`product/list?${params.toString()}`);
      const productData = response.data?.data || {};
      const rows = Array.isArray(productData?.rows) ? productData.rows : [];
      const pagination = productData?.pagination || {};

      const nextSKUs = rows.map((item) => ({
        value: item.id,
        label: item.product_code,
        sku_product: item.sku_product,
        product_category_id: item.product_category_id,
      }));
      const nextNames = rows.map((item) => ({
        value: item.id,
        label: `${item.product_name}`,
        product_category_id: item.product_category_id,
        productData: item,
      }));

      setProductSKUs((prev) => {
        if (!append) return nextSKUs;
        const existing = new Set(prev.map((x) => String(x.value)));
        const uniqueNew = nextSKUs.filter((x) => !existing.has(String(x.value)));
        return [...prev, ...uniqueNew];
      });

      setProductNames((prev) => {
        if (!append) return nextNames;
        const existing = new Set(prev.map((x) => String(x.value)));
        const uniqueNew = nextNames.filter((x) => !existing.has(String(x.value)));
        return [...prev, ...uniqueNew];
      });

      setProductPagination({
        currentPage: Number(pagination.current_page) || page,
        totalPages: Number(pagination.total_pages) || 1,
        hasNextPage: Boolean(pagination.has_next_page),
        perPage: Number(pagination.per_page) || 20,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  // Handle category change
  const handleCategoryChange = (option) => {
    if (!option) {
      // Clear selection
      setSelectedCategory(null);
      setSelectedBrand(null);
      setProductSKUs([]);
      setProductNames([]);
      setFilteredSKUs([]);
      setFilteredNames([]);
      setSelectedSKU(null);
      setSelectedProductName(null);
      setProductSearchKey("");
      setProductPagination({
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        perPage: 20,
      });
      return;
    }

    // Get the category ID from the selected option
    const categoryId = option.value;

    setSelectedCategory(option);
    setSelectedBrand(null);
    setSelectedSKU(null);
    setSelectedProductName(null);
    setProductSearchKey("");
    setProductSKUs([]);
    setProductNames([]);
    setFilteredSKUs([]);
    setFilteredNames([]);
    fetchCategoryProducts(categoryId, null, 1, false, "");
  };

  const handleBrandChange = (option) => {
    if (!option) {
      setSelectedBrand(null);
      setSelectedCategory(null);
      setProductSKUs([]);
      setProductNames([]);
      setFilteredSKUs([]);
      setFilteredNames([]);
      setSelectedSKU(null);
      setSelectedProductName(null);
      setProductSearchKey("");
      setProductPagination({
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        perPage: 20,
      });
      return;
    }

    const brandId = option.value;
    setSelectedBrand(option);
    setSelectedCategory(null);
    setSelectedSKU(null);
    setSelectedProductName(null);
    setProductSearchKey("");
    setProductSKUs([]);
    setProductNames([]);
    setFilteredSKUs([]);
    setFilteredNames([]);
    fetchCategoryProducts(null, brandId, 1, false, "");
  };

  // Filter SKUs and Names based on selected category
  useEffect(() => {
    if (selectedCategory) {
      const filtered = productSKUs.filter(sku => sku.product_category_id === selectedCategory.value);
      setFilteredSKUs(filtered);
      setFilteredNames(productNames.filter(name => name.product_category_id === selectedCategory.value));
    } else if (selectedBrand) {
      setFilteredSKUs(productSKUs);
      setFilteredNames(productNames);
    } else {
      setFilteredSKUs([]);
      setFilteredNames([]);
    }
  }, [selectedCategory, selectedBrand, productSKUs, productNames]);

  // Filter Names based on selected SKU
  useEffect(() => {
    if (selectedSKU) {
      const filtered = productNames.filter(name => name.value === selectedSKU.value);
      setFilteredNames(filtered);
    } else if (selectedCategory) {
      setFilteredNames(productNames.filter(name => name.product_category_id === selectedCategory.value));
    } else if (selectedBrand) {
      setFilteredNames(productNames);
    }
  }, [selectedSKU, selectedCategory, selectedBrand, productNames]);

  useEffect(() => {
    if (!selectedCategory && !selectedBrand) return;
    const timeoutId = setTimeout(() => {
      fetchCategoryProducts(
        selectedCategory?.value || null,
        selectedBrand?.value || null,
        1,
        false,
        productSearchKey
      );
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [productSearchKey, selectedCategory, selectedBrand]);

  const handleProductMenuScrollToBottom = () => {
    if ((!selectedCategory && !selectedBrand) || productsLoading || !productPagination.hasNextPage) return;
    fetchCategoryProducts(
      selectedCategory?.value || null,
      selectedBrand?.value || null,
      productPagination.currentPage + 1,
      true,
      productSearchKey
    );
  };

  // Handle final product selection
  const handleProductSelection = (option) => {
    setSelectedProductName(option);
    if (option && onProductSelect) {
      onProductSelect(option);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSelectedSKU(null);
    setSelectedProductName(null);
    setFilteredSKUs([]);
    setFilteredNames([]);
    setCategorySearchKey("");
    setProductSearchKey("");
    fetchProductCategories(1, false, "");
    if (onHide) {
      onHide();
    }
  };

  // Handle add product button click
  const handleAddProduct = () => {
    if (selectedProductName && onProductSelect) {
      onProductSelect(selectedProductName);
      handleClose();
    }
  };

  return (
    <Modal
      backdrop="static"
      show={show}
      size="lg"
      centered
      onHide={handleClose}
      aria-labelledby="product-selector-modal-title"
    >
      <Modal.Header closeButton>
        <Modal.Title id="product-selector-modal-title">
          <i className="fas fa-filter me-2"></i>
          Advanced Product Selector
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="alert alert-info mb-3">
          <i className="fas fa-info-circle me-2"></i>
          <strong>Instruction:</strong> Select a category or brand to filter available SKUs and Product Names. 
          Optionally select a SKU to further narrow down Product Names. Finally select a Product Name to complete the selection. 
          You can clear any selection to reset the filters.
        </div>
        
        <div className="row">
          <div className="col-12 mb-3">
            <label className="form-label">
              <strong>Step 1:</strong> Select Category
            </label>
            <Select
              placeholder="Select a category..."
              value={selectedCategory}
              onChange={handleCategoryChange}
              options={productCategories}
              isLoading={categoryLoading}
              isClearable
              isSearchable
              onMenuScrollToBottom={handleCategoryMenuScrollToBottom}
              onInputChange={(inputValue, meta) => {
                if (meta.action === "input-change") {
                  setCategorySearchKey(inputValue || "");
                }
              }}
            />
          </div>

          <div className="col-12 mb-3">
            <label className="form-label">
              <strong>Step 1 (Alternative):</strong> Select Brand
            </label>
            <Select
              placeholder="Select a brand..."
              value={selectedBrand}
              onChange={handleBrandChange}
              options={brands}
              isLoading={brandsLoading}
              isClearable
              isSearchable
            />
          </div>
          
          <div className="col-12 mb-3">
            <label className="form-label">
              <strong>Step 2:</strong> Select SKU
              {selectedCategory && ` (Filtered by category: ${selectedCategory.label})`}
              {selectedBrand && ` (Filtered by brand: ${selectedBrand.label})`}
            </label>
            <Select
              placeholder={selectedCategory || selectedBrand ? "Select a SKU..." : "Select category or brand first"}
              value={selectedSKU}
              onChange={(option) => {
                setSelectedSKU(option);
                setSelectedProductName(null);
              }}
              options={filteredSKUs}
              isLoading={productsLoading}
              isClearable
              isSearchable
              isDisabled={!selectedCategory && !selectedBrand}
              onMenuScrollToBottom={handleProductMenuScrollToBottom}
              onInputChange={(inputValue, meta) => {
                if (meta.action === "input-change") {
                  setProductSearchKey(inputValue || "");
                }
              }}
            />
            {!selectedCategory && !selectedBrand && (
              <small className="text-muted">Please select a category or brand first</small>
            )}
          </div>
          
          <div className="col-12 mb-3">
            <label className="form-label">
              <strong>Step 3:</strong> Select Product Name 
              {selectedSKU && ` (Filtered by ${selectedSKU.label})`}
              {selectedCategory && !selectedSKU && ` (Filtered by category: ${selectedCategory.label})`}
              {selectedBrand && !selectedSKU && ` (Filtered by brand: ${selectedBrand.label})`}
            </label>
            <Select
              placeholder={selectedCategory || selectedBrand ? "Select a product..." : "Select category or brand first"}
              value={selectedProductName}
              onChange={handleProductSelection}
              options={filteredNames}
              isLoading={productsLoading}
              isClearable
              isSearchable
              isDisabled={!selectedCategory && !selectedBrand}
              onMenuScrollToBottom={handleProductMenuScrollToBottom}
              onInputChange={(inputValue, meta) => {
                if (meta.action === "input-change") {
                  setProductSearchKey(inputValue || "");
                }
              }}
            />
            {!selectedCategory && !selectedBrand && (
              <small className="text-muted">Please select a category or brand first</small>
            )}
          </div>
          
          {selectedProductName && (
            <div className="col-12">
              <div className="alert alert-success">
                <h6><i className="fas fa-check-circle me-2"></i>Selected Product:</h6>
                <p className="mb-1"><strong>Name:</strong> {selectedProductName.label}</p>
                {selectedProductName.productData?.product_code && (
                  <p className="mb-1"><strong>SKU:</strong> {selectedProductName.productData.product_code}</p>
                )}
                {selectedCategory && (
                  <p className="mb-0"><strong>Category:</strong> {selectedCategory.label}</p>
                )}
                {selectedBrand && (
                  <p className="mb-0"><strong>Brand:</strong> {selectedBrand.label}</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-3 p-3 bg-light rounded">
          <h6 className="mb-2">How it works:</h6>
          <ul className="mb-0">
            <li>Select a <strong>Category</strong> or <strong>Brand</strong> first to filter available SKUs and Product Names</li>
            <li>Optionally select a <strong>SKU</strong> to further narrow down Product Names</li>
            <li>Finally select a <strong>Product Name</strong> to complete the selection</li>
            <li>You can clear any selection to reset the filters</li>
          </ul>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button 
          type="button" 
          className="btn btn-secondary" 
          onClick={handleClose}
        >
          Close
        </button>
        {selectedProductName && (
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleAddProduct}
          >
            Add Selected Product
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default AdvancedProductSelector;
