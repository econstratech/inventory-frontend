import React, { useState, useEffect } from "react";
import { Modal, OverlayTrigger, Tooltip, Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Table, Input } from "antd";
import Select from "react-select";
import moment from "moment";

import { UserAuth } from "../auth/Auth";
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import "../global.css";
import { PrivateAxios } from "../../environment/AxiosInstance";
import InventoryMasterPageTopBar from "./itemMaster/InventoryMasterPageTopBar";
import AddMultipleItemsModal from "../CommonComponent/AddMultipleItemsModal";
import StockMasterBulkActions from "../CommonComponent/StockMasterBulkActions";
import ProductCategorySelect from "../filterComponents/ProductCategorySelect";
import DeleteModal from "../CommonComponent/DeleteModal";

function InventoryMaster() {
  const [productsCount, setProductsCount] = useState(0);
  const [productController, setProductController] = useState({
    page: 1,
    rowsPerPage: 6,
    searchKey: "",
  });
  const [errorMessage, setErrorMessage] = useState({});
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [deleteMode, setDeleteMode] = useState("single");
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const [uomData, setUomData] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [dynamicProductAttributes, setDynamicProductAttributes] = useState([]);
  const [masterBrands, setMasterBrands] = useState([]);

  const { user, isVariantBased } = UserAuth();

  const [addItemFormData, setAddItemFormData] = useState({
    product_code: "",
    product_name: "",
    product_type_id: null,
    product_category_id: null,
    uom_id: null,
    is_batch_applicable: "1",
    brand_id: null,
    dynamic_attributes: [], // dynamic attributes
    product_variants: [] // product variants
  });

  // Product variants state
  const [productVariants, setProductVariants] = useState([]);

  const [filteredData, setFilteredData] = useState([]);

  // Get add item input type fields
  const handleAddItemFormChange = (e) => {
    const { name, value } = e.target;
    setAddItemFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  // Get add item dropdown type fields
  const handleAddItemSelectChange = (fieldName) => (selectedOption) => {
    setAddItemFormData(prev => ({
      ...prev,
      [fieldName]: selectedOption?.id ?? null
    }));
  };

  const handleDynamicChange = (e) => {
    const { value, dataset } = e.target;
  
    const attrId = Number(dataset.attrId);
    const isRequired = Number(dataset.required);
  
    setAddItemFormData(prev => {
      const existingIndex = prev.dynamic_attributes.findIndex(
        attr => attr.product_attribute_id === attrId
      );
  
      let updatedAttributes;
  
      if (existingIndex !== -1) {
        // Update existing attribute value
        updatedAttributes = prev.dynamic_attributes.map(attr =>
          attr.product_attribute_id === attrId
            ? { ...attr, value }
            : attr
        );
      } else {
        // Add new attribute
        updatedAttributes = [
          ...prev.dynamic_attributes,
          {
            product_attribute_id: attrId,
            is_required: isRequired,
            value
          }
        ];
      }
  
      return {
        ...prev,
        dynamic_attributes: updatedAttributes
      };
    });
  };

  // Unit conversion helpers (used for Master Pack quantity calculation)
  const unitFactorMap = {
    mg: { group: "weight", factor: 0.001 },
    g: { group: "weight", factor: 1 },
    kg: { group: "weight", factor: 1000 },
    ton: { group: "weight", factor: 1000000 },
    tonne: { group: "weight", factor: 1000000 },
    ml: { group: "volume", factor: 1 },
    l: { group: "volume", factor: 1000 },
  };
  const normalizeUnit = (unit) => String(unit || "").trim().toLowerCase();
  const convertUnitValue = (value, fromUnit, toUnit) => {
    const from = unitFactorMap[normalizeUnit(fromUnit)];
    const to = unitFactorMap[normalizeUnit(toUnit)];
    if (!from || !to || from.group !== to.group) return null;
    const baseValue = Number(value) * from.factor;
    return baseValue / to.factor;
  };

  // Compute quantity_per_pack = (pack weight in variant's UoM) / (variant weight)
  const computeQuantityPerPack = (variant) => {
    if (
      !variant?.uom_id ||
      !variant?.weight ||
      !variant?.pack_uom_id ||
      !variant?.weight_per_pack
    ) {
      return "";
    }
    const variantUom = uomData.find((u) => u.id === variant.uom_id);
    const packUom = uomData.find((u) => u.id === variant.pack_uom_id);
    if (!variantUom?.symbol || !packUom?.symbol) return "";
    const packWeightInVariantUnit = convertUnitValue(
      variant.weight_per_pack,
      packUom.symbol,
      variantUom.symbol
    );
    const variantWeight = parseFloat(variant.weight);
    if (
      packWeightInVariantUnit === null ||
      !Number.isFinite(packWeightInVariantUnit) ||
      !Number.isFinite(variantWeight) ||
      variantWeight <= 0
    ) {
      return "";
    }
    const qty = packWeightInVariantUnit / variantWeight;
    return Number.isFinite(qty) ? Number(qty.toFixed(2)) : "";
  };

  // Handle adding a new variant
  const handleAddVariant = () => {
    const newVariant = {
      id: Date.now(), // temporary unique ID
      uom_id: null,
      weight: "",
      has_master_pack: false,
      pack_uom_id: null,
      weight_per_pack: "",
    };
    setProductVariants([...productVariants, newVariant]);
  };

  // Handle removing a variant
  const handleRemoveVariant = (variantId) => {
    setProductVariants(productVariants.filter(variant => variant.id !== variantId));
  };

  // Handle variant UoM change
  const handleVariantUomChange = (variantId, selectedOption) => {
    setProductVariants(productVariants.map(variant =>
      variant.id === variantId
        ? { ...variant, uom_id: selectedOption ? selectedOption.id : null }
        : variant
    ));
  };

  // Handle variant weight change
  const handleVariantWeightChange = (variantId, value) => {
    // Allow only numbers and decimals
    const numericValue = value.replace(/[^0-9.]/g, '');
    setProductVariants(productVariants.map(variant =>
      variant.id === variantId
        ? { ...variant, weight: numericValue }
        : variant
    ));
  };

  // Toggle "Has Master Pack?" for a variant
  const handleVariantHasMasterPackChange = (variantId, checked) => {
    setProductVariants(productVariants.map(variant =>
      variant.id === variantId
        ? {
            ...variant,
            has_master_pack: checked,
            ...(checked
              ? {}
              : { pack_uom_id: null, weight_per_pack: "" }),
          }
        : variant
    ));
  };

  // Handle pack UoM change
  const handleVariantPackUomChange = (variantId, selectedOption) => {
    setProductVariants(productVariants.map(variant =>
      variant.id === variantId
        ? { ...variant, pack_uom_id: selectedOption ? selectedOption.id : null }
        : variant
    ));
  };

  // Handle weight per pack change
  const handleVariantWeightPerPackChange = (variantId, value) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    setProductVariants(productVariants.map(variant =>
      variant.id === variantId
        ? { ...variant, weight_per_pack: numericValue }
        : variant
    ));
  };

  // Add item form validation
  const validateAddItemForm = () => {
    let newErrors = {};
  
    if (!addItemFormData.product_code.trim()) {
      newErrors.product_code = "Item Code is required";
    } else if (!addItemFormData.product_name.trim()) {
      newErrors.product_name = "Item Name is required";
    } else if (!addItemFormData.product_type_id) {
      newErrors.product_type_id = "Item Type is required";
    } else if (!addItemFormData.product_category_id) {
      newErrors.product_category_id = "Category is required";
    }  else {
      // 🔥 Dynamic attributes validation (ARRAY BASED)
      dynamicProductAttributes.forEach(attr => {
        if (attr.is_required === 1) {
          const found = addItemFormData.dynamic_attributes.find(
            item => item.product_attribute_id === attr.id
          );

          if (!found || !found.value?.trim()) {
            newErrors[`dynamic_${attr.id}`] = `${attr.name} is required`;
          }
        }
      });

      if (isVariantBased) {
        // Validate product variants - at least one complete variant is required
        const validVariants = productVariants.filter(
          variant => variant.uom_id && variant.weight && variant.weight.trim() !== ""
        );
        
        if (validVariants.length === 0) {
          newErrors.product_variants = "At least one product variant with Unit of Measurement and Weight is required";
        }

        productVariants.forEach(variant => {
          if (variant.weight?.trim() === "" || variant.uom_id === null) {
            newErrors.product_variants = "Both Unit of Measurement and Weight is required";
          }
          if (variant.has_master_pack) {
            if (!variant.pack_uom_id) {
              newErrors.product_variants = "Pack UOM is required when Master Pack is enabled";
            }
            if (!variant.weight_per_pack || String(variant.weight_per_pack).trim() === "") {
              newErrors.product_variants = "Weight per pack is required when Master Pack is enabled";
            }
          }
        });
      } else if (!addItemFormData.uom_id) {
        newErrors.uom_id = "Unit of Measurement is required";
      }
    }
  
    setErrorMessage(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Fetch master UOM list
   */
  const fetchUomData = async() => {
    try {
      const res = await PrivateAxios.get(`master/uom/list`);
      if (res.data.data.length > 0) {
        const mappedData = res.data.data.map((item) => {
          return {
            id: item.id,
            label: `${item.name} (${item.label})`,
            symbol: item.label,
          }
        })
        setUomData(mappedData);
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Fetch master product types
   */
  const fetchProductTypes = async() => {
    try {
      const res = await PrivateAxios.get(`master/product-type/list`);
      setProductTypes(res.data.data);
    } catch (error) {
      console.error(error);
    }
  }

  const fetchDynamicProductattributes = async () => {
    try {
      const res = await PrivateAxios.get(
        `master/product-attribute/list?company_id=${user.company_id}`
      );
  
      setDynamicProductAttributes(res.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMasterBrands = async () => {
    try {
      const res = await PrivateAxios.get(`master/brand/list`);
      setMasterBrands(res.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user?.company_id) {
      fetchDynamicProductattributes();
    }
  }, [user]);


  useEffect(() => {
    fetchUomData();
    fetchProductTypes();
    fetchDynamicProductattributes();
    fetchMasterBrands();
  }, []);

  const handleShowAddSingleItemModal = () => {
    setShowAddSingleItemModal(true);
  };

  const [showAddSingleItemModal, setShowAddSingleItemModal] = useState(false);
  const handleCloseAddSingleItemModal = () => {
    setShowAddSingleItemModal(false);
    // Reset variants when modal closes
    setProductVariants([]);
  };

  const SubmitData = (event) => {
    event.preventDefault();

    // Check validation before submit data
    if (!validateAddItemForm()) return;
    
    // Prepare variants data for submission
    const variantsData = isVariantBased ? productVariants
      .filter(variant => variant.uom_id && variant.weight)
      .map(variant => {
        const base = {
          uom_id: variant.uom_id,
          weight: parseFloat(variant.weight) || 0,
        };
        if (variant.has_master_pack && variant.pack_uom_id && variant.weight_per_pack) {
          const packUom = uomData.find(u => u.id === variant.pack_uom_id);
          const quantityPerPack = computeQuantityPerPack(variant);
          return {
            ...base,
            pack_uom_id: variant.pack_uom_id,
            quantity_per_pack: quantityPerPack === "" ? 0 : Number(quantityPerPack),
            weight_per_pack: `${variant.weight_per_pack} ${packUom?.symbol || ""}`.trim(),
          };
        }
        return {
          ...base,
          pack_uom_id: null,
          quantity_per_pack: null,
          weight_per_pack: null,
        };
      }) : [];

    // Combine form data with variants
    const submitData = {
      ...addItemFormData,
      product_variants: variantsData
    };

    PrivateAxios.post("product/add", submitData)
      .then((res) => {
        if (res.status === 200) {
          SuccessMessage("Product added successfully!");
          handleCloseAddSingleItemModal(true);
          // Reset variants
          setProductVariants([]);
          fetchData();
          //Reset form data
          setAddItemFormData({
            product_code: "",
            product_name: "",
            product_type_id: null,
            product_category_id: null,
            is_batch_applicable: null,
            brand_id: null,
          });
        }
      })
      .catch((err) => {
        ErrorMessage(
          "Error: Product can only contain alphanumeric characters and spaces."
        );
      });
  };

  // Fetch products data
  const fetchData = async () => {
    try {
      const { page, rowsPerPage, searchKey } = productController;
      // Set query params
      const queryParams = new URLSearchParams({
        type: "list",
        page,
        limit: rowsPerPage,
        ...(searchKey && { searchkey: searchKey })
      }).toString();

      const res = await PrivateAxios.get(`product/list?${queryParams}`);
      const productFetchResponse = res.data.data;
      setProductsCount(productFetchResponse.pagination.total_records);
      const mappedData = productFetchResponse.rows.map((item, index) => {
        return {
          key: index + 1,
          id: item.id || "",
          itemId: item.product_code || "",
          itemName: item.product_name || "",
          product_category: item.productCategory ? item.productCategory.title : "",
          sku_product: item.sku_product || "",
          masterProductType: item.masterProductType,
          is_batch_applicable: item.is_batch_applicable,
          has_master_pack: item.has_master_pack,
          markup_percentage: item.markup_percentage || "0",
          masterBrand: item.masterBrand,
          uom: item?.masterUOM?.name || "",
          itemCategory: item.Categories?.title || "",
          productVariants: item.productVariants || [],
          productAttributeValues: item.productAttributeValues || [],
        };
      });

      setFilteredData(mappedData);
    } catch (err) {
      if (err.response?.status === 401) {
        console.log("Unauthorized");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [productController]);

  const handleProductsListPageChange = (page, pageSize) => {
    setProductController(prev => ({
      ...prev,
      page,
      rowsPerPage: pageSize
    }));
  };

  const handleDeleteItem = (id) => {
    setDeleteMode("single");
    setDeleteProductId(id || null);
    setDeleteModalShow(true);
  };

  const handleBulkDeleteClick = () => {
    if (!selectedProductIds.length) {
      ErrorMessage("Please select at least one item for bulk delete.");
      return;
    }
    setDeleteMode("bulk");
    setDeleteModalShow(true);
  };

  const closeDeleteItemModal = () => {
    setDeleteModalShow(false);
    setDeleteProductId(null);
    setDeleteMode("single");
  };

  const confirmDeleteItem = async () => {
    try {
      if (deleteMode === "bulk") {
        const idsToDelete = selectedProductIds.filter(Boolean);
        if (!idsToDelete.length) {
          closeDeleteItemModal();
          return;
        }
        const res = await PrivateAxios.delete("/product/delete-multiple", {
          data: { ids: idsToDelete },
        });
        SuccessMessage(res?.data?.message || "Selected items deleted successfully.");
        setSelectedProductIds([]);
      } else {
        if (!deleteProductId) {
          closeDeleteItemModal();
          return;
        }
        const res = await PrivateAxios.delete(`/product/${deleteProductId}`);
        SuccessMessage(res?.data?.message || "Product has benn been removed successfully");
      }
      closeDeleteItemModal();
      fetchData();
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to delete product.");
    }
  };

  const rowSelection = {
    selectedRowKeys: selectedProductIds,
    onChange: (nextSelectedRowKeys) => {
      setSelectedProductIds(nextSelectedRowKeys);
    },
    preserveSelectedRowKeys: true,
  };

  const handleBulkExportClick = async () => {
    try {
      const idsToExport = selectedProductIds.length ? selectedProductIds : [];
      const exportPayload = {
        ids: idsToExport,
        ...(String(productController.searchKey || "").trim() && {
          searchkey: String(productController.searchKey).trim(),
        }),
      };
      const res = await PrivateAxios.post(
        "/product/bulk-export",
        exportPayload,
        { responseType: "blob" }
      );

      const timestamp = moment().format("YYYYMMDDHHmmss");
      const filename = `inventory_master_${timestamp}.csv`;

      const disposition = res?.headers?.["content-disposition"] || "";
      const fileNameMatch = disposition.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);
      const decodedFileName = fileNameMatch?.[1]
        ? decodeURIComponent(fileNameMatch[1].replace(/"/g, ""))
        : filename;

      const fileBlob = new Blob([res.data], {
        type: res?.headers?.["content-type"] || "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(fileBlob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = decodedFileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      setSelectedProductIds([]);

      SuccessMessage(
        selectedProductIds.length
          ? "Selected products exported successfully."
          : "All products exported successfully."
      );
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to export products.");
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: "Item Code",
      dataIndex: "itemId",
      key: "itemId",
      width: 140,
      sorter: (a, b) => a.itemId.localeCompare(b.itemId),
    },
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
      width: 240,
      sorter: (a, b) => a.itemName.localeCompare(b.itemName),
    },
    {
      title: "Category",
      dataIndex: "product_category",
      key: "product_category",
      width: 180,
      render: (_, record) => record.product_category || "-",
    },
    {
      title: "Product Type",
      key: "masterProductType",
      width: 200,
      render: (_, record) => record.masterProductType?.name || "-",
    },
    {
      title: "Brand",
      dataIndex: ["masterBrand", "name"],
      key: "masterBrand",
      width: 150,
      render: (_, record) => record.masterBrand?.name || "-",
    },
    ...(!isVariantBased
      ? [
          {
            title: "UOM",
            dataIndex: "uom",
            key: "uom",
            width: 120,
            render: (_, record) => record.uom || "-",
          },
        ]
      : []),
    {
      title: "Batch Product",
      key: "is_batch_applicable",
      width: 150,
      render: (_, record) => record.is_batch_applicable && record.is_batch_applicable === 1 ? "Yes" : "No",
    },
    {
      title: "Master Pack",
      key: "has_master_pack",
      width: 120,
      render: (_, record) => record.has_master_pack && record.has_master_pack === 1 ? "Yes" : "No",
    },
    {
      title: "Markup %",
      dataIndex: "markup_percentage",
      key: "markup_percentage",
      width: 120,
      render: (_, record) => record.markup_percentage || "-",
    },
    {
      title: `${isVariantBased ? "Variants & Attributes" : "Attributes"}`,
      key: "variants_attributes",
      fixed: "right",
      width: 180,
      render: (_, record) => {
        const hasVariants = record.productVariants && record.productVariants.length > 0;
        const hasAttributes = record.productAttributeValues && record.productAttributeValues.length > 0;
        const hasData = hasVariants || hasAttributes;
        
        return (
          hasData ? (
          <button
            type="button"
            className={`btn btn-sm ${hasData ? 'btn-info' : 'btn-outline-secondary'}`}
            onClick={() => handleShowVariantsModal(record)}
            disabled={!hasData}
            title={hasData ? "View Variants & Attributes" : "No variants or attributes"}
          >
            <i className="fas fa-info-circle me-1"></i>
            View
          </button>
        ) : (
          <span className="text-muted">N/A</span>
        ))
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <div className="d-flex align-items-center gap-2">
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id={`edit-item-tooltip-${record.id}`}>Edit item</Tooltip>}
        >
          <Link
            to={{ pathname: `/inventory/inventory-master-edit/${record.id}/item-details` }}
            state={{ data: record }}
            className="d-inline-flex align-items-center justify-content-center"
            style={{ minWidth: 40, textDecoration: "none" }}
          >
            <i className="fas fa-pen me-1 text-success"></i>
          </Link>
        </OverlayTrigger>
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id={`delete-item-tooltip-${record.id}`}>Delete item</Tooltip>}
        >
          <button
            type="button"
            className="btn btn-link p-0 d-inline-flex align-items-center justify-content-center"
            onClick={() => handleDeleteItem(record.id)}
            style={{ minWidth: 40, textDecoration: "none" }}
          >
            <i className="fas fa-trash-alt me-1 text-danger"></i>
          </button>
        </OverlayTrigger>
        </div>
      ),
    },
  ];

  const [multipleItems, setMultipleItems] = useState(false);
  const multipleItemsModalClose = () => setMultipleItems(false);
  const multipleItemsModalShow = () => setMultipleItems(true);

  // Product Variants & Attributes Modal
  const [showVariantsModal, setShowVariantsModal] = useState(false);
  const [selectedProductData, setSelectedProductData] = useState(null);
  const handleCloseVariantsModal = () => {
    setShowVariantsModal(false);
    setSelectedProductData(null);
  };
  const handleShowVariantsModal = (productData) => {
    setSelectedProductData(productData);
    setShowVariantsModal(true);
  };

  // Disable background scroll when any modal is open
  useEffect(() => {
    const modalOpen =
      showAddSingleItemModal ||
      multipleItems ||
      showVariantsModal;
    if (modalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.body.classList.add("inventory-modal-open");
      return () => {
        document.body.style.overflow = prev || "";
        document.body.classList.remove("inventory-modal-open");
      };
    }
  }, [
    showAddSingleItemModal,
    multipleItems,
    showVariantsModal,
  ]);

  return (
    <>
      <InventoryMasterPageTopBar />
      <div className="p-4">
        <div className="row">

          <div className="col-12">
            <div className="card mb-2">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center flex-wrap ">
                  <div className="d-flex gap-2 ms-auto">
                    <Dropdown align="end">
                      <Dropdown.Toggle className="btn btn-outline-danger btn-sm" variant="unset">
                        <i className="fas fa-tasks me-2"></i>
                        Bulk Actions
                        {selectedProductIds.length > 0 ? ` (${selectedProductIds.length})` : ""}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={handleBulkExportClick}
                        >
                          <i className="fas fa-file-csv me-2 text-primary"></i>
                          Bulk export
                        </button>
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={handleBulkDeleteClick}
                          disabled={!selectedProductIds.length}
                        >
                          <i className="fas fa-trash-alt me-2 text-danger"></i>
                          Bulk delete
                        </button>
                      </Dropdown.Menu>
                    </Dropdown>

                  <Dropdown align="end">
                    <Dropdown.Toggle className="btn btn-outline-primary btn-sm" variant="unset">
                      <i className="fas fa-cog me-2"></i> Actions
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="dropdown-min-width320">
                      <button type="button" className="dropdown-item" onClick={multipleItemsModalShow}>
                        <div className="d-flex align-items-start">
                          <i className="fas fa-plus me-2 text-primary mt-1"></i>
                          <div>
                            <div className="fw-medium f-s-14">Add Multiple Items</div>
                            <span className="text-muted f-s-12">
                              Upload hundreds of items at once through csv file
                            </span>
                          </div>
                        </div>
                      </button>
                      </Dropdown.Menu>
                    </Dropdown>
                    <StockMasterBulkActions
                      onSuccess={fetchData}
                      onAddSingleItem={handleShowAddSingleItemModal}
                      isBulkActions={false}
                    />
                  </div>
                </div>


                <div className="inventory-body pt-2">
                  <div className="inventory-body-wrap-body">
                    <div className="table-wrap">
                      <div className="border rounded-10 bg-white">
                        <div className="d-flex justify-content-end p-3">
                          <div className="col-md-3">
                            <Input.Search
                              placeholder="Search..."
                              id="searchProduct"
                              allowClear
                              className="product-search"
                              onSearch={(value) => {
                                setProductController(prev => ({
                                  ...prev,
                                  page: 1,        // reset page when searching
                                  searchKey: value.trim()
                                }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="p-0">
                          <div className="table-responsive mb-0">
                            <Table
                              className="fixed-col-overlap-fix"
                              columns={columns}
                              dataSource={filteredData}
                              rowKey="id"
                              rowSelection={rowSelection}
                              pagination={{
                                current: productController.page,
                                pageSize: productController.rowsPerPage,
                                total: productsCount,
                                onChange: handleProductsListPageChange
                              }}
                              scroll={{ x: 1500 }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Single Item Modal start*/}

      <Modal
        id="addPriority"
        show={showAddSingleItemModal}
        onHide={handleCloseAddSingleItemModal}
        backdrop="static"
        centered
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title className="gth-modal-title">Add Item</Modal.Title>
        </Modal.Header>
        <form action="" onSubmit={SubmitData} method="post">
          <Modal.Body className="pb-1 moday-body-overflow-none">
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label d-flex">
                    Item Code <span className="text-danger">*</span>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Unique code for your item</Tooltip>}
                    >
                      <span className="cursor-pointer ms-2 text-primary">
                        <i className="fas fa-info-circle line-height-1"></i>
                      </span>
                    </OverlayTrigger>
                  </label>
                  <input
                    type="text"
                    name="product_code"
                    className="form-control"
                    onChange={handleAddItemFormChange}
                  />
                   {errorMessage.product_code && (
                    <span className="error-message">{errorMessage.product_code}</span>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">
                    Item Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="product_name"
                    placeholder="Enter Item Name"
                    className="form-control"
                    onChange={handleAddItemFormChange}
                  />
                  {errorMessage.product_name && (
                    <span className="error-message">{errorMessage.product_name}</span>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label d-flex">
                    Item Type <span className="text-danger"> *</span>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip>
                          What type of item is it? e.g. Raw Material, Finished
                          Goods
                        </Tooltip>
                      }
                    >
                      <span className="cursor-pointer ms-2 text-primary">
                        <i className="fas fa-info-circle line-height-1"></i>
                      </span>
                    </OverlayTrigger>
                  </label>
                  <div className="form-group">
                    <div className="custom-select-wrap w-100">
                      <Select
                        name="product_type_id"
                        options={productTypes}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.id}
                        onChange={handleAddItemSelectChange("product_type_id")}
                      />
                    </div>
                    {errorMessage.product_type_id && (
                      <span className="error-message">{errorMessage.product_type_id}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label d-flex justify-content-between">
                    <span>
                      Category
                      <span className="text-danger">*</span>
                    </span>
                  </label>
                  <div className="d-flex">
                    <div className="custom-select-wrap w-100">
                      <ProductCategorySelect
                        value={addItemFormData.product_category_id}
                        onChange={handleAddItemSelectChange("product_category_id")}
                        placeholder="Select Category"
                        error={errorMessage.product_category_id}
                        onErrorClear={() =>
                          setErrorMessage((prev) => ({ ...prev, product_category_id: "" }))
                        }
                      />
                    </div>
                  </div>
                  
                  {errorMessage.product_category_id && (
                    <span className="error-message">{errorMessage.product_category_id}</span>
                  )}
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label d-flex justify-content-between">
                    <span>
                      Batch Applicable <span className="text-danger">*</span>
                    </span>
                  </label>
                  <select
                    className="form-select"
                    name="is_batch_applicable"
                    value={addItemFormData.is_batch_applicable ?? "1"}
                    onChange={handleAddItemFormChange}
                  >
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label d-flex justify-content-between">
                    <span>
                      Select Brand
                      {/* <span className="text-danger">*</span> */}
                    </span>
                  </label>
                  <div className="d-flex">
                    <div className="custom-select-wrap w-100">
                      <Select
                        name="brand_id"
                        options={masterBrands}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.id}
                        theme={(theme) => ({
                          ...theme,
                          colors: {
                            ...theme.colors,
                            primary25: "#ddddff",
                            primary: "#6161ff",
                          },
                        })}
                        onChange={handleAddItemSelectChange("brand_id")}
                      />
                    </div>
                    <Link
                      to="/settings/brands"
                      className="btn btn-outline-primary w-fit-content ms-2"
                    >
                      <i className="fas fa-plus"></i>
                    </Link>
                  </div>
                  
                  {errorMessage.brand_id && (
                    <span className="error-message">{errorMessage.brand_id}</span>
                  )}
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label d-flex justify-content-between">
                    <span>Markup % </span>
                  </label>
                  <input
                    type="number"
                    name="markup_percentage"
                    placeholder="Enter Markup %"
                    className="form-control"
                    onChange={handleAddItemFormChange}
                  />
                  {errorMessage.markup_percentage && (
                    <span className="error-message">{errorMessage.markup_percentage}</span>
                  )}
                </div>
              </div>
              {dynamicProductAttributes.map((attr) => (
                <div className="col-md-6" key={attr.id}>
                  <div className="form-group">
                    <label className="form-label">
                      {attr.name}
                      {attr.is_required === 1 && (
                        <span className="text-danger"> *</span>
                      )}
                    </label>

                    <input
                      type="text"
                      name={`attribute_${attr.id}`}
                      placeholder={`Enter ${attr.name}`}
                      data-attr-id={attr.id}
                      data-required={attr.is_required}
                      className="form-control"
                      onChange={handleDynamicChange}
                    />
                   {errorMessage?.[`dynamic_${attr?.id}`] && (
                      <span className="error-message">
                        {errorMessage[`dynamic_${attr?.id}`]}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Product Variants Section */}
              {isVariantBased ? (
              <div className="col-12 mt-3">
                <div className="card border">
                  <div className="card-header bg-light">
                    <h6 className="mb-0 fw-bold">Product Variants</h6>
                  </div>
                  <div className="card-body">
                    {productVariants.length === 0 ? (
                      <p className="text-muted text-center mb-0 py-3">
                        No variants added. Click "Add Variant" to add product variants.
                      </p>
                    ) : (
                      <div className="row">
                        {productVariants.map((variant, index) => (
                          <div className="col-12 mb-3" key={variant.id}>
                            <div className="card border-secondary">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <h6 className="mb-0">Variant {index + 1}</h6>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleRemoveVariant(variant.id)}
                                  >
                                    <i className="fas fa-trash"></i> Remove
                                  </button>
                                </div>
                                <div className="row">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label className="form-label">
                                        Unit of Measurement <span className="text-danger">*</span>
                                      </label>
                                      <Select
                                        name={`variant_uom_${variant.id}`}
                                        options={uomData}
                                        getOptionLabel={(option) => option.label}
                                        getOptionValue={(option) => option.id}
                                        value={uomData.find(uom => uom.id === variant.uom_id) || null}
                                        onChange={(selectedOption) => handleVariantUomChange(variant.id, selectedOption)}
                                        theme={(theme) => ({
                                          ...theme,
                                          colors: {
                                            ...theme.colors,
                                            primary25: "#ddddff",
                                            primary: "#6161ff",
                                          },
                                        })}
                                        placeholder="Select Unit of Measurement"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label className="form-label">
                                        Weight <span className="text-danger">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter Weight"
                                        value={variant.weight}
                                        onChange={(e) => handleVariantWeightChange(variant.id, e.target.value)}
                                        pattern="[0-9.]*"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-12 mt-2">
                                    <div className="form-check">
                                      <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id={`has_master_pack_${variant.id}`}
                                        checked={!!variant.has_master_pack}
                                        onChange={(e) => handleVariantHasMasterPackChange(variant.id, e.target.checked)}
                                      />
                                      <label
                                        className="form-check-label"
                                        htmlFor={`has_master_pack_${variant.id}`}
                                      >
                                        Has Master Pack?
                                      </label>
                                    </div>
                                  </div>
                                  {variant.has_master_pack && (
                                    <>
                                      <div className="col-md-4 mt-2">
                                        <div className="form-group">
                                          <label className="form-label">
                                            Pack UOM <span className="text-danger">*</span>
                                          </label>
                                          <Select
                                            name={`pack_uom_${variant.id}`}
                                            options={uomData}
                                            getOptionLabel={(option) => option.label}
                                            getOptionValue={(option) => option.id}
                                            value={uomData.find(uom => uom.id === variant.pack_uom_id) || null}
                                            onChange={(selectedOption) => handleVariantPackUomChange(variant.id, selectedOption)}
                                            theme={(theme) => ({
                                              ...theme,
                                              colors: {
                                                ...theme.colors,
                                                primary25: "#ddddff",
                                                primary: "#6161ff",
                                              },
                                            })}
                                            placeholder="Select Pack UOM"
                                          />
                                        </div>
                                      </div>
                                      <div className="col-md-4 mt-2">
                                        <div className="form-group">
                                          <label className="form-label">
                                            Weight per pack <span className="text-danger">*</span>
                                          </label>
                                          <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter Weight per pack"
                                            value={variant.weight_per_pack}
                                            onChange={(e) => handleVariantWeightPerPackChange(variant.id, e.target.value)}
                                            pattern="[0-9.]*"
                                          />
                                        </div>
                                      </div>
                                      <div className="col-md-4 mt-2">
                                        <div className="form-group">
                                          <label className="form-label">Quantity per pack</label>
                                          <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Auto-calculated"
                                            value={computeQuantityPerPack(variant)}
                                            readOnly
                                          />
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="row mt-3">
                      <div className="col-12 d-flex justify-content-end">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleAddVariant}
                        >
                          <i className="fas fa-plus me-1"></i> Add Variant
                        </button>
                      </div>
                    </div>
                    {errorMessage.product_variants && (
                      <div className="row mt-2">
                        <div className="col-12">
                          <span className="error-message">{errorMessage.product_variants}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              ) : (
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">
                      Unit of Measurement <span className="text-danger">*</span>
                    </label>
                    <Select
                      name="uom_id"
                      options={uomData}
                      getOptionLabel={(option) => option.label}
                      getOptionValue={(option) => option.id}
                      value={uomData.find(uom => uom.id === addItemFormData.uom_id) || null}
                      onChange={(selectedOption) => handleAddItemSelectChange("uom_id")(selectedOption)}
                      theme={(theme) => ({
                        ...theme,
                        colors: {
                          ...theme.colors,
                          primary25: "#ddddff",
                          primary: "#6161ff",
                        },
                      })}
                      placeholder="Select Unit of Measurement"
                    />
                    {errorMessage.uom_id && (
                      <span className="error-message">{errorMessage.uom_id}</span>
                    )}
                  </div>

                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button type="submit" className="btn btn-success">
              Save
            </button>
          </Modal.Footer>
        </form>
      </Modal>
      {/* Add Single Item Modal end*/}

      <AddMultipleItemsModal
        show={multipleItems}
        onClose={multipleItemsModalClose}
        FetchProduct={fetchData}
      />

      <DeleteModal
        show={deleteModalShow}
        handleClose={closeDeleteItemModal}
        onDelete={confirmDeleteItem}
        title={deleteMode === "bulk" ? "Bulk Delete Products" : "Delete Product"}
        message={
          deleteMode === "bulk"
            ? `Are you sure you want to delete ${selectedProductIds.length} selected item(s)? This action cannot be undone.`
            : "Are you sure you want to delete this product? This action cannot be undone."
        }
      />

      {/* Product Variants & Attributes Modal */}
      <Modal
        show={showVariantsModal}
        onHide={handleCloseVariantsModal}
        backdrop="static"
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedProductData?.itemName || "Product"} - Variants & Attributes
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProductData && (
            <div className="row">
              {/* Product Variants Section */}
              <div className="col-12 mb-4">
                <h6 className="fw-bold mb-3">
                  <i className="fas fa-box me-2 text-primary"></i>
                  Product Variants
                  {selectedProductData.productVariants?.length > 0 && (
                    <span className="badge bg-primary ms-2">
                      {selectedProductData.productVariants.length}
                    </span>
                  )}
                </h6>
                {selectedProductData.productVariants && selectedProductData.productVariants.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Unit of Measurement</th>
                          <th>Weight per Unit</th>
                          {selectedProductData.has_master_pack === 1 && (
                            <th>Master Pack</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProductData.productVariants.map((variant, index) => (
                          <tr key={variant.id || index}>
                            <td>{index + 1}</td>
                            <td>
                              {variant.masterUOM ? (
                                <span>
                                  {variant.masterUOM.name} ({variant.masterUOM.label})
                                </span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              {variant.weight_per_unit ? (
                                <span className="fw-medium">{variant.weight_per_unit}</span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            
                            {selectedProductData.has_master_pack === 1 && variant.weight_per_pack && (
                              <td><span className="fw-medium">{variant.weight_per_pack}</span></td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-info mb-0">
                    <i className="fas fa-info-circle me-2"></i>
                    No product variants available for this item.
                  </div>
                )}
              </div>

              {/* Product Attributes Section */}
              <div className="col-12">
                <h6 className="fw-bold mb-3">
                  <i className="fas fa-tags me-2 text-success"></i>
                  Dynamic Product Attributes
                  {selectedProductData.productAttributeValues?.length > 0 && (
                    <span className="badge bg-success ms-2">
                      {selectedProductData.productAttributeValues.length}
                    </span>
                  )}
                </h6>
                {selectedProductData.productAttributeValues && selectedProductData.productAttributeValues.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Attribute Name</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProductData.productAttributeValues.map((attr, index) => (
                          <tr key={attr.id || index}>
                            <td>{index + 1}</td>
                            <td>
                              <span className="fw-medium">
                                {attr.productAttribute?.name || "-"}
                              </span>
                            </td>
                            <td>
                              {attr.value ? (
                                <span>{attr.value}</span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-info mb-0">
                    <i className="fas fa-info-circle me-2"></i>
                    No dynamic attributes available for this item.
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCloseVariantsModal}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
      {/* Product Variants & Attributes Modal end*/}

    </>
  );
}

export default InventoryMaster;
