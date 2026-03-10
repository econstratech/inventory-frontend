import React, { useState, useEffect } from "react";
import { Modal, Form } from "react-bootstrap";
import { PrivateAxios } from "../../environment/AxiosInstance";
import { ErrorMessage } from "../../environment/ToastMessage";

function ProductVariantSelectionModal({
  show,
  onHide,
  productId,
  productIndex,
  currentVariantId = null,
  onVariantSelect,
  onClose,
  currencySymbol = "",
  allowContinueWithoutVariant = false,
  onContinueWithoutVariant,
}) {
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [productVariants, setProductVariants] = useState([]);
  const [selectedProductInfo, setSelectedProductInfo] = useState(null);
  const [uomList, setUomList] = useState([]);
  const [loadingUom, setLoadingUom] = useState(false);
  const [filterUomId, setFilterUomId] = useState("");
  const [filterWeight, setFilterWeight] = useState("");

  // Fetch UOM list when modal opens
  useEffect(() => {
    if (show) {
      fetchUomList();
    } else {
      // Reset filters when modal is closed
      setFilterUomId("");
      setFilterWeight("");
    }
  }, [show]);

  // Fetch product variants when productId or filters change
  useEffect(() => {
    if (show && productId) {
      fetchProductVariants(productId);
    } else {
      // Reset state when modal is closed
      setProductVariants([]);
      setSelectedProductInfo(null);
    }
  }, [show, productId, filterUomId, filterWeight]);

  // Fetch UOM list from API
  const fetchUomList = async () => {
    setLoadingUom(true);
    try {
      const response = await PrivateAxios.get("master/uom/list");
      if (response.data && response.data.status && response.data.data) {
        const uomData = Array.isArray(response.data.data) 
          ? response.data.data 
          : [response.data.data];
        setUomList(uomData);
      }
    } catch (error) {
      console.error("Error fetching UOM list:", error);
    } finally {
      setLoadingUom(false);
    }
  };

  const fetchProductVariants = async (productId) => {
    setLoadingVariants(true);
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (filterUomId) {
        queryParams.append("uom_id", filterUomId);
      }
      if (filterWeight) {
        queryParams.append("weight", filterWeight);
      }
      
      const queryString = queryParams.toString();
      const url = `product/variants/${productId}${queryString ? `?${queryString}` : ""}`;
      
      const response = await PrivateAxios.get(url);
      
      if (response.data && response.data.status && response.data.data) {
        const variants = response.data.data.variants || [];
        setProductVariants(variants);
        setSelectedProductInfo(response.data.data.product);
      } else {
        setProductVariants([]);
        setSelectedProductInfo(null);
      }
    } catch (error) {
      console.error("Error fetching variants:", error);
      ErrorMessage("Failed to fetch product variants");
      setProductVariants([]);
      setSelectedProductInfo(null);
    } finally {
      setLoadingVariants(false);
    }
  };

  // Handle filter changes
  const handleUomFilterChange = (e) => {
    setFilterUomId(e.target.value);
  };

  const handleWeightFilterChange = (e) => {
    setFilterWeight(e.target.value);
  };

  const handleClearFilters = () => {
    setFilterUomId("");
    setFilterWeight("");
  };

  const hasActiveFilters = filterUomId || filterWeight;

  const handleVariantSelect = (variant) => {
    if (onVariantSelect) {
      onVariantSelect(variant, productIndex);
    }
    // Do not call onClose here; parent onClose is used for cancel/close behavior.
    if (onHide) {
      onHide();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose(productIndex);
    }
    if (onHide) {
      onHide();
    }
  };

  const handleContinueWithoutVariant = () => {
    if (onContinueWithoutVariant) {
      onContinueWithoutVariant(productIndex);
    }
    // Keep current product selection; close modal without triggering cancel cleanup.
    if (onHide) {
      onHide();
    }
  };

  return (
    <Modal
      backdrop="static"
      show={show}
      size="lg"
      centered
      onHide={handleClose}
      aria-labelledby="variant-selection-modal-title"
    >
      <Modal.Header closeButton>
        <Modal.Title id="variant-selection-modal-title">
          <i className="fas fa-box me-2 text-primary"></i>
          Select Product Variant
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "500px", overflowY: "auto" }}>
        {loadingVariants ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading variants...</span>
            </div>
            <p className="mt-2">Loading variants...</p>
          </div>
        ) : (
          <>
            {selectedProductInfo && (
              <div className="mb-3 p-3 bg-light rounded">
                <h6 className="mb-2">
                  <i className="fas fa-cube me-2 text-primary"></i>
                  Product: {selectedProductInfo.product_name || selectedProductInfo.product_code}
                </h6>
                <p className="mb-0 text-muted">
                  <small>Code: {selectedProductInfo.product_code}</small>
                </p>
                <div className="row mt-2 g-2">
                  <div className="col-md-4">
                    <small className="text-muted d-block">Category</small>
                    <span className="fw-medium">
                      {selectedProductInfo.productCategory?.title || "N/A"}
                    </span>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted d-block">Brand</small>
                    <span className="fw-medium">
                      {selectedProductInfo.masterBrand?.name || "N/A"}
                    </span>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted d-block">Product Type</small>
                    <span className="fw-medium">
                      {selectedProductInfo.masterProductType?.name || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Filter Section */}
            <div className="mb-3 p-3 border rounded">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="mb-0">
                  <i className="fas fa-filter me-2 text-primary"></i>
                  Filters
                </h6>
                {hasActiveFilters && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handleClearFilters}
                  >
                    <i className="fas fa-times me-1"></i>
                    Clear Filters
                  </button>
                )}
              </div>
              <div className="row g-2">
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="small">Filter by UOM</Form.Label>
                    <Form.Select
                      value={filterUomId}
                      onChange={handleUomFilterChange}
                      size="sm"
                      disabled={loadingUom}
                    >
                      <option value="">All UOMs</option>
                      {uomList.map((uom) => (
                        <option key={uom.id} value={uom.id}>
                          {uom.name} {uom.label && `(${uom.label})`}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="small">Filter by Weight (exact match)</Form.Label>
                    <Form.Control
                      type="number"
                      value={filterWeight}
                      onChange={handleWeightFilterChange}
                      placeholder="Enter weight"
                      size="sm"
                      min="0"
                      step="0.01"
                    />
                  </Form.Group>
                </div>
              </div>
            </div>
            
            {productVariants.length > 0 ? (
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="mb-0">Available Variants:</h6>
                  {hasActiveFilters && (
                    <span className="badge bg-info">
                      {productVariants.length} variant{productVariants.length !== 1 ? "s" : ""} found
                    </span>
                  )}
                </div>
                {currentVariantId != null && (
                  <div className="alert alert-success py-2 px-3 mb-3">
                    <small className="mb-0">
                      <i className="fas fa-check-circle me-1"></i>
                      Current selected variant is highlighted below.
                    </small>
                  </div>
                )}
                <div className="row">
                  {productVariants.map((variant, index) => {
                    const isSelected =
                      String(currentVariantId ?? "") === String(variant.id ?? "");
                    
                    return (
                      <div key={variant.id} className="col-md-6 mb-3">
                        <div
                          className="card h-100 cursor-pointer position-relative"
                          style={{
                            border: isSelected ? "3px solid #28a745" : "2px solid #dee2e6",
                            backgroundColor: isSelected ? "#f0f9f4" : "#fff",
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                            boxShadow: isSelected ? "0 4px 12px rgba(40, 167, 69, 0.3)" : "none",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = "#6161ff";
                              e.currentTarget.style.boxShadow = "0 2px 8px rgba(97, 97, 255, 0.2)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = "#dee2e6";
                              e.currentTarget.style.boxShadow = "none";
                            } else {
                              e.currentTarget.style.boxShadow = "0 4px 12px rgba(40, 167, 69, 0.3)";
                            }
                          }}
                          onClick={() => handleVariantSelect(variant)}
                        >
                          {isSelected && (
                            <div
                              style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                backgroundColor: "#28a745",
                                color: "#fff",
                                borderRadius: "50%",
                                width: "28px",
                                height: "28px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 10,
                              }}
                            >
                              <i className="fas fa-check" style={{ fontSize: "12px" }}></i>
                            </div>
                          )}
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="mb-0">
                                <i className="fas fa-tag me-2 text-primary"></i>
                                Variant {index + 1}
                                {isSelected && (
                                  <span className="badge bg-success ms-2" style={{ fontSize: "10px" }}>
                                    Selected
                                  </span>
                                )}
                              </h6>
                              {variant.status === 1 && (
                                <span className="badge bg-success">Active</span>
                              )}
                            </div>
                            <div className="mt-2">
                              <div className="d-flex justify-content-between py-1">
                                <span className="text-muted">Unit of Measurement:</span>
                                <span className="fw-medium">
                                  {variant.masterUOM?.name || "N/A"}
                                  {variant.masterUOM?.label && (
                                    <span className="text-muted ms-1">({variant.masterUOM.label})</span>
                                  )}
                                </span>
                              </div>
                              <div className="d-flex justify-content-between py-1">
                                <span className="text-muted">Weight per Unit:</span>
                                <span className="fw-medium">{variant.weight_per_unit || "N/A"}</span>
                              </div>
                              {variant.price_per_unit && parseFloat(variant.price_per_unit) > 0 && (
                                <div className="d-flex justify-content-between py-1">
                                  <span className="text-muted">Price per Unit:</span>
                                  <span className="fw-medium text-success">
                                    {currencySymbol}{parseFloat(variant.price_per_unit).toFixed(2)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
                <p className="text-muted">No variants available for this product.</p>
                {allowContinueWithoutVariant && (
                  <button
                    className="btn btn-primary"
                    onClick={handleContinueWithoutVariant}
                  >
                    Continue Without Variant
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleClose}
        >
          Cancel
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default ProductVariantSelectionModal;
