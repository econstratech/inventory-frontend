import React, { useEffect, useState, useCallback } from "react";
import {
  // BrowserRouter as Router,
  // Route,
  // Switch,
  // useHistory,
  Link,
  // Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Table, Alert, Modal, OverlayTrigger, Popover, Tooltip } from "react-bootstrap";
import moment from "moment";
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import { UserAuth } from "../auth/Auth";
import StoreSelect from "../filterComponents/StoreSelect";
import VendorSelect from "../filterComponents/VendorSelect";
import {
  // AllUser,
  // AllCategories,
  // GetTaskRemainder,
  formatDateTimeForMySQL,
} from "../../environment/GlobalApi";
import "../global.css";
import {
  PrivateAxios,
  // PrivateAxiosFile,
} from "../../environment/AxiosInstance";
import ProductDetailsContent from "../CommonComponent/ProductDetailsContent";
import SalesQuotationSelect from "../filterComponents/SalesQuotationSelect";
import { calculateTotalWeight } from "../../utils/weightConverter";



function EditMyPurchase() {
  const { id } = useParams();
  // const [total, setTotal] = useState("");
  const { getGeneralSettingssymbol, isVariantBased } = UserAuth();
  const [selectedOption, setSelectedOption] = useState("");
  // const [isCheckedReminder, setIsCheckedReminder] = useState(false);
  // const [isFileRequired, setIsFileRequired] = useState(false);
  const [error, setError] = useState({});
  const [alert, setAlert] = useState("");
  const [show, setShow] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  // const [catProduct, setCategory] = useState([
  //   { value: "select", label: "-Select-" },
  // ]);
  const [products, setProducts] = useState([]);
  // const [productData, setProductData] = useState([]);
  // const [purchaseName, setPurchaseName] = useState("");
  const [vendorId, setVendor] = useState("");
  const [orderDeadline, setOrderDeadline] = useState("");
  const [vendorReference, setVendorReference] = useState("");
  const [expectedArrival, setExpectedArrival] = useState("");
  const [buyer, setBuyer] = useState("");
  const [sourceDocument, setSourceDocument] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [productsaddi, setProductsaddi] = useState([]);
  const [ProductCompare, setProductCompare] = useState([]);
  const [StatusData, setStatus] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  // Product search functionality (same as MyNewpurchase.js)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productSearchInput, setProductSearchInput] = useState("");
  const [productOptions, setProductOptions] = useState([]);
  const [productPagination, setProductPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);
  const [isPOCompleted, setIsPOCompleted] = useState(false);
  const [purchaseData, setPurchaseData] = useState(null);
  const [existingBatchesModalIndex, setExistingBatchesModalIndex] = useState(null);

  // Variant selection state
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [productVariants, setProductVariants] = useState([]);
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [selectedProductInfo, setSelectedProductInfo] = useState(null);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Ensure currently selected products are present in productOptions
  // This handles the case where an existing product is not in the first page of results
  useEffect(() => {
    if (!products || products.length === 0) return;

    setProductOptions((prevOptions) => {
      const existingIds = new Set(prevOptions.map((opt) => opt.value));
      let updated = false;
      const mergedOptions = [...prevOptions];

      products.forEach((product) => {
        const productId = product.product_id;
        if (!productId || existingIds.has(productId)) return;

        // Build a reasonable label from available data
        const labelParts = [];
        if (product.description) {
          labelParts.push(product.description);
        }
        if (product.product_code) {
          labelParts.push(`(${product.product_code})`);
        }

        const label =
          labelParts.length > 0
            ? labelParts.join(" ")
            : `Product #${productId}`;

        mergedOptions.push({
          value: productId,
          label,
          productData: {
            id: productId,
            product_name: product.description || label,
            regular_buying_price: product.unit_price,
            tax: product.tax,
          },
        });

        existingIds.add(productId);
        updated = true;
      });

      return updated ? mergedOptions : prevOptions;
    });
  }, [products]);

  const handlePurchaseOrderChange = (selectedOption) => {
    setError({ ...error, deliveryLocation: "" });
    setDeliveryLocation(selectedOption);
  };

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
        const options = productData.rows.map((item) => {
          let label = `${item.product_name || "N/A"} (${item.product_code || "N/A"})`;
          if (item.productAttributeValues && item.productAttributeValues.length > 0) {
            for (const attrValue of item.productAttributeValues) {
              label += `, ${attrValue.productAttribute.name}: ${attrValue.value}`;
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
      setHasInitialLoaded(true);
    }
  }, []);

  // Debounced search handler - reset to page 1 on search
  useEffect(() => {
    // Only trigger search after initial load and when user types something
    const timeoutId = setTimeout(() => {
      if (hasInitialLoaded) {
        loadProducts(productSearchInput || "", 1);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [productSearchInput, hasInitialLoaded, loadProducts]);

  // Load initial products on mount only once
  useEffect(() => {
    if (!hasInitialLoaded) {
      loadProducts();
    }
  }, [hasInitialLoaded, loadProducts]);

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

  const PriceCompare = async () => {
    try {
      const response = await PrivateAxios.get(
        `/purchase/getPurchasecompare/${id}`
      ); // Adjust the URL to your API endpoint

      if (response.status === 200) {
        setProductCompare(response.data);

      }
    } catch (error) {
      console.error("There was an error fetching the product list!", error);
    }
  };


  const handleStatusChange = async (id, sid) => {
    const response = await PrivateAxios.put(`purchase/statuschange/${id}/${sid}`);
    // const jsonData = response.data;
    if (response.status === 200) {
      SuccessMessage('Order Confirm Successfully.!');
      setShowPrice(true);
      PriceCompare();
    }

  }

  const fetchData = async () => {
    try {
      const response = await PrivateAxios.get(`/purchase/purchase/${id}`);
      const data = response.data;
      setPurchaseData(data);

      //check if PO is completed
      if (data.status === 10) {
        setIsPOCompleted(true);
      }

      setVendor({ vendor_id: data.vendor_id });
      // setOrderDeadline(data.order_dateline);
      setVendorReference(data.vendor_reference);
      setExpectedArrival(data.expected_arrival);
      // setBuyer(data.createdBy.name);
      setSelectedQuotation(data.sale_id);
      // setSourceDocument(data.source_document);
      // setPaymentTerms(data.payment_terms);
      setDeliveryLocation({ value: data.warehouse.id, label: data.warehouse.name });
      const recalculatedProducts = data.products.map((product) => {
        const qty = parseFloat(product.qty) || 0;
        const unit_price = parseFloat(product.unit_price) || 0;
        const tax = parseFloat(product.tax) || 0;

        const taxExcl = qty * unit_price;
        const taxAmount = (taxExcl * tax) / 100;
        const taxIncl = taxExcl + taxAmount;

        // Include variant data if available
        const variantData = product.productVariant || null;
        const variant_id = product.variant_id || product.productVariant?.id || null;
        const existingBatches = Array.isArray(product.batches) ? product.batches : [];

        const rowForPack = { qty: product.qty, variantData };
        return {
          ...product,
          taxExcl,
          taxAmount,
          taxIncl,
          variant_id,
          variantData,
          existingBatches,
          master_pack: computeMasterPackString(rowForPack),
        };
      });
      setProducts(recalculatedProducts);

      setStatus(data.status);
      // fetchProducts(data.id, data.vendor_id);

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    PriceCompare();
    fetchData();
  }, []);
  // console.log(orderDeadline);
  const calculateTotal = () => {
    let untaxedAmount = 0;
    let totalTaxAmount = 0;

    products.forEach((product) => {
      const qty = parseFloat(product.qty) || 0;
      const unitPrice = parseFloat(product.unit_price) || 0;
      const taxRate = parseFloat(product.tax) || 0;

      const lineSubtotal = qty * unitPrice;
      const lineTax = (lineSubtotal * taxRate) / 100;

      untaxedAmount += lineSubtotal;
      totalTaxAmount += lineTax;
    });

    const sgst = totalTaxAmount / 2;
    // const cgst = totalTaxAmount / 2;
    const totalAmount = untaxedAmount + totalTaxAmount;

    return {
      untaxedAmount,
      taxAmount: sgst, // for display and payload
      totalAmount,
    };
  };

  // Recompute the row's master_pack string from its current qty + variant's
  // quantity_per_pack. Keeps the Master Pack input in sync whenever qty changes
  // from a non-master-pack path (direct qty edit, variant selection, hydration).
  const computeMasterPackString = (row) => {
    const qpp = parseFloat(row?.variantData?.quantity_per_pack);
    const qty = parseFloat(row?.qty);
    if (!Number.isFinite(qpp) || qpp <= 0 || !Number.isFinite(qty)) return "";
    return String(Number((qty / qpp).toFixed(3)));
  };

  const handleMasterPackChange = (index, rawValue) => {
    const numericValue = String(rawValue).replace(/[^0-9.]/g, "");
    setProducts((prev) => {
      const next = [...prev];
      const current = { ...next[index], master_pack: numericValue };
      const mp = parseFloat(numericValue);
      const qpp = parseFloat(current?.variantData?.quantity_per_pack);

      if (Number.isFinite(mp) && Number.isFinite(qpp) && qpp > 0) {
        current.qty = Number((mp * qpp).toFixed(3));
      }

      const qty = parseFloat(current.qty) || 0;
      const unit_price = parseFloat(current.unit_price) || 0;
      const tax = parseFloat(current.tax) || 0;
      const taxExcl = qty * unit_price;
      const taxAmount = (taxExcl * tax) / 100;
      current.taxExcl = taxExcl;
      current.taxAmount = taxAmount;
      current.taxIncl = taxExcl + taxAmount;
      current.vendor_id = vendorId.vendor_id || vendorId;

      next[index] = current;
      return next;
    });
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];

    // Handle product change with auto-fill
    if (field === "product_id") {
      // Find product from productOptions (searchable list)
      const selectedOption = productOptions?.find((option) => option.value === value);
      if (selectedOption && selectedOption.productData) {
        const selectedProduct = selectedOption.productData;
        newProducts[index] = {
          ...newProducts[index],
          product_id: value,
          unit_price: selectedProduct.regular_buying_price || 0,
          tax: selectedProduct.tax || 18,
          description: selectedProduct.product_name || "",
        };
      }
    } else {
      newProducts[index][field] = value;
    }

    if (field === "qty") {
      newProducts[index].master_pack = computeMasterPackString(newProducts[index]);
    }

    // Parse updated values
    const qty = parseFloat(newProducts[index].qty) || 0;
    const unit_price = parseFloat(newProducts[index].unit_price) || 0;
    const tax = parseFloat(newProducts[index].tax) || 0;

    // Recalculate tax fields
    const taxExcl = qty * unit_price;
    const taxAmount = (taxExcl * tax) / 100;
    const taxIncl = taxExcl + taxAmount;

    newProducts[index].taxExcl = taxExcl;
    newProducts[index].taxAmount = taxAmount;
    newProducts[index].taxIncl = taxIncl;
    newProducts[index].vendor_id = vendorId.vendor_id || vendorId;

    setProducts(newProducts);
  };


  const addProduct = () => {
    setProducts([
      ...products,
      {
        product_id: "",
        description: "",
        qty: 1,
        unit_price: 0,
        vendor_id: vendorId.vendor_id,
        tax: 18,
        variant_id: null,
        variantData: null,
        existingBatches: [],
        taxExcl: 0, // Initialize taxExcl as a number
        master_pack: "",
      },
    ]);
  };

  const removeProduct = (index) => {
    if (products.length === 1) {
      setAlert("You cannot delete the last item.");
      return;
    }
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);
  };

  // Fetch product variants
  const fetchProductVariants = async (productId, productIndex, productData) => {
    setLoadingVariants(true);
    try {
      const response = await PrivateAxios.get(`/product/variants/${productId}`);
      if (response.data && response.data.status && response.data.data?.variants?.length > 0) {
        setProductVariants(response.data.data.variants);
        setSelectedProductIndex(productIndex);
        // Store product info from response
        if (response.data.data?.product) {
          setSelectedProductInfo(response.data.data.product);
        } else if (productData) {
          setSelectedProductInfo({
            product_name: productData.product_name,
            product_code: productData.product_code,
          });
        }
        setShowVariantModal(true);
      } else {
        // No variants found - proceed without variant selection
        const newProducts = [...products];
        newProducts[productIndex] = {
          ...newProducts[productIndex],
          variant_id: null,
          variantData: null,
        };
        setProducts(newProducts);
      }
    } catch (error) {
      console.error("Error fetching variants:", error);
      ErrorMessage("Failed to fetch product variants");
      // Proceed without variant selection on error
      const newProducts = [...products];
      newProducts[productIndex] = {
        ...newProducts[productIndex],
        variant_id: null,
        variantData: null,
      };
      setProducts(newProducts);
    } finally {
      setLoadingVariants(false);
    }
  };

  // Handle variant selection
  const handleVariantSelect = (variant) => {
    if (selectedProductIndex === null) return;
    
    const newProducts = [...products];
    newProducts[selectedProductIndex] = {
      ...newProducts[selectedProductIndex],
      variant_id: variant.id,
      variantData: variant, // Store variant data for display
    };
    
    // Recalculate tax fields
    const qty = parseFloat(newProducts[selectedProductIndex].qty) || 0;
    const unitPrice = parseFloat(newProducts[selectedProductIndex].unit_price) || 0;
    const tax = parseFloat(newProducts[selectedProductIndex].tax) || 0;
    
    const taxExcl = qty * unitPrice;
    const taxAmount = (taxExcl * tax) / 100;
    const taxIncl = taxExcl + taxAmount;
    
    newProducts[selectedProductIndex].taxExcl = taxExcl;
    newProducts[selectedProductIndex].taxAmount = taxAmount;
    newProducts[selectedProductIndex].taxIncl = taxIncl;
    newProducts[selectedProductIndex].master_pack = computeMasterPackString(
      newProducts[selectedProductIndex]
    );

    setProducts(newProducts);

    // Close modal
    setShowVariantModal(false);
    setProductVariants([]);
    setSelectedProductIndex(null);
    setSelectedProductInfo(null);
  };

  // Handle variant modal close
  const handleVariantModalClose = () => {
    setShowVariantModal(false);
    setProductVariants([]);
    setSelectedProductIndex(null);
    setSelectedProductInfo(null);
  };

  // Get current variant for a product
  const getCurrentVariant = (product) => {
    // If variantData is stored in product, use it
    if (product?.variantData) {
      return product.variantData;
    }
    
    // Return null if no variant selected
    return null;
  };

  // Get current selected variant ID for highlighting
  const getCurrentSelectedVariantId = () => {
    if (selectedProductIndex === null || !products || products.length === 0) return null;
    
    const product = products[selectedProductIndex];
    const currentVariant = getCurrentVariant(product);
    
    return currentVariant?.id || null;
  };

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Validate form (same as MyNewpurchase.js)
  const validateForm = () => {
    // Reset error
    setError({});

    // Validate vendor
    if (!vendorId || (typeof vendorId === 'object' && vendorId.vendor_id === "") || (typeof vendorId === 'string' && vendorId === "")) {
      setError({ ...error, vendor: "Please select a vendor." });
      ErrorMessage("Please select a vendor.");
      return false;
    }

    // Validate delivery location
    if (!deliveryLocation || deliveryLocation.value === "") {
      setError({ ...error, deliveryLocation: "Please select a delivery location." });
      ErrorMessage("Please select a delivery location.");
      return false;
    }

    // Validate expected arrival
    if (!expectedArrival || expectedArrival === "") {
      setError({ ...error, expectedArrival: "Please select an expected arrival date and time." });
      ErrorMessage("Please select an expected arrival date and time.");
      return false;
    }

    // Validate products
    if (products.length === 0 || (products.length === 1 && (!products[0].product_id || products[0].product_id === ""))) {
      setError({ ...error, products: "Please add at least one product to the request for quotation." });
      ErrorMessage("Please add at least one product to the request for quotation.");
      return false;
    }

    // Validate each product has required fields
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (!product.product_id || product.product_id === "") {
        setError({ ...error, products: `Product ${i + 1}: Please select a product.` });
        ErrorMessage(`Product ${i + 1}: Please select a product.`);
        return false;
      }
      if (!product.qty || parseFloat(product.qty) <= 0) {
        setError({ ...error, products: `Product ${i + 1}: Please enter a valid quantity.` });
        ErrorMessage(`Product ${i + 1}: Please enter a valid quantity.`);
        return false;
      }
      if (!product.unit_price || parseFloat(product.unit_price) < 0) {
        setError({ ...error, products: `Product ${i + 1}: Please enter a valid unit price.` });
        ErrorMessage(`Product ${i + 1}: Please enter a valid unit price.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate form before submitting
      if (!validateForm()) {
        return;
      }

      const { untaxedAmount, taxAmount, totalAmount } = calculateTotal();
      const updatedProducts = products.map((product) => ({
        id: product.id,
        product_id: product.product_id,
        product_variant_id: product.variant_id,
        qty: parseFloat(product.qty) || 0,
        unit_price: parseFloat(product.unit_price) || 0,
        tax: parseFloat(product.tax) || 0,
        description: product.description || "",
        vendor_id: vendorId.vendor_id || vendorId,
        variant_id: product.variant_id || null,
      }));
      const vendorIdValue = typeof vendorId === 'object' ? vendorId.vendor_id : vendorId;
      
      const data = {
        vendor_id: vendorIdValue,
        // vendor_reference: vendorReference,
        // order_dateline: orderDeadline,
        expected_arrival: formatDateTimeForMySQL(expectedArrival),
        warehouse_id: deliveryLocation.value,
        ...(selectedQuotation && { sale_id: selectedQuotation.id }),
        products: updatedProducts,
        untaxed_amount: untaxedAmount.toFixed(2),
        sgst: taxAmount.toFixed(2), 
        cgst: taxAmount.toFixed(2),
        total_amount: totalAmount.toFixed(2),
      };

      const response = await PrivateAxios.put(`purchase/update/${id}`, data);

      if (response.status === 200) {
        SuccessMessage("Purchase order has been successfully updated.");
        navigate("/operation/create-rfq-active");
      } else {
        console.log(response.status);
        ErrorMessage("Failed to update purchase order");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const navigate = useNavigate();
  const handleClick = async (e) => {
    e.preventDefault();
    try {
      const { untaxedAmount, taxAmount, totalAmount } = calculateTotal();
      const updatedProducts = products.map((product) => ({
        ...product,
        vendor_id: selectedOption.vendor_id_add,
      }));
      const data = {
        vendor_id: selectedOption.vendor_id_add,
        vendor_reference: vendorReference,
        is_parent_id: vendorId.vendor_id,
        is_parent: "0",
        parent_recd_id: id,
        order_dateline: orderDeadline,
        expected_arrival: formatDateTimeForMySQL(expectedArrival),
        buyer,
        source_document: sourceDocument,
        payment_terms: paymentTerms,
        products: updatedProducts,
        untaxed_amount: untaxedAmount.toFixed(2),
        sgst: taxAmount.toFixed(2),
        cgst: taxAmount.toFixed(2),
        total_amount: totalAmount.toFixed(2),
      };



      const response = await PrivateAxios.post(`purchase/add_addi`, data);

      if (response.status === 201) {
        SuccessMessage("Data Updated Successfully.");
        setShow(false);
        // fetchProducts(id, vendorId.vendor_id);

      } else {

        ErrorMessage("Failed to save data");
        console.error("Failed to save data");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const getStatus = (status) => {
    if (status === 1) {
      return 'Active';
    } else if (status === 2) {
      return 'RFQ';
    } else if (status === 3) {
      return 'Send to management';
    } else if (status === 4) {
      return 'Review Confirmed';
    } else if (status === 5) {
      return 'Order Confirm';
    } else if (status === 6) {
      return 'Fully Billed';
    } else if (status === 7) {
      return 'Payment Done';
    }
  };

  return (
    <React.Fragment>
      <div className="p-4">
        <div className="mb-4">
          {/* <Link to="/purchase" className="text-dark">
        <i class="fas fa-arrow-left me-1"></i>
        <span class="ms-2 f-s-16">Back</span>
        </Link> */}
          <button
            type="button"
            className="link-btn text-dark "
            onClick={() => navigate(-1)} // Navigate back in history
          >
            <i className="fas fa-arrow-left me-1" />
            <span className="ms-2 f-s-16">Back</span>
          </button>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Edit Purchase Order</h3>
          </div>

          <form onSubmit={handleSubmit} method="post">
            <div className="card-body pb-1">
              <div className="row">
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Vendor</label>
                    <div className="custom-select-wrap">
                      <VendorSelect
                        value={
                          vendorId && (typeof vendorId === "object" ? vendorId.vendor_id : vendorId)
                            ? { id: typeof vendorId === "object" ? vendorId.vendor_id : vendorId }
                            : null
                        }
                        onChange={(e) => {
                          setVendor({ vendor_id: e?.id ?? "" });
                          if (error.vendor) {
                            const newErrors = { ...error };
                            delete newErrors.vendor;
                            setError(newErrors);
                          }
                        }}
                        placeholder="Search and select vendor..."
                        error={error.vendor}
                        onErrorClear={() => {
                          if (error.vendor) {
                            const newErrors = { ...error };
                            delete newErrors.vendor;
                            setError(newErrors);
                          }
                        }}
                      />
                      {error.vendor && (
                        <small className="text-danger d-block mt-1">{error.vendor}</small>
                      )}
                    </div>
                  </div>
                </div>

                {/* <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label date-label">Order Deadline </label>
      
                    <div className="exp-datepicker-cont">
                      <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                      <DatePicker
                        selected={orderDeadline ? new Date(orderDeadline) : null}
                        onChange={(date) => setOrderDeadline(date ? date.toISOString() : "")}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        timeIntervals={15}
                        dateFormat="dd/MM/yyyy hh:mm aa"
                        placeholderText="Select Date and Time"
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                </div> */}
                {/* <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Vendor Reference</label>
                    <input
                      type="text"
                      value={vendorReference}
                      onChange={(e) => setVendorReference(e.target.value)}
                      placeholder="Vendor Reference"
                      className="form-control"
                    />
                  </div>
                </div> */}

                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Delivery Location</label>
                    <div className="custom-select-wrap">
                      <StoreSelect
                        value={deliveryLocation}
                        onChange={(selectedOption) => {
                          handlePurchaseOrderChange(selectedOption);
                        }}
                        error={error.purchaseOrder}
                        onErrorClear={() => setError({ ...error, purchaseOrder: "" })}
                        placeholder="Select Store"
                      />
                      {error?.deliveryLocation && <div className="text-danger f-s-14">{error.deliveryLocation}</div>}
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label date-label">Expected Arrival</label>
                    <div className="exp-datepicker-cont">
                      <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                      <DatePicker
                        selected={expectedArrival ? new Date(expectedArrival) : null}
                        onChange={(date) => {
                          setExpectedArrival(date ? date.toISOString() : "");
                          // Clear expected arrival error when date is selected
                          if (error.expectedArrival) {
                            const newErrors = { ...error };
                            delete newErrors.expectedArrival;
                            setError(newErrors);
                          }
                        }}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        timeIntervals={15}
                        dateFormat="dd/MM/yyyy hh:mm aa"
                        placeholderText="Select Date and Time"
                        className={`form-control ${error.expectedArrival ? 'border-danger' : ''}`}
                      />
                      {error.expectedArrival && (
                        <small className="text-danger d-block mt-1">{error.expectedArrival}</small>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Sell Order No.</label>
                    <div className="custom-select-wrap">
                      <SalesQuotationSelect
                        value={selectedQuotation}
                        onChange={(selectedOption) => {
                          setSelectedQuotation(selectedOption);
                          setError({ ...error, sellOrderNo: "" });
                        }}
                        placeholder="Search and select sales quotation..."
                        error={error.sellOrderNo}
                        onErrorClear={() => setError({ ...error, sellOrderNo: "" })}
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            minHeight: "38px",
                            borderColor: error.sellOrderNo ? "#ff4d4f" : base.borderColor,
                          }),
                        }}
                        theme={(theme) => ({
                          ...theme,
                          colors: {
                            ...theme.colors,
                            primary25: "#ddddff",
                            primary: "#6161ff",
                          },
                        })}
                      />
                      {error?.sellOrderNo && <div className="text-danger f-s-14">{error.sellOrderNo}</div>}
                    </div>
                  </div>
                </div>

              </div>

              <div className="col-12 mt-4">
                {purchaseData?.recv && Array.isArray(purchaseData.recv) && purchaseData.recv.length > 0 && (
                  <div className="col-12 mb-3">
                    <h5 className="mb-3">Previous received</h5>
                    {purchaseData.recv.map((rec, idx) => (
                      <div key={rec.id || idx} className="card mb-3 shadow-sm">
                        <div className="card-header py-3 px-3 bg-light">
                          <div className="row g-3 align-items-center" style={{ fontSize: "15px" }}>
                            <div className="col-md-4 col-12">
                              <span className="text-muted d-block mb-0" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Bill No.</span>
                              <span className="fw-medium">{rec.bill_number ?? "—"}</span>
                            </div>
                            <div className="col-md-4 col-12">
                              <span className="text-muted d-block mb-0" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Received By</span>
                              <span className="fw-medium">{rec.receivedBy?.name ?? "—"}</span>
                            </div>
                            <div className="col-md-4 col-12">
                              <span className="text-muted d-block mb-0" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Received On</span>
                              <span className="fw-medium">{rec.bill_date ? moment(rec.bill_date).format("DD/MM/YYYY") : "—"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="card-body p-0">
                          <Table responsive bordered size="sm" className="mb-0 primary-table-head">
                            <thead>
                              <tr>
                                <th>Product Name</th>
                                <th>Product Code</th>
                                <th>Received Quantity</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Array.isArray(rec.receivedProducts) && rec.receivedProducts.length > 0 ? (
                                rec.receivedProducts.map((rp) => (
                                  <tr key={rp.id}>
                                    <td>{rp.product?.product_name ?? "—"}</td>
                                    <td>{rp.product?.product_code ?? "—"}</td>
                                    <td>{rp.qty ?? 0}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={3} className="text-muted">No products</td>
                                </tr>
                              )}
                            </tbody>
                          </Table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="w-100">
                  <ul class="nav nav-tabs gth-tabs" id="myTab" role="tablist">
                    <li class="nav-item" role="presentation">
                      <button
                        class="nav-link active"
                        id="personal-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#personal"
                        type="button"
                        role="tab"
                        aria-controls="personal"
                        aria-selected="true"
                      >
                        Products
                      </button>
                    </li>
                    <li class="nav-item" role="presentation">
                      <button
                        class="nav-link"
                        id="employment-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#employment"
                        type="button"
                        role="tab"
                        aria-controls="employment"
                        aria-selected="false"
                      >
                        Alternative
                      </button>
                    </li>
                  </ul>
                  <div class="tab-content pt-3" id="myTabContent">
                    <div
                      class="tab-pane fade show active"
                      id="personal"
                      role="tabpanel"
                      aria-labelledby="personal-tab"
                    >
                      {alert && <Alert variant="danger">{alert}</Alert>}
                      {error.products && (
                        <Alert variant="danger" className="mb-2">
                          {error.products}
                        </Alert>
                      )}
                      <div className="table-responsive">
                        <Table responsive className="table-bordered primary-table-head" style={{ minWidth: "1680px" }}>
                          <thead>
                            <tr>
                              <th style={{ width: "300px" }}>Product</th>
                              <th style={{ width: "130px" }}>Quantity</th>
                              {isVariantBased && (
                                <>
                                  <th style={{ width: "170px" }}>Weight Per Unit</th>
                                  <th style={{ width: "150px" }}>Total Weight</th>
                                </>
                              )}
                              {products.some(
                                (p) => Number(p?.ProductsItem?.has_master_pack) === 1
                              ) && (
                                <th style={{ width: "150px" }}>Master Pack</th>
                              )}
                              <th style={{ width: "130px" }}>Unit Price</th>
                              <th style={{ width: "120px" }}>Taxes (%)</th>
                              <th style={{ width: "140px" }}>Tax Excl.</th>
                              <th style={{ width: "140px" }}>Tax Amt.</th>
                              <th style={{ width: "140px" }}>Total Amount</th>
                              <th style={{ width: "120px" }}>Batches</th>
                              {!isPOCompleted && (
                                <th style={{ width: "80px" }}>Actions</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {products.map((product, index) => (
                              <tr key={index}>
                                <td>
                                  <div style={{ minWidth: "250px" }} className="d-flex align-items-center gap-2">
                                    <div style={{ flex: 1 }}>
                                      <Select
                                        placeholder="Search and select product..."
                                        value={
                                          productOptions.find(
                                            (option) =>
                                              String(option.value) === String(product.product_id)
                                          ) ||
                                          (product?.product_id
                                            ? {
                                                value: product.product_id,
                                                label: `${
                                                  product?.ProductsItem?.product_name ||
                                                  product?.description ||
                                                  "Selected product"
                                                }${
                                                  product?.ProductsItem?.product_code || product?.product_code
                                                    ? ` (${product?.ProductsItem?.product_code || product?.product_code})`
                                                    : ""
                                                }`,
                                                productData: product?.ProductsItem || null,
                                              }
                                            : null)
                                        }
                                        onChange={(selectedOption) => {
                                          if (selectedOption) {
                                            const selectedProduct = selectedOption.productData;
                                            handleProductChange(index, "product_id", selectedOption.value);
                                            // Update unit_price and tax from selected product
                                            if (selectedProduct) {
                                              const newProducts = [...products];
                                              newProducts[index] = {
                                                ...newProducts[index],
                                                product_id: selectedOption.value,
                                                unit_price: selectedProduct.regular_buying_price || 0,
                                                tax: selectedProduct.tax || 18,
                                                description: selectedProduct.product_name || "",
                                                product_code: selectedProduct.product_code || selectedProduct.ProductsItem?.product_code || "",
                                                ProductsItem: selectedProduct,
                                                variant_id: null,
                                                variantData: null,
                                              existingBatches: [],
                                              master_pack: "",
                                              };
                                              
                                              const qty = parseFloat(newProducts[index].qty) || 0;
                                              const unitPrice = parseFloat(newProducts[index].unit_price) || 0;
                                              const taxRate = parseFloat(newProducts[index].tax) || 0;
                                              
                                              const taxExcl = qty * unitPrice;
                                              const taxAmount = (taxExcl * taxRate) / 100;
                                              const taxIncl = taxExcl + taxAmount;
                                              
                                              newProducts[index].taxExcl = taxExcl;
                                              newProducts[index].taxAmount = taxAmount;
                                              newProducts[index].taxIncl = taxIncl;
                                              newProducts[index].vendor_id = vendorId.vendor_id || vendorId;
                                              
                                              setProducts(newProducts);
                                              
                                              // Clear product error when product is selected
                                              if (error.products) {
                                                const newErrors = { ...error };
                                                delete newErrors.products;
                                                setError(newErrors);
                                              }

                                              // Fetch variants for the selected product only if the company is set with variant based
                                              if (isVariantBased) {
                                                fetchProductVariants(selectedOption.value, index, selectedProduct);
                                              }
                                            }
                                          } else {
                                            // Handle clear selection
                                            const newProducts = [...products];
                                            newProducts[index] = {
                                              ...newProducts[index],
                                              product_id: "",
                                              unit_price: 0,
                                              tax: 18,
                                              ProductsItem: null,
                                              variant_id: null,
                                              variantData: null,
                                              existingBatches: [],
                                              master_pack: "",
                                            };
                                            setProducts(newProducts);
                                          }
                                        }}
                                        onInputChange={(inputValue) => {
                                          setProductSearchInput(inputValue);
                                        }}
                                        options={productOptions}
                                        isLoading={isLoadingProducts}
                                        isClearable
                                        isSearchable
                                        isDisabled={isPOCompleted}
                                        filterOption={() => true}
                                        components={{ MenuList: ProductsMenuList }}
                                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                        menuPosition="fixed"
                                        noOptionsMessage={({ inputValue }) =>
                                          inputValue
                                            ? `No products found for "${inputValue}"`
                                            : "Type to search products..."
                                        }
                                        styles={{
                                          control: (base, state) => ({
                                            ...base,
                                            minHeight: "38px",
                                            borderColor: error.products && !product.product_id ? "#ff4d4f" : base.borderColor,
                                          }),
                                          menuPortal: (base) => ({
                                            ...base,
                                            zIndex: 9999,
                                          }),
                                          menu: (base) => ({
                                            ...base,
                                            zIndex: 9999,
                                          }),
                                        }}
                                      />
                                      {/* {!productOptions.some(
                                        (option) => String(option.value) === String(product.product_id)
                                      ) &&
                                        product?.product_id && (
                                          <small className="text-muted d-block mt-1">
                                            Selected product unavailable in list. Search to change.
                                          </small>
                                        )} */}
                                      {error.products && !product.product_id && (
                                        <small className="text-danger">{error.products}</small>
                                      )}
                                    </div>

                                    {product.product_id && (
                                      <OverlayTrigger
                                        trigger="click"
                                        placement="left"
                                        rootClose
                                        overlay={
                                          <Popover id={`product-details-${index}`} style={{ maxWidth: "450px" }}>
                                            <Popover.Header as="h6" className="d-flex align-items-center">
                                              <i className="fas fa-info-circle text-primary me-2"></i>
                                              Product Details
                                            </Popover.Header>
                                            <Popover.Body style={{ maxHeight: "500px", overflowY: "auto" }}>
                                              <ProductDetailsContent
                                                productData={
                                                  product?.ProductsItem ||
                                                  productOptions.find(
                                                    (option) =>
                                                      String(option.value) === String(product.product_id)
                                                  )?.productData ||
                                                  {
                                                    id: product.product_id,
                                                    product_name: product?.description || "Selected product",
                                                    product_code: product?.product_code || "",
                                                    regular_buying_price: product?.unit_price || 0,
                                                    tax: product?.tax || 18,
                                                  }
                                                }
                                              />
                                            </Popover.Body>
                                          </Popover>
                                        }
                                      >
                                        <span
                                          role="button"
                                          tabIndex={0}
                                          className="text-primary"
                                          style={{ cursor: "pointer", flexShrink: 0 }}
                                          title="View product details"
                                          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.click()}
                                        >
                                          <i className="fas fa-info-circle fa-lg"></i>
                                        </span>
                                      </OverlayTrigger>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <div style={{ minWidth: "120px" }}>
                                    <input
                                      type="number"
                                      name="qty"
                                      value={product.qty}
                                      disabled={isPOCompleted}
                                      onChange={(e) =>
                                        handleProductChange(
                                          index,
                                          "qty",
                                          e.target.value
                                        )
                                      }
                                      className="form-control"
                                    />
                                  </div>
                                </td>
                                {isVariantBased && (
                                  <>
                                    <td>
                                      <div className="d-flex align-items-center gap-2" style={{ minWidth: "160px" }}>
                                        <span>
                                          {(() => {
                                            const currentVariant = getCurrentVariant(product);
                                            return currentVariant 
                                              ? `${currentVariant.weight_per_unit} ${currentVariant.masterUOM?.label || ''}`
                                              : 'N/A';
                                          })()}
                                        </span>
                                        {product.product_id && !isPOCompleted && (
                                          <div 
                                            className="btn-sm cursor-pointer"
                                            onClick={() => fetchProductVariants(product.product_id, index, product.ProductsItem)}
                                            title="Click to change variant"
                                          >
                                            <i className="fas fa-edit" style={{ color: "#007bff" }}></i>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td>
                                      <div style={{ minWidth: "130px" }}>
                                        {(() => {
                                          const currentVariant = getCurrentVariant(product);
                                          if (currentVariant && currentVariant.weight_per_unit && currentVariant.masterUOM?.label) {
                                            const totalWeightResult = calculateTotalWeight(
                                              product.qty,
                                              currentVariant.weight_per_unit,
                                              currentVariant.masterUOM.label
                                            );
                                            return totalWeightResult.display || 'N/A';
                                          }
                                          return 'N/A';
                                        })()}
                                      </div>
                                    </td>
                                  </>
                                )}
                                {products.some(
                                  (p) => Number(p?.ProductsItem?.has_master_pack) === 1
                                ) && (
                                  <td>
                                    <div style={{ minWidth: "140px" }}>
                                      {Number(product?.ProductsItem?.has_master_pack) === 1 &&
                                      Number(product?.variantData?.quantity_per_pack) > 0 ? (
                                        <div className="input-group">
                                          <input
                                            type="number"
                                            className="form-control"
                                            min="0"
                                            step="0.001"
                                            placeholder="0"
                                            disabled={isPOCompleted}
                                            value={product.master_pack ?? ""}
                                            onChange={(e) =>
                                              handleMasterPackChange(index, e.target.value)
                                            }
                                          />
                                          <span className="input-group-text">unit</span>
                                        </div>
                                      ) : (
                                        <span className="text-muted">—</span>
                                      )}
                                    </div>
                                  </td>
                                )}
                                <td>
                                  <div style={{ minWidth: "120px" }}>
                                    <input
                                      type="number"
                                      name="unit_price"
                                      value={product.unit_price}
                                      disabled={isPOCompleted}
                                      onChange={(e) =>
                                        handleProductChange(
                                          index,
                                          "unit_price",
                                          e.target.value
                                        )
                                      }
                                      className="form-control"
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div style={{ minWidth: "110px" }}>
                                    <input
                                      type="number"
                                      name="tax"
                                      value={product.tax}
                                      disabled={isPOCompleted}
                                      onChange={(e) =>
                                        handleProductChange(
                                          index,
                                          "tax",
                                          e.target.value
                                        )
                                      }
                                      className="form-control"
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div style={{ minWidth: "120px" }}>
                                    {Number(product.taxExcl).toFixed(2) || 0}
                                  </div>
                                </td>
                                <td>
                                  <div style={{ minWidth: "120px" }}>
                                    <input
                                      type="number"
                                      className="form-control"
                                      value={Number(product.taxAmount || 0).toFixed(2)}
                                      disabled
                                      onChange={(e) => handleProductChange(index, 'tax', e.target.value)}
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div style={{ minWidth: "120px" }}>
                                    {Number(product.taxIncl).toFixed(2) || 0}
                                  </div>
                                </td>
                                <td className="align-middle">
                                  {(product.existingBatches || []).length > 0 ? (
                                    <span
                                      role="button"
                                      tabIndex={0}
                                      className="text-primary d-inline-flex align-items-center"
                                      style={{ cursor: "pointer", fontSize: "0.875rem" }}
                                      title="View batches"
                                      onClick={() => setExistingBatchesModalIndex(index)}
                                      onKeyDown={(e) => e.key === "Enter" && setExistingBatchesModalIndex(index)}
                                    >
                                      <i className="fas fa-list-alt me-1"></i>
                                      <span className="badge bg-secondary" style={{ fontSize: "0.7rem", padding: "0.15rem 0.35rem", minWidth: "auto" }}>
                                        {(product.existingBatches || []).length}
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="badge bg-secondary" style={{ fontSize: "0.7rem", padding: "0.15rem 0.35rem", minWidth: "auto" }}>
                                      N/A
                                    </span>
                                  )}
                                </td>
                                {!isPOCompleted && (
                                  <td>
                                    <i
                                      class="fas fa-trash-alt text-danger"
                                      onClick={() => removeProduct(index)}
                                      style={{ cursor: "pointer" }}
                                    ></i>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                      <button type='button' onClick={addProduct} className="btn btn-outline-primary mt-2 btn-sm">
                        <i class="fas fa-plus"></i>
                        <span class="ms-2"> Add Product</span>
                        {/* Add Product */}
                      </button>
                      <div className="col-12 text-right">

                        <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-2">Untaxed Amount : </span>
                          <span className="fw-semibold f-s-16 text-primary-grey-1">{getGeneralSettingssymbol}
                            {calculateTotal().untaxedAmount.toFixed(2)}</span></p>
                        <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-2">SGST : </span>
                          <span className="fw-semibold f-s-16 text-primary-grey-1"> {getGeneralSettingssymbol} {calculateTotal().taxAmount.toFixed(2)}</span></p>
                        <p className="mb-1"><span className="f-s-16 fw-medium text-primary-grey-2">CGST : </span>
                          <span className="fw-semibold f-s-16 text-primary-grey-1"> {getGeneralSettingssymbol} {calculateTotal().taxAmount.toFixed(2)}</span></p>
                        <p className="border-top pt-2"><span className="f-s-20 fw-bold text-primary-grey-2">Total : </span>
                          <span className="fw-bold f-s-20 text-primary-grey-1"> {getGeneralSettingssymbol} {calculateTotal().totalAmount.toFixed(2)}</span>
                        </p>

                      </div>
                    </div>
                    <div
                      class="tab-pane fade"
                      id="employment"
                      role="tabpanel"
                      aria-labelledby="employment-tab"
                    >
                      <div className="row">
                        <div className="col-12">
                          <div className="d-flex p-3 align-items-start">
                            <div className="alternative-text-area">
                              Create a call for tender by adding alternative requests
                              for quotation to different vendors. Make your choice by
                              selecting the best combination of lead time, OTD and/or
                              total amount. By comparing product lines you can also
                              decide to order some products from one vendor and others
                              from another vendor.
                            </div>
                          </div>
                        </div>
                        <div className="col-12 mb-3">
                          {/* <div className="d-flex "> */}
                          {StatusData < 3 ?
                            <button
                              type="button"
                              class="btn btn-outline-success me-2 text-nowrap btn-sm"
                              onClick={() => setShow(true)}
                            >
                              <i class="fas fa-plus"></i>
                              <span class="ms-2"> Create Alternative </span>

                            </button>
                            : <></>
                          }
                          {productsaddi.length > 0 ? (
                            <button
                              type="button"
                              class="btn btn-exp-red btn-sm text-nowrap"
                              onClick={() => {
                                setShowPrice(true);
                                PriceCompare();
                              }}
                            >
                              Compare Price
                            </button>
                          ) : (
                            <p></p>
                          )}
                     
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-12">
                          {productsaddi.length > 0 ? (
                            <div className=" my-3 alternative">
                              <Table responsive className="table-bordered primary-table-head">
                         
                                <thead>
                                  <tr>
                                    <th>Reference Number</th>
                                    <th>Vendor</th>
                                    <th>Expected Arrival</th>
                                    <th>Total Amount</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {productsaddi.map((product) => (
                                    <tr key={product.id}>
                                      <td>
                                        {" "}
                                        <Link to={`/purchase/${product.id}`}>
                                          {product.reference_number}
                                        </Link>
                                      </td>
                                      <td>
                                        {" "}
                                        <Link to={`/purchase/${product.id}`}>
                                          {product.vendor.vendor_name}
                                        </Link>
                                      </td>
                                      <td>
                                        {" "}
                                        <Link to={`/purchase/${product.id}`}>
                                          {new Date(product.expected_arrival)
                                            .toJSON()
                                            .slice(0, 10)}
                                        </Link>
                                      </td>
                                      <td>
                                        {" "}
                                        <Link to={`/purchase/${product.id}`}>
                                          ₹ {product.total_amount}
                                        </Link>
                                      </td>
                                      <td>{getStatus(product.status)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          ) : (
                            <p className="ml-1">
                              <b>No additional vendor found.</b>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
            {/* if PO is not completed, show save button */}
            {!isPOCompleted && (
            <div className="card-footer d-flex justify-content-end">
              <button type="submit" className="btn btn-success">
                Save
              </button>
            </div>
            )}
          </form>
        </div>
      </div>



      <Modal
        backdrop="static"
        show={show}
        size="md"
        centered
        onHide={() => setShow(false)}
        // dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-custom-modal-styling-title">
            Add New Alternative Vendor
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleClick}>
            <div className="row">
              <div className="col-12">
                <div className="form-group">
                  <label className="form-label">Vendor</label>
                  <VendorSelect
                    value={
                      selectedOption?.vendor_id_add
                        ? { id: selectedOption.vendor_id_add }
                        : null
                    }
                    onChange={(e) =>
                      setSelectedOption({ vendor_id_add: e?.id ?? "" })
                    }
                    placeholder="Search and select vendor..."
                  />
                </div>
              </div>
              <div className="col-12">
                <div class=" d-flex justify-content-end pt-3">
                  <button type="submit" class="btn btn-exp-green ">
                    Save
                  </button>
                </div>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <Modal
        backdrop="static"
        centered
        size="xl"
        show={showPrice}
        onHide={() => setShowPrice(false)}
        dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-custom-modal-styling-title">
            Compare Price
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table responsive className="table-bordered primary-table-head">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Reference</th>
                <th>Status</th>

                <th>Expected Date</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit of Measure</th>
                <th>Unit Price</th>
                <th>Price (Incl tax)</th>
                <th>Total</th>

                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ProductCompare.map((productPriceCompare) => (

                <tr className={productPriceCompare.status >= 5 ? 'confirmorder-tr' : ''}>
                  <td>{productPriceCompare.vendor.vendor_name} </td>
                  <td>{productPriceCompare.reference_number}</td>
                  <td>{getStatus(productPriceCompare.status)} </td>
                  <td>
                    {new Date(productPriceCompare.expected_arrival)
                      .toJSON()
                      .slice(0, 10)}
                  </td>
                  <td>
                    {productPriceCompare.products.map((product) => (
                      <div key={product.id}>
                        <div>{product.ProductsItem.product_name}</div>
                      </div>
                    ))}
                  </td>
                  <td>
                    {productPriceCompare.products.map((product) => (
                      <div key={product.id}>
                        <div>{product.qty}</div>
                      </div>
                    ))}
                  </td>
                  <td>
                    {productPriceCompare.products.map((product) => (
                      <div key={product.id}>
                        <div>{product.ProductsItem.unit}</div>
                      </div>
                    ))}
                  </td>
                  <td>
                    {productPriceCompare.products.map((product) => (
                      <div key={product.id}>
                        <div>{product.unit_price}</div>
                      </div>
                    ))}
                  </td>
                  <td>
                    {productPriceCompare.products.map((product) => (
                      <div key={product.id}>
                        <div>{product.taxIncl}</div>
                      </div>
                    ))}
                  </td>
                  <td>{productPriceCompare.total_amount}</td>
                  <td>
                    <div className="d-flex">
                      {productPriceCompare.status >= 4 ? (

                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Choose</Tooltip>}
                        >
                          {productPriceCompare.status >= 5 ? (
                            <button type='button' className="icon-btn me-2">
                              <i class="bi bi-heart-fill 2x text-danger"></i>
                            </button>
                          ) : (
                            <button type='button' className="icon-btn me-2" style={{ cursor: 'pointer' }} onClick={() => handleStatusChange(productPriceCompare.id, 5)}>
                              <i class="bi bi-heart-fill 2x "> </i></button>
                          )}


                        </OverlayTrigger>
                      ) : (
                        <p></p>
                      )
                      }
                      {/* <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Clear</Tooltip>}
                      >
                        <button type='button' className="icon-btn me-2">
                          <i class="bi bi-x-circle-fill"></i>
                        </button>
                      </OverlayTrigger> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>

      <Modal
        show={existingBatchesModalIndex != null}
        onHide={() => setExistingBatchesModalIndex(null)}
        centered
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-list-alt me-2"></i>
            Received Batches
            {existingBatchesModalIndex != null && products[existingBatchesModalIndex] && (
              <span className="text-muted fw-normal fs-6 ms-2">
                — {products[existingBatchesModalIndex].ProductsItem?.product_name ?? ""} ({products[existingBatchesModalIndex].ProductsItem?.product_code ?? ""})
              </span>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {existingBatchesModalIndex != null && products[existingBatchesModalIndex] && (
            <p className="ms-3 text-muted mb-3">
              Previously received batches for this PO.
            </p>
          )}
          {existingBatchesModalIndex != null && products[existingBatchesModalIndex] && (
            <Table responsive bordered size="md">
              <thead>
                <tr>
                  <th>Batch No.</th>
                  <th>Manufacture Date</th>
                  <th>Expiry Date</th>
                  <th>Weight Per Unit</th>
                  <th>Quantity</th>
                  <th>Total Weight</th>
                </tr>
              </thead>
              <tbody>
                {((products[existingBatchesModalIndex]?.existingBatches) || []).map((batch, idx) => (
                  <tr key={batch.id ?? idx}>
                    <td>{batch.batch_no ?? "—"}</td>
                    <td>{batch.manufacture_date ? moment(batch.manufacture_date).format("DD/MM/YYYY") : "—"}</td>
                    <td>{batch.expiry_date ? moment(batch.expiry_date).format("DD/MM/YYYY") : "—"}</td>
                    <td>{batch.productVariant?.weight_per_unit} {batch.productVariant?.masterUOM?.label || 'N/A'}</td>
                    <td>{batch.quantity ?? batch.qty ?? "—"}</td>
                    <td>{calculateTotalWeight(batch.quantity, batch.productVariant?.weight_per_unit, batch.productVariant?.masterUOM?.label).value} {calculateTotalWeight(batch.quantity, batch.productVariant?.weight_per_unit, batch.productVariant?.masterUOM?.label).unit}</td>

                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setExistingBatchesModalIndex(null)}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>

      {/* Variant Selection Modal */}
      <Modal
        show={showVariantModal}
        onHide={handleVariantModalClose}
        centered
        size="lg"
        backdrop="static"
      >
        <Modal.Header>
          <Modal.Title id="variant-selection-modal-title">
            <i className="fas fa-box me-2 text-primary"></i>
            Select Product Variant
          </Modal.Title>
          <button
            type="button"
            className="btn-close"
            onClick={handleVariantModalClose}
            aria-label="Close"
          ></button>
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
                </div>
              )}
              
              {productVariants.length > 0 ? (
                <div>
                  <h6 className="mb-3">Available Variants:</h6>
                  <div className="row">
                    {productVariants.map((variant, index) => {
                      const currentSelectedVariantId = getCurrentSelectedVariantId();
                      const isSelected = currentSelectedVariantId === variant.id;
                      
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
                                    {getGeneralSettingssymbol}{parseFloat(variant.price_per_unit).toFixed(2)}
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
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleVariantModalClose}
          >
            Cancel
          </button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}

export default EditMyPurchase;
