import React, { useState, useEffect, useCallback, useRef } from "react";
import { Form, Input, Button, Card, Row, Col } from "antd";
import { PlusOutlined, MinusCircleOutlined, DownloadOutlined, UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import Select from "react-select";
import { Link } from "react-router-dom";
import { PrivateAxios, PrivateAxiosFile } from "../../environment/AxiosInstance";
import { SuccessMessage, ErrorMessage } from "../../environment/ToastMessage";
import StoreSelect from "../filterComponents/StoreSelect";
import "../global.css";

function StockMaster() {
  const [form] = Form.useForm();
  const [rows, setRows] = useState([
    {
      id: 1,
      product: null,
      variant: null,
      variantOptions: [],
      isLoadingVariants: false,
      store: null,
      quantity: "",
      buffer_size: "",
    },
  ]);

  const [productOptions, setProductOptions] = useState([]);
  const [productSearchInput, setProductSearchInput] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rowErrors, setRowErrors] = useState({});
  const [bulkUploading, setBulkUploading] = useState(false);
  const fileInputRef = useRef(null);

  const SAMPLE_CSV_URL = "/sample-csv-files/sample_bulk_add_to_stock.csv";

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Function to load products from API with search and pagination
  const loadProducts = useCallback(async (searchKey = "", page = 1) => {
    setIsLoadingProducts(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 5,
        ...(searchKey && searchKey.trim() !== "" && { searchkey: searchKey.trim() }),
      }).toString();

      const response = await PrivateAxios.get(`/product/list?${queryParams}`);
      const productData = response.data?.data;

      if (productData && productData.rows) {
        const options = productData.rows.map((item) => ({
          value: item.id,
          label: `${item.product_name || "N/A"} (${item.product_code || "N/A"})`,
          productData: item, // Store full product data for later use
        }));
        
        setProductOptions(options);

        // Update pagination state
        if (productData.pagination) {
          setPagination({
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
  }, []);


  // Load initial products on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Debounced search handler - reset to page 1 on search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (productSearchInput !== undefined) {
        loadProducts(productSearchInput, 1);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [productSearchInput, loadProducts]);

  // Handle pagination navigation
  const handleNextPage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (pagination.hasNextPage && !isLoadingProducts) {
      loadProducts(productSearchInput, pagination.currentPage + 1);
    }
  };

  const handlePrevPage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (pagination.hasPrevPage && pagination.currentPage > 1 && !isLoadingProducts) {
      loadProducts(productSearchInput, pagination.currentPage - 1);
    }
  };

  // Custom MenuList component with pagination
  const MenuList = (props) => {
    return (
      <div>
        <div {...props.innerProps}>{props.children}</div>
        {(pagination.hasNextPage || pagination.hasPrevPage) && (
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
              disabled={!pagination.hasPrevPage || isLoadingProducts}
              style={{
                padding: "4px 12px",
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
                backgroundColor: pagination.hasPrevPage ? "#fff" : "#f5f5f5",
                cursor: pagination.hasPrevPage ? "pointer" : "not-allowed",
                color: pagination.hasPrevPage ? "#333" : "#999",
                fontSize: "12px",
              }}
            >
              ← Previous
            </button>
            <span style={{ fontSize: "12px", color: "#666" }}>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={!pagination.hasNextPage || isLoadingProducts}
              style={{
                padding: "4px 12px",
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
                backgroundColor: pagination.hasNextPage ? "#fff" : "#f5f5f5",
                cursor: pagination.hasNextPage ? "pointer" : "not-allowed",
                color: pagination.hasNextPage ? "#333" : "#999",
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

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      product: null,
      variant: null,
      variantOptions: [],
      isLoadingVariants: false,
      store: null,
      quantity: "",
      buffer_size: "",
    };
    setRows([...rows, newRow]);
  };

  const handleRemoveRow = (id) => {
    if (rows.length > 1) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const fetchProductVariants = async (productId, rowId) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === rowId
          ? { ...row, isLoadingVariants: true, variant: null, variantOptions: [] }
          : row
      )
    );

    try {
      const response = await PrivateAxios.get(`/product/variants/${productId}`);
      const variants = response.data?.data?.variants || [];

      const variantOptions = variants.map((variant, index) => ({
        value: variant.id,
        label: `Variant ${index + 1} - ${variant.weight_per_unit || 0} ${variant.masterUOM?.label || ""}`.trim(),
        variantData: variant,
      }));

      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === rowId
            ? { ...row, isLoadingVariants: false, variantOptions, variant: null }
            : row
        )
      );

      if (variantOptions.length === 0) {
        ErrorMessage("No variants available for selected product");
      }
    } catch (error) {
      console.error("Error fetching product variants:", error);
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === rowId
            ? { ...row, isLoadingVariants: false, variantOptions: [], variant: null }
            : row
        )
      );
      ErrorMessage("Failed to fetch product variants");
    }
  };

  const handleProductChange = (selectedOption, rowId) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              product: selectedOption,
              variant: null,
              variantOptions: [],
              isLoadingVariants: false,
            }
          : row
      )
    );

    if (selectedOption?.value) {
      fetchProductVariants(selectedOption.value, rowId);
    }
  };

  const handleVariantChange = (selectedOption, rowId) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === rowId ? { ...row, variant: selectedOption } : row
      )
    );
  };

  const handleStoreChange = (selectedOption, rowId) => {
    setRows(
      rows.map((row) =>
        row.id === rowId ? { ...row, store: selectedOption } : row
      )
    );
  };

  const handleQuantityChange = (e, rowId) => {
    const value = e.target.value;
    setRows(
      rows.map((row) =>
        row.id === rowId ? { ...row, quantity: value } : row
      )
    );
  };

  const handleBufferSizeChange = (e, rowId) => {
    const value = e.target.value;
    // Allow only numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setRows(
      rows.map((row) =>
        row.id === rowId ? { ...row, buffer_size: numericValue } : row
      )
    );
  };

  // Validate all rows before submission
  const validateRows = () => {
    const errors = {};
    let isValid = true;

    rows.forEach((row, index) => {
      const rowErrors = {};

      // Validate product
      if (!row.product || !row.product.value) {
        rowErrors.product = "Product is required";
        isValid = false;
      }

      // Validate store
      if (!row.store || !row.store.value) {
        rowErrors.store = "Store is required";
        isValid = false;
      }

      // Validate variant
      if (!row.variant || !row.variant.value) {
        rowErrors.variant = "Variant is required";
        isValid = false;
      }

      // Validate quantity
      if (!row.quantity || row.quantity.trim() === "") {
        rowErrors.quantity = "Quantity is required";
        isValid = false;
      } else {
        const quantity = parseFloat(row.quantity);
        if (isNaN(quantity) || quantity < 0) {
          rowErrors.quantity = "Quantity must be a positive number";
          isValid = false;
        }
      }

      if (Object.keys(rowErrors).length > 0) {
        errors[row.id] = rowErrors;
      }
    });

    setRowErrors(errors);
    return isValid;
  };

  const handleDownloadSample = () => {
    const link = document.createElement("a");
    link.href = SAMPLE_CSV_URL;
    link.download = "sample_bulk_add_to_stock.csv";
    link.click();
  };

  const handleBulkFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await PrivateAxiosFile.post("/product/bulk-add-to-stock", formData);
      if (response.status === 200 || response.status === 201) {
        SuccessMessage(response.data?.message || "Bulk add to stock completed successfully.");
        setRows([
          {
            id: 1,
            product: null,
            variant: null,
            variantOptions: [],
            isLoadingVariants: false,
            store: null,
            quantity: "",
            buffer_size: "",
          },
        ]);
        setRowErrors({});
      }
    } catch (error) {
      console.error("Bulk add to stock error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Bulk add to stock failed. Please try again.";
      ErrorMessage(errorMessage);
    } finally {
      setBulkUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    // Validate all rows
    if (!validateRows()) {
      ErrorMessage("Please fill all required fields correctly");
      return;
    }

    // Transform rows data to API payload format
    const payload = rows.map((row) => ({
      product_id: row.product.value,
      product_variant_id: row.variant.value,
      warehouse_id: row.store.value,
      quantity: parseFloat(row.quantity),
      buffer_size: row.buffer_size ? parseInt(row.buffer_size, 10) : null
    }));

    setIsSubmitting(true);

    try {
      const response = await PrivateAxios.post("/product/add-to-stock", payload);
      
      if (response.status === 200) {
        SuccessMessage(response.data?.message || "Stock added successfully!");
        
        // Reset form
        setRows([
          {
            id: 1,
            product: null,
            variant: null,
            variantOptions: [],
            isLoadingVariants: false,
            store: null,
            quantity: "",
            buffer_size: "",
          },
        ]);
        setRowErrors({});
        form.resetFields();
      }
    } catch (error) {
      console.error("Error adding stock:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to add stock. Please try again.";
      ErrorMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: "20px" }}>
      <div style={{ marginBottom: "16px" }}>
        <Link to="/inventory/stock-master" style={{ textDecoration: "none" }}>
          <Button type="default" icon={<ArrowLeftOutlined />} style={{ marginBottom: "16px" }}>
            Back to Stock Master
          </Button>
        </Link>
      </div>
      <Card
        title={
          <h3 style={{ margin: 0, fontWeight: 600 }}>Stock Master - Add Stock</h3>
        }
        style={{ marginBottom: "20px" }}
      >
        <div style={{ marginBottom: "16px", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          <Button type="default" icon={<DownloadOutlined />} onClick={handleDownloadSample}>
            Download sample CSV
          </Button>
          <Button
            type="default"
            icon={<UploadOutlined />}
            loading={bulkUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload CSV to bulk add
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={handleBulkFileChange}
          />
          <span className="text-muted" style={{ fontSize: "13px" }}>
            CSV columns: Product Code, Store Name, Quantity
          </span>
        </div>

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          autoComplete="off"
        >
          <div style={{ marginBottom: "20px" }}>
            {rows.map((row, index) => (
              <Card
                key={row.id}
                size="small"
                style={{
                  marginBottom: "16px",
                  backgroundColor: index % 2 === 0 ? "#fafafa" : "#ffffff",
                }}
                // bodyStyle={{ padding: "16px" }}
              >
                <Row gutter={16} align="left">
                  <Col xs={24} sm={24} md={5} lg={5}>
                    <Form.Item
                      label="Select Product"
                      required
                      style={{ marginBottom: 0 }}
                      validateStatus={rowErrors[row.id]?.product ? "error" : ""}
                      help={rowErrors[row.id]?.product}
                    >
                      <Select
                        placeholder="Select product..."
                        value={row.product}
                        onChange={(selectedOption) => {
                          handleProductChange(selectedOption, row.id);
                          // Clear error when product is selected
                          if (rowErrors[row.id]?.product) {
                            const newErrors = { ...rowErrors };
                            delete newErrors[row.id]?.product;
                            if (Object.keys(newErrors[row.id] || {}).length === 0) {
                              delete newErrors[row.id];
                            }
                            setRowErrors(newErrors);
                          }
                        }}
                        onInputChange={(inputValue) => {
                          setProductSearchInput(inputValue);
                        }}
                        options={productOptions}
                        isLoading={isLoadingProducts}
                        isClearable
                        isSearchable
                        components={{ MenuList }}
                        noOptionsMessage={({ inputValue }) =>
                          inputValue
                            ? `No products found for "${inputValue}"`
                            : "Type to search products..."
                        }
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            minHeight: "38px",
                            borderColor: rowErrors[row.id]?.product ? "#ff4d4f" : base.borderColor,
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={24} md={5} lg={5}>
                    <Form.Item
                      label="Select Variant"
                      required
                      style={{ marginBottom: 0 }}
                      validateStatus={rowErrors[row.id]?.variant ? "error" : ""}
                      help={rowErrors[row.id]?.variant}
                    >
                      <Select
                        placeholder={row.product ? "Select variant..." : "Select product first"}
                        value={row.variant}
                        onChange={(selectedOption) => {
                          handleVariantChange(selectedOption, row.id);
                          if (rowErrors[row.id]?.variant) {
                            const newErrors = { ...rowErrors };
                            delete newErrors[row.id]?.variant;
                            if (Object.keys(newErrors[row.id] || {}).length === 0) {
                              delete newErrors[row.id];
                            }
                            setRowErrors(newErrors);
                          }
                        }}
                        options={row.variantOptions || []}
                        isLoading={row.isLoadingVariants}
                        isClearable
                        isSearchable
                        isDisabled={!row.product}
                        noOptionsMessage={() =>
                          row.product
                            ? "No variants found"
                            : "Select product first"
                        }
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: "38px",
                            borderColor: rowErrors[row.id]?.variant ? "#ff4d4f" : base.borderColor,
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={24} md={4} lg={4}>
                    <Form.Item
                      label="Select Store"
                      required
                      style={{ marginBottom: 0 }}
                      validateStatus={rowErrors[row.id]?.store ? "error" : ""}
                      help={rowErrors[row.id]?.store}
                    >
                      <StoreSelect
                        value={row.store}
                        onChange={(selectedOption) => {
                          handleStoreChange(selectedOption, row.id);
                        }}
                        error={rowErrors[row.id]?.store}
                        onErrorClear={() => {
                          if (rowErrors[row.id]?.store) {
                            const newErrors = { ...rowErrors };
                            delete newErrors[row.id]?.store;
                            if (Object.keys(newErrors[row.id] || {}).length === 0) {
                              delete newErrors[row.id];
                            }
                            setRowErrors(newErrors);
                          }
                        }}
                        placeholder="Select Store"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={24} md={4} lg={4}>
                    <Form.Item
                      label="Enter Quantity"
                      required
                      style={{ marginBottom: 0 }}
                      validateStatus={rowErrors[row.id]?.quantity ? "error" : ""}
                      help={rowErrors[row.id]?.quantity}
                    >
                      <Input
                        type="number"
                        placeholder="Enter Quantity"
                        value={row.quantity}
                        onChange={(e) => {
                          handleQuantityChange(e, row.id);
                          // Clear error when quantity is entered
                          if (rowErrors[row.id]?.quantity) {
                            const newErrors = { ...rowErrors };
                            delete newErrors[row.id]?.quantity;
                            if (Object.keys(newErrors[row.id] || {}).length === 0) {
                              delete newErrors[row.id];
                            }
                            setRowErrors(newErrors);
                          }
                        }}
                        min="0"
                        step="0.01"
                        style={{ 
                          height: "38px",
                          borderColor: rowErrors[row.id]?.quantity ? "#ff4d4f" : undefined,
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={24} md={4} lg={4}>
                    <Form.Item
                      label="Buffer Size"
                      style={{ marginBottom: 0 }}
                      validateStatus={rowErrors[row.id]?.buffer_size ? "error" : ""}
                      help={rowErrors[row.id]?.buffer_size}
                    >
                      <Input
                        type="text"
                        placeholder="Enter Buffer Size"
                        value={row.buffer_size}
                        onChange={(e) => {
                          handleBufferSizeChange(e, row.id);
                          // Clear error when buffer size is entered
                          if (rowErrors[row.id]?.buffer_size) {
                            const newErrors = { ...rowErrors };
                            delete newErrors[row.id]?.buffer_size;
                            if (Object.keys(newErrors[row.id] || {}).length === 0) {
                              delete newErrors[row.id];
                            }
                            setRowErrors(newErrors);
                          }
                        }}
                        style={{ 
                          height: "38px",
                          borderColor: rowErrors[row.id]?.buffer_size ? "#ff4d4f" : undefined,
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={24} md={2} lg={2}>
                    <Form.Item label=" " style={{ marginBottom: 0 }}>
                      {rows.length > 1 ? (
                        <Button
                          type="text"
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => handleRemoveRow(row.id)}
                          style={{
                            height: "38px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        />
                      ) : (
                        <div style={{ height: "38px" }} />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            ))}
          </div>

          <Row gutter={16}>
            <Col xs={24} sm={24} md={12} lg={12}>
              <Button
                type="dashed"
                onClick={handleAddRow}
                icon={<PlusOutlined />}
                block
                style={{ marginBottom: "20px", height: "40px" }}
              >
                Add More
              </Button>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isSubmitting}
                disabled={isSubmitting}
                style={{ marginBottom: "20px", height: "40px" }}
                onClick={handleSubmit}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}

export default StockMaster;
