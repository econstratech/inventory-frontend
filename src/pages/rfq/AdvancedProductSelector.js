import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Select from "react-select";
import { PrivateAxios } from "../../environment/AxiosInstance";

const AdvancedProductSelector = ({ show, onHide, onProductSelect }) => {
  const [productCategories, setProductCategories] = useState([]);
  const [productSKUs, setProductSKUs] = useState([]);
  const [productNames, setProductNames] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSKU, setSelectedSKU] = useState(null);
  const [selectedProductName, setSelectedProductName] = useState(null);
  const [filteredSKUs, setFilteredSKUs] = useState([]);
  const [filteredNames, setFilteredNames] = useState([]);

  // Fetch product categories on mount
  useEffect(() => {
    PrivateAxios.get(`product-category`)
      .then(response => {
        setProductCategories(response.data.data.map(item => ({
          value: item.id,
          label: item.title,
        })));
      })
      .catch(error => {
        console.error("Error fetching categories:", error);
      });
  }, []);

  // Handle category change
  const handleCategoryChange = (option) => {
    if (!option) {
      // Clear selection
      setSelectedCategory(null);
      setProductSKUs([]);
      setProductNames([]);
      setFilteredSKUs([]);
      setFilteredNames([]);
      setSelectedSKU(null);
      setSelectedProductName(null);
      return;
    }

    // Get the category ID from the selected option
    const categoryId = option.value;
    
    // Fetch all products under this category
    const params = new URLSearchParams({
      product_category_id: categoryId,
      page: 1,
      limit: 100,
    });
    
    PrivateAxios.get(`product/list?${params.toString()}`)
      .then(response => {
        const productData = response.data?.data;
        if (productData && productData.rows) {
          setSelectedCategory(option);
          setProductSKUs(productData.rows.map(item => ({
            value: item.id,
            label: item.product_code,
            sku_product: item.sku_product,
            product_category_id: item.product_category_id,
          })));
          setProductNames(productData.rows.map(item => ({
            value: item.id,
            label: `${item.product_name}`,
            product_category_id: item.product_category_id,
            productData: item, // Store full product data
          })));
        }
      })
      .catch(error => {
        console.error("Error fetching products:", error);
      });
  };

  // Filter SKUs and Names based on selected category
  useEffect(() => {
    if (selectedCategory) {
      const filtered = productSKUs.filter(sku => sku.product_category_id === selectedCategory.value);
      setFilteredSKUs(filtered);
      setFilteredNames(productNames.filter(name => name.product_category_id === selectedCategory.value));
    } else {
      setFilteredSKUs([]);
      setFilteredNames([]);
    }
    setSelectedSKU(null);
    setSelectedProductName(null);
  }, [selectedCategory, productSKUs, productNames]);

  // Filter Names based on selected SKU
  useEffect(() => {
    if (selectedSKU) {
      const filtered = productNames.filter(name => name.value === selectedSKU.value);
      setFilteredNames(filtered);
    } else if (selectedCategory) {
      setFilteredNames(productNames.filter(name => name.product_category_id === selectedCategory.value));
    }
    setSelectedProductName(null);
  }, [selectedSKU, selectedCategory, productNames]);

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
    setSelectedSKU(null);
    setSelectedProductName(null);
    setFilteredSKUs([]);
    setFilteredNames([]);
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
          <strong>Instruction:</strong> Select a category to filter available SKUs and Product Names. Optionally select a SKU to further narrow down Product Names. Finally select a Product Name to complete the selection. You can clear any selection to reset the filters.
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
              isClearable
              isSearchable
            />
          </div>
          
          <div className="col-12 mb-3">
            <label className="form-label">
              <strong>Step 2:</strong> Select SKU {selectedCategory && `(Filtered by ${selectedCategory.label})`}
            </label>
            <Select
              placeholder={selectedCategory ? "Select a SKU..." : "Select category first"}
              value={selectedSKU}
              onChange={setSelectedSKU}
              options={filteredSKUs}
              isClearable
              isSearchable
              isDisabled={!selectedCategory}
            />
            {!selectedCategory && (
              <small className="text-muted">Please select a category first</small>
            )}
          </div>
          
          <div className="col-12 mb-3">
            <label className="form-label">
              <strong>Step 3:</strong> Select Product Name 
              {selectedSKU && ` (Filtered by ${selectedSKU.label})`}
              {selectedCategory && !selectedSKU && ` (Filtered by ${selectedCategory.label})`}
            </label>
            <Select
              placeholder={selectedCategory ? "Select a product..." : "Select category first"}
              value={selectedProductName}
              onChange={handleProductSelection}
              options={filteredNames}
              isClearable
              isSearchable
              isDisabled={!selectedCategory}
            />
            {!selectedCategory && (
              <small className="text-muted">Please select a category first</small>
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
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-3 p-3 bg-light rounded">
          <h6 className="mb-2">How it works:</h6>
          <ul className="mb-0">
            <li>Select a <strong>Category</strong> to filter available SKUs and Product Names</li>
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
