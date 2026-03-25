import React from "react";

/**
 * Component to display product details (e.g., in a Popover or Modal).
 * Reusable across pages that need to show product attributes.
 *
 * @param {Object} productData - The product data object
 * @param {string} [deliveryStore] - Optional delivery store name (for order context)
 * @param {Date|string} [expectedArrival] - Optional expected arrival date (for order context)
 */

const ProductDetailsContent = ({
  productData,
  deliveryStore,
  expectedArrival,
  isVariantBased = false,
}) => {
  if (!productData) return null;

  const detailRow = (label, value) =>
    value ? (
      <div
        className="d-flex justify-content-between py-1 border-bottom border-light"
        style={{ fontSize: "13px" }}
      >
        <span className="text-primary fw-medium">{label}:</span>
        <span className="text-dark">{value}</span>
      </div>
    ) : null;

  return (
    <div style={{ minWidth: "280px", width: "100%" }}>
      {/* Basic Product Information */}
      <div className="mb-2">
        {detailRow("Product Code", productData.product_code)}
        {detailRow("SKU", productData.sku_product || "N/A")}
        {detailRow(
          "Product Type",
          productData.masterProductType?.name || "N/A"
        )}
        {detailRow(
          "Product Category",
          productData.productCategory?.title ||
            productData.Categories?.title ||
            "N/A"
        )}
        {!isVariantBased && detailRow(
          "Unit of Measurement",
          productData.masterUOM?.name || "N/A"
        )}
        {detailRow(
          "Is Batch Product?",
          productData.is_batch_applicable && productData.is_batch_applicable === 1 ? "Yes" : "No"
        )}
        {detailRow(
          "Brand",
          productData.masterBrand?.name || "N/A"
        )}
        {deliveryStore && detailRow("Store", deliveryStore)}
        {expectedArrival &&
          detailRow(
            "Expected Arrival",
            expectedArrival instanceof Date
              ? expectedArrival.toLocaleString()
              : String(expectedArrival)
          )}
      </div>

      {/* Dynamic Product Attributes Section */}
      {productData.productAttributeValues?.length > 0 && (
        <div className="mt-3 pt-2 border-top">
          <div
            className="d-block mb-2"
            style={{ fontSize: "14px", fontWeight: "bold", color: "#495057" }}
          >
            <i className="fas fa-tags me-1 text-success"></i>
            Other Attributes:
          </div>
          {productData.productAttributeValues.map((av, i) => (
            <div
              key={i}
              className="d-flex justify-content-between py-1 border-bottom border-light"
              style={{ fontSize: "13px" }}
            >
              <span className="text-primary fw-medium">{av.productAttribute?.name}:</span>
              <span className="text-dark">{av.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Product Variants Section */}
      {isVariantBased && productData.productVariants && productData.productVariants.length > 0 && (
        <div className="mt-3 pt-2 border-top">
          <div
            className="d-block mb-2"
            style={{ fontSize: "14px", fontWeight: "bold", color: "#495057" }}
          >
            <i className="fas fa-box me-1 text-primary"></i>
            Product Variants:
          </div>
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {productData.productVariants.map((variant, i) => (
              <div
                key={variant.id || i}
                className="mb-2 p-2 rounded"
                style={{
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #dee2e6",
                  fontSize: "12px",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-primary fw-medium">
                    Variant {i + 1}:
                  </span>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">UoM:</span>
                  <span className="text-dark">
                    {variant.masterUOM
                      ? variant.masterUOM.name && variant.masterUOM.label
                        ? `${variant.masterUOM.name} (${variant.masterUOM.label})`
                        : variant.masterUOM.name || variant.masterUOM.label || "N/A"
                      : "N/A"}
                  </span>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Weight:</span>
                  <span className="text-dark fw-medium">
                    {variant.weight_per_unit || "N/A"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


    </div>
  );
};

export default ProductDetailsContent;
