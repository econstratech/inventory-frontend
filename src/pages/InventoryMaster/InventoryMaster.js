import React, { useState, useEffect } from "react";
import {
  // Alert,
  Modal,
  OverlayTrigger,
  // Popover,
  Tooltip,
  Dropdown
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { Table, Input } from "antd";
import Select from "react-select";

import { UserAuth } from "../auth/Auth";
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import "../global.css";
import {
  PrivateAxios,
  // PrivateAxiosFile,
} from "../../environment/AxiosInstance";
// import ItemMasterStatusBar from "./itemMaster/ItemMasterStatusBar";
import InventoryMasterPageTopBar from "./itemMaster/InventoryMasterPageTopBar";
import AddMultipleItemsModal from "../CommonComponent/AddMultipleItemsModal";
import StockMasterBulkActions from "../CommonComponent/StockMasterBulkActions";
import ProductCategorySelect from "../filterComponents/ProductCategorySelect";
// import DeleteMultipleItemsModal from "../CommonComponent/DeleteMultipleItemsModal";
import TallyIntegrationModal from "../CommonComponent/TallyIntegrationModal";
import ExploreAllFeaturesModal from "../CommonComponent/ExploreAllFeaturesModal";
// const { Option } = Select;
function InventoryMaster() {
  //modal transfer qty only
  const [showqty, setShowqty] = useState(false);
  const handleCloseqty = () => setShowqty(false);

  const [getitemId, setitemId] = useState(null);
  const [stores, setStores] = useState([]);

  const [productData, setProductData] = useState(null);
  const [productsCount, setProductsCount] = useState(0);
  const [productController, setProductController] = useState({
    page: 1,
    rowsPerPage: 6,
    searchKey: ""
  }); 
  const [selectedStore, setSelectedStore] = useState("");
  const [currentStock, setCurrentStock] = useState(0);
  const [changeQuantity, setChangeQuantity] = useState(0);
  const [finalQuantity, setFinalQuantity] = useState(0);
  const [getActualQuantity, setActualQuantity] = useState(0);
  const [finalUoM, setFinalUoM] = useState(0);

  const [getButtonClassNamePlus, setButtonClassNamePlus] = useState('');
  const [getButtonClassNameNeg, setButtonClassNameNeg] = useState('');
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState({});

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Fetch stores

  useEffect(() => {
    // Fetch stores
    const fetchStores = async () => {
      const result = await PrivateAxios.get("/warehouse");
      setStores(result.data.data);
    };
    fetchStores();
  }, []);

  // Handle store change
  const handleStoreChange = (selectedOption) => {
    if (selectedOption) {
      const selectedStoreId = selectedOption.id;
      setSelectedStore(selectedStoreId);

      // Find the corresponding store's stock
      const selectedStoreStock = productData.TrackProductStock.find(
        (stock) => stock.store_id === selectedStoreId
      );

      // Calculate total stock in (status_in_out === "1") and stock out (status_in_out === "0")
      const totalStoreStockIn = productData.TrackProductStock.filter(
        (stock) =>
          stock.store_id === selectedStoreId && parseInt(stock.status_in_out) === 1
      ).reduce((total, stock) => total + stock.quantity_changed, 0);

      const totalStoreStockOut = productData.TrackProductStock.filter(
        (stock) =>
          stock.store_id === selectedStoreId && parseInt(stock.status_in_out) === 0
      ).reduce((total, stock) => total + stock.quantity_changed, 0);

      // Final total stock is stock in minus stock out
      const finalTotalStock = totalStoreStockIn - totalStoreStockOut;

      // Update the changeQuantity field with the calculated final stock
      setChangeQuantity(0);
      setCurrentStock(finalTotalStock);
      setFinalQuantity(finalTotalStock);
    } else {
      setCurrentStock(0);
      setFinalQuantity(0);
      setChangeQuantity(0);
    }
  };

  // Handle change quantity input
  const handleChangeQuantity = (e) => {
    const value = parseInt(e.target.value, 10) || 0;
    setChangeQuantity(value);

    let updatedFinalQuantity;

    if (getButtonClassNamePlus === 'active') {
      updatedFinalQuantity = parseInt(currentStock) + value;
    } else if (getButtonClassNameNeg === 'active') {
      updatedFinalQuantity = parseInt(currentStock) - value;
    }

    // Prevent negative final quantity
    if (updatedFinalQuantity < 0) {
      ErrorMessage("Final quantity cannot be negative.");
      setFinalQuantity(0);
      setActualQuantity(updatedFinalQuantity);
    } else {
      setFinalQuantity(updatedFinalQuantity);
      setActualQuantity(updatedFinalQuantity);
    }
  };

  const incrementQuantity = () => {
    setButtonClassNamePlus('active');
    setButtonClassNameNeg('');

    const updatedFinalQuantity = parseInt(currentStock) + parseInt(changeQuantity || 0);

    if (updatedFinalQuantity < 0) {
      ErrorMessage("Final quantity cannot be negative.");
      setFinalQuantity(0);
      setActualQuantity(updatedFinalQuantity);
    } else {
      setFinalQuantity(updatedFinalQuantity);
      setActualQuantity(updatedFinalQuantity);
    }
  };

  const decrementQuantity = () => {
    setButtonClassNamePlus('');
    setButtonClassNameNeg('active');

    const updatedFinalQuantity = parseInt(currentStock) - parseInt(changeQuantity || 0);

    if (updatedFinalQuantity < 0) {
      ErrorMessage("Final quantity cannot be negative.");
      setFinalQuantity(0);
      setActualQuantity(updatedFinalQuantity);
    } else {
      setFinalQuantity(updatedFinalQuantity);
      setActualQuantity(updatedFinalQuantity);
    }
  };

  // stock update
  const handleSubmitStore = async (e) => {
    e.preventDefault();

    const data = {
      from_store: selectedStore, // Make sure this contains the store information
      transferItems: [
        {
          itemID: productData.id, // Product ID
          itemName: productData.product_name, // Product name
          changeQuantity, // Quantity change from the form
          finalQuantity, // Final quantity in the store
          defaultPrice: productData.product_price, // Default price
          comment, // Any comment from the user (if available)
          itemUnit: finalUoM, // Unit of Measurement
          AdjustmentType: getButtonClassNameNeg === 'active' ? "Out" : "adjustment", // Corrected AdjustmentType logic

        },
      ],
      use_fifo_price: useFIFOPrice, // FIFO price flag if needed
      comment, // Add any additional comments
    };
    try {
      const response = await PrivateAxios.post(
        "/product/update-stockonly",
        data
      );
      if (response.status === 200) {
        SuccessMessage("Store updated successfully.");
        setChangeQuantity(0);
        handleCloseqty();
        fetchData();
      } else {
        // console.log(response.status);
        ErrorMessage("Error !! Please check again.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  // end stock update

  const [useFIFOPrice, setUseFIFOPrice] = useState(false);
  const [comment, setComment] = useState("");

  // const [products, setProducts] = useState([]);
  // const [transferItems, setTransferItems] = useState([
  //   {
  //     key: 1,
  //     itemId: null,
  //     itemName: "",
  //     defaultPrice: 0,
  //     currentQuantity: "",
  //     finalQuantity: "",
  //     changeQuantity: 1,
  //     comment: "",
  //     itemID: "",
  //     product: null,
  //     availableQuantity: "",
  //     transferQuantity: "",
  //     itemUnit: "",
  //     disableTransferQuantity: true,
  //     batchesLoading: false,
  //     availableBatches: [],
  //     batchQuantities: {},
  //   },
  // ]);

  // const { user } = UserAuth();
  const [uomData, setUomData] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [dynamicProductAttributes, setDynamicProductAttributes] = useState([]);
  const [masterBrands, setMasterBrands] = useState([]);

  // const [user] = useState(JSON.parse(localStorage.getItem("auth_user")) || null);
  const { user, isVariantBased } = UserAuth();

  const [isLoading, setIsLoading] = useState(false);
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

  // const [filterCategory, setFilterCategory] = useState(null);

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

  // Handle adding a new variant
  const handleAddVariant = () => {
    const newVariant = {
      id: Date.now(), // temporary unique ID
      uom_id: null,
      weight: ""
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
            // newErrors[`variant_${variant.id}`] = `both Unit of Measurement and Weight is required`;
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
      // console.log("dynamicProductAttributes", res.data?.data);
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
    // generateRandomSKU();
    setShowAddSingleItemModal(true);
  };

  const [showAddSingleItemModal, setShowAddSingleItemModal] = useState(false);
  const handleCloseAddSingleItemModal = () => {
    setShowAddSingleItemModal(false);
    // Reset variants when modal closes
    setProductVariants([]);
  };
  // add item==================================
  const SubmitData = (event) => {
    event.preventDefault();

    // Check validation before submit data
    if (!validateAddItemForm()) return;
    
    // Prepare variants data for submission
    const variantsData = isVariantBased ? productVariants
      .filter(variant => variant.uom_id && variant.weight)
      .map(variant => ({
        uom_id: variant.uom_id,
        weight: parseFloat(variant.weight) || 0
      })) : [];

    // Combine form data with variants
    const submitData = {
      ...addItemFormData,
      product_variants: variantsData
    };

    // console.log("submitData", submitData);

    //submit data
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
    setIsLoading(true);
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
      // console.log(res);
      setProductsCount(productFetchResponse.pagination.total_records);
      const mappedData = productFetchResponse.rows.map((item, index) => {

        const filteredStock = Array.isArray(item.TrackProductStock)
          ? item.TrackProductStock.filter((stock) => stock.status_in_out == "1" || (stock.status_in_out == "0")) // Keep status_in_out 1 or status_in_out 0 with adjustmentType 'Out'
          : [];
        // Calculate total stock
        const totalStock = filteredStock.reduce((acc, stock) => {
          if (stock.adjustmentType === "StockTransfer") {
            return acc; // Don't add to total if adjustmentType is StockTransfer
          }

          // Subtract quantity_changed if status_in_out is 0 and adjustmentType is 'Out'
          if (stock.status_in_out == "0") {
            return acc - (stock.quantity_changed || 0);
          }

          // Otherwise, add the quantity_changed to totalStock
          return acc + (stock.quantity_changed || 0);
        }, 0);

        return {
          key: index + 1,
          id: item.id || "",
          itemId: item.product_code || "",
          itemName: item.product_name || "",
          product_category: item.productCategory ? item.productCategory.title : "",
          sku_product: item.sku_product || "",
          masterProductType: item.masterProductType,
          is_batch_applicable: item.is_batch_applicable,
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
    } finally {
      setIsLoading(false);
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
      fixed: "left",
      width: 240,
      render: (text, record) => (
        <Link
          to={`/inventory/inventory-master-edit/${record.id}/item-details`}
          state={{ data: record }}
          className="bg-light px-2 py-1 rounded d-inline-block"
        >
          {record.itemName}
          <i className="fas fa-external-link-alt ms-3"></i>

        </Link>
      ),
      sorter: (a, b) => a.itemName.localeCompare(b.itemName),
    },
    {
      title: "Category",
      dataIndex: "product_category",
      key: "product_category",
      width: 200,
      render: (_, record) => record.product_category || "-",
    },
    {
      title: "Product Type",
      key: "masterProductType",
      width: 240,
      render: (_, record) => record.masterProductType?.name || "-",
    },
    {
      title: "Brand",
      dataIndex: ["masterBrand", "name"],
      key: "masterBrand",
      width: 150,
      render: (_, record) => record.masterBrand?.name || "-",
    },
    ...(!isVariantBased && [
      {
        title: "UOM",
        dataIndex: "uom",
        key: "uom",
        width: 120,
        render: (_, record) => record.uom || "-",
      },
    ]),
    {
      title: "Batch Product",
      key: "is_batch_applicable",
      width: 150,
      render: (_, record) => record.is_batch_applicable && record.is_batch_applicable === 1 ? "Yes" : "No",
    },
    // {
    //   title: "Stock Status",
    //   dataIndex: "stockStatus",
    //   key: "stockStatus",
    //   width: 140,
    //   sorter: (a, b) => a.stockStatus.localeCompare(b.stockStatus),
    // },
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
    }
    // {
    //   title: "Type",
    //   dataIndex: "type",
    //   key: "type",
    //   width: 140,
    //   sorter: (a, b) => a.type.localeCompare(b.type),
    // },
    // {
    //   title: "HSN Code",
    //   dataIndex: "hsnCode",
    //   key: "hsnCode",
    //   width: 140,
    //   sorter: (a, b) => a.hsnCode.localeCompare(b.hsnCode),
    // },
    // {
    //   title: "Tax",
    //   dataIndex: "tax",
    //   key: "tax",
    //   width: 80,
    //   sorter: (a, b) => a.tax.localeCompare(b.tax),
    //   render: (text) => `${text}%`,
    // },
    // {
    //   title: "Minimum Stock Level",
    //   dataIndex: "minimumStockLevel",
    //   key: "minimumStockLevel",
    //   width: 180,
    //   sorter: (a, b) => a.minimumStockLevel - b.minimumStockLevel,
    // },
    // {
    //   title: "Maximum Stock Level",
    //   dataIndex: "maximumStockLevel",
    //   key: "maximumStockLevel",
    //   width: 180,
    //   sorter: (a, b) => a.maximumStockLevel - b.maximumStockLevel,
    // },
  ];

  // Update KPI-Driven Priorities Modal start

  const [alternate, setAlternate] = useState(false);
  const alternateModalClose = () => setAlternate(false);
  const alternateModalShow = () => setAlternate(true);

  // remove item
  const [removeItem, setRemoveItem] = useState(false);
  const removeItemModalClose = () => setRemoveItem(false);
  const removeItemModalShow = () => setRemoveItem(true);

  // edit item
  const [editItem, setEditItem] = useState(false);
  const editItemModalClose = () => setEditItem(false);
  const editItemItemModalShow = () => setEditItem(true);
  // edit item
  const [multipleItems, setMultipleItems] = useState(false);
  const multipleItemsModalClose = () => setMultipleItems(false);
  const multipleItemsModalShow = () => setMultipleItems(true);


  const [isVisible, setIsVisible] = useState(false);

  const handleToggle = () => {
    setIsVisible(!isVisible);
  }

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };
  const [orderDeadline, setOrderDeadline] = useState(getCurrentDateTime());


  const ItemType = [
    { value: 'All', label: 'All' },
    { value: ' Buy', label: ' Buy' },
    { value: ' Sell', label: 'Sell' },
    { value: ' Both', label: 'Both' },

  ]
  const CategoryItem = [
    { value: 'Finished Goods', label: 'Finished Goods' },
    { value: ' Raw Materials', label: ' Raw Materials' },
    { value: ' Semi-finished Goods', label: 'Semi-finished Goods' },
    { value: ' Consumables', label: 'Consumables' },
    { value: ' Bought-out Parts', label: 'Bought-out Parts' },
    { value: ' Trading Goods', label: 'Trading Goods' },
    { value: ' Service', label: 'Service' },
  ]

  // Tally Integration Extension Modal start
  const [showTallyIntegrationExtensionModal, setShowTallyIntegrationExtensionModal] = useState(false);
  const handleCloseTallyIntegrationExtensionModal = () => setShowTallyIntegrationExtensionModal(false);
  const handleShowTallyIntegrationExtensionModal = () => setShowTallyIntegrationExtensionModal(true);

  const faqItems = [
    {
      question: "Will my data be safe?",
      answer: "Absolutely. This chrome extension is created and owned by automybizz. automybizz maintains best-in-industry standards for data protection and privacy."
    },
    {
      question: "What all will I be able to download from Tally?",
      answer: "You'll be able to download your item and counter-party master data from Tally in an excel file. You can then directly upload the excel file on automybizz."
    },
    {
      question: "I'm not an expert on Tally, can I still download the master data?",
      answer: "Yes, absolutely! You just need to ensure Tally is opened in your system. If you still face issues, you can reach out to our chat support and we'd love to help you out!"
    }
  ];
  // Tally Integration Extension Modal end

  // Explore All Features Modal start
  const [showExploreAllFeaturesModal, setShowExploreAllFeaturesModal] = useState(false);
  const handleCloseExploreAllFeaturesModal = () => setShowExploreAllFeaturesModal(false);
  const handleShowExploreAllFeaturesModal = () => setShowExploreAllFeaturesModal(true);

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

  // Disable background scroll when any modal is open (must be after all modal state declarations)
  useEffect(() => {
    const modalOpen =
      showqty ||
      showAddSingleItemModal ||
      alternate ||
      removeItem ||
      editItem ||
      multipleItems ||
      showTallyIntegrationExtensionModal ||
      showExploreAllFeaturesModal ||
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
    showqty,
    showAddSingleItemModal,
    alternate,
    removeItem,
    editItem,
    multipleItems,
    showTallyIntegrationExtensionModal,
    showExploreAllFeaturesModal,
    showVariantsModal,
  ]);

  return (
    <>
      <InventoryMasterPageTopBar />
      {/* <ItemMasterStatusBar /> */}

      <div className="p-4">
        <div className="row">

          <div className="col-12">
            <div className="card mb-2">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center flex-wrap ">
                  <div className="d-flex gap-2 ms-auto">

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
                      // onAddMultipleItems={multipleItemsModalShow}
                      onSuccess={fetchData}
                      onAddSingleItem={handleShowAddSingleItemModal}
                      isBulkActions={false}
                    />
                  </div>
                </div>


                <div className="inventory-body pt-2">

                  <div className="inventory-body-wrap-body">
                    {/* <div className="inventory-master-filter pt-3 pb-1 ">
                      <div className="row">
                        <div className="col-xl-3 col-sm-6 item" onClick={handleClearFilter}>
                          <div className="card shadow-md cursor-pointer item_card">
                            <div className="card-body d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="my-1 text-white">Stock Value</h6>
                                <span className="ms-auto fs-5 fw-bold text-white">
                                  {getGeneralSettingssymbol}
                                  {totalDefaultPrice}
                                </span>
                              </div>
                              <div className="stockImg">
                                <img src={process.env.PUBLIC_URL + '/assets/images/item-white1.png'} alt="item" className="img" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          className="col-xl-3 col-sm-6 item"
                          onClick={() => handleCategoryFilter("lowStock")}
                        >
                          <div className="card shadow-md cursor-pointer item_card">
                            <div className="card-body d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="my-1 text-white">Low Stock</h6>
                                <span className="ms-auto fs-5 fw-bold text-white">
                                  {" "}
                                  {lowStockCount}
                                </span>
                              </div>
                              <div className="stockImg">
                                <img src={process.env.PUBLIC_URL + '/assets/images/low-stock.png'} alt="item" className="img" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          className="col-xl-3 col-sm-6 item"
                          onClick={() => handleCategoryFilter("excessStock")}
                        >
                          <div className="card shadow-md cursor-pointer item_card">
                            <div className="card-body d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="my-1 text-white">Excess Stock</h6>
                                <span className="ms-auto fs-5 fw-bold text-white">
                                  {excessStockCount}
                                </span>
                              </div>
                              <div className="stockImg">
                                <img src={process.env.PUBLIC_URL + '/assets/images/excess.png'} alt="item" className="img" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-xl-3 col-sm-6 item">
                          <Link to="/inventory/dashboard" className="text-decoration-none">
                            <div className="card shadow-md cursor-pointer item_card gth-bg-success">
                              <div className="card-body d-flex justify-content-between align-items-center">
                                <div>
                                  <h6 className="my-1 text-white">Inventory Dashboard</h6>
                                  <span className="ms-auto fs-5 fw-bold text-white d-flex align-items-center">
                                    View <i className="fi fi-rr-arrow-small-right ms-2 d-flex"></i>
                                  </span>
                                </div>
                                <div className="stockImg">
                                  <img src={process.env.PUBLIC_URL + '/assets/images/dashboard.png'} alt="item" className="img" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>

                      </div>
                    </div> */}
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
                              columns={columns}
                              dataSource={filteredData}
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


      {/* Update Product Stock qyt only Modal */}
      <Modal
        show={showqty}
        onHide={handleCloseqty}
        backdrop="static"
        keyboard={false}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Product Stock - {getitemId}</Modal.Title>
        </Modal.Header>
        {/* <Modal.Body> */}
        <form action="" onSubmit={handleSubmitStore} method="post">
          <Modal.Body className="pb-1 moday-body-overflow-none">
            <div className="row">
              <div className="col-md-12">
                <div className="form-group">
                  <label className="form-label">
                    Item Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="product_name"
                    placeholder="Enter Item Name"
                    className="form-control"
                    value={productData ? productData.product_name : ""}
                    disabled
                  />
                </div>
              </div>

              <div className="col-md-12">
                <div className="form-group">
                  <label className="form-label">
                    Select Store <span className="text-danger">*</span>
                  </label>
                  <div className="custom-select-wrap">
                    <Select
                      options={stores}
                      getOptionLabel={(option) => option.name}
                      getOptionValue={(option) => option.id}
                      value={stores.find((data) => data.id === selectedStore)}
                      onChange={handleStoreChange}
                      placeholder="Select Store"
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">
                    Quantity changed in Store
                  </label>
                  <input
                    type="number"
                    name="current_stock"
                    className="form-control"
                    value={currentStock}
                    disabled
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">
                    Final Quantity in Store
                  </label>
                  <input
                    type="number"
                    name="final_quantity"
                    className="form-control"
                    value={finalQuantity}
                    disabled
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Change Quantity</label>
                  <div className="d-flex">
                    <input
                      type="text"
                      name="change_quantity"
                      className="form-control w-100"
                      value={changeQuantity}
                      onChange={handleChangeQuantity}
                    />
                    {/* <input
                      type="text"
                      name="change_quantity"
                      className="form-control w-100"
                      value={changeQuantity}  
                      onChange={handleChangeQuantity}
                      onKeyDown={(e) => {
                        // Prevent increment/decrement with arrow keys
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                          e.preventDefault();
                        }
                      }}
                      inputMode="decimal" // Allows decimal inputs on mobile keyboards
                      pattern="[0-9]*\.?[0-9]*" // Validates decimal numbers
                    /> */}
                    <div className="d-flex align-items-center ms-2 gap-2 w-25">
                      <button type="button" className={` btn-outline-success ${getButtonClassNamePlus} modalAdd_btn`} onClick={incrementQuantity}>
                        <i className="fas fa-plus"></i>
                      </button>

                      <button type="button" className={` btn-outline-danger border-dashed ${getButtonClassNameNeg} modalAdd_btn`} onClick={decrementQuantity}>
                        <i className="fas fa-minus"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">UoM</label>
                  <Select
                    name="product_uom"
                    options={uomData}
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => option.id}
                    value={uomData.find((data) => data.id === finalUoM)}
                    isDisabled
                  />
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button type="submit" className="btn btn-success" disabled={getActualQuantity < 0}>
              Save
            </button>
          </Modal.Footer>
        </form>
        {/* </Modal.Body> */}
      </Modal>
      {/* Update Product Stock qyt only Modal */}


      {/* Update Product Stock Modal */}
      <Modal
        show={alternate}
        onHide={alternateModalClose}
        backdrop="static"
        // keyboard={false}
        centered
        size="md"
      // className="model_80"
      >
        <Modal.Header closeButton>
          <Modal.Title>Bulk Upload Alternate UOM</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='form-group '>
            <label className='form-label'>Upload UOM</label>
            <div className='custom-select-wrap'>
              <input type="file" required className='form-control' accept=".xlsx, .csv"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <div className="d-flex align-items-center gap-3 uploadView ">
            <div className="file"><i className="far fa-file-excel e_file"></i></div>
            <div className="d-flex align-items-center gap-3 w-100 ">
              <p className="mb-0 f-s-16 fw-bold ">Export (22).xlsx</p>
              <button type='button' className="btn ms-auto fit-btn p-1"><i className="fas fa-times  f-s-16"></i></button>
            </div>
          </div>


          <div className="border-top mt-5 d-flex justify-content-end gap-2 pt-3">
            <button type='button' className="btn btn-success"   >Submit</button>
            <button type='button' className="btn btn btn-warning" >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                id="Layer_1"
                data-name="Layer 1"
                viewBox="0 0 24 24"
                width={14}
                height={14}
                fill="currentColor"
                className='me-1'
              >
                <path d="m14,7.015V.474c.913.346,1.753.879,2.465,1.59l3.484,3.486c.712.711,1.245,1.551,1.591,2.464h-6.54c-.552,0-1-.449-1-1Zm7.976,3h-6.976c-1.654,0-3-1.346-3-3V.038c-.161-.011-.322-.024-.485-.024h-4.515C4.243.015,2,2.258,2,5.015v14c0,2.757,2.243,5,5,5h10c2.757,0,5-2.243,5-5v-8.515c0-.163-.013-.324-.024-.485Zm-6.269,8.506l-1.613,1.614c-.577.577-1.336.866-2.094.866s-1.517-.289-2.094-.866l-1.613-1.614c-.391-.391-.391-1.024,0-1.414.391-.391,1.023-.391,1.414,0l1.293,1.293v-4.398c0-.552.447-1,1-1s1,.448,1,1v4.398l1.293-1.293c.391-.391,1.023-.391,1.414,0,.391.39.391,1.023,0,1.414Z" />
              </svg>
              Download Template</button>
          </div>
        </Modal.Body>
      </Modal>
      {/* Bulk Upload Alternate UOM */}


      {/* edit Item Multiple Modal*/}
      <Modal
        show={editItem}
        onHide={editItemModalClose}
        backdrop="static"
        keyboard={false}
        centered
        size="xxxl"
        id="editItemMultipleModal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Edit Items (Multiple)
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="moday-body-overflow-none">
          <p>You can bulk delete multiple items using an <strong>Excel(.xlsx)</strong> file. [Note: 1. a maximum of 500 items is allowed at a time; 2. Unit of Measurement can NOT be changed]</p>
          <h6>Required Data Format</h6>
          <div className="w-100 mt-3 position-relative">
            <div className="sample_data_badge">
              Sample Data
            </div>
            <div className="table-responsive">
              <table className="table-bordered primary-table-head">
                <thead>
                  <tr>
                    <th>
                      Item ID *
                    </th>
                    <th>
                      Item Name
                    </th>
                    <th>
                      Product/Service
                    </th>
                    <th>
                      Item Type (Buy/Sell/Both)
                    </th>
                    <th >
                      Unit of Measurement
                    </th>
                    <th >
                      HSN Code
                    </th>
                    <th>
                      Item Category
                    </th>
                    <th>
                      Default Price
                    </th>
                    <th >
                      Regular Buying Price
                    </th>
                    <th>
                      Wholesale Buying Price
                    </th>
                    <th >
                      Regular Selling Price
                    </th>
                    <th>
                      MRP
                    </th>
                    <th >
                      Dealer Price
                    </th>
                    <th >
                      Distributor Price
                    </th>
                    <th >
                      Min Stock Level
                    </th>
                    <th >
                      Max Stock Level
                    </th>
                    <th >
                      Tax
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div style={{ width: '120px' }}>RM001</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>Raw Material 1</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>Product</div>
                    </td>
                    <td>
                      <div style={{ width: '180px' }}>Buy</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>Kg</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>4040</div>
                    </td>
                    <td>
                      <div style={{ width: '120px' }}></div>
                    </td>
                    <td>
                      <div style={{ width: '120px' }}>100</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>150</div>
                    </td>
                    <td>
                      <div style={{ width: '170px' }}>150</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>150</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>150</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>150</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>150</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>1000</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>3000</div>
                    </td>
                    <td>
                      <div style={{ width: '150px' }}>12</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="pt-2 mb-3">
              <div className="dropdown">
                <button type='button' className="btn btn-warning dropdown-toggle" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    id="Layer_1"
                    data-name="Layer 1"
                    viewBox="0 0 24 24"
                    width={14}
                    height={14}
                    fill="currentColor"
                    className='me-1'
                  >
                    <path d="m14,7.015V.474c.913.346,1.753.879,2.465,1.59l3.484,3.486c.712.711,1.245,1.551,1.591,2.464h-6.54c-.552,0-1-.449-1-1Zm7.976,3h-6.976c-1.654,0-3-1.346-3-3V.038c-.161-.011-.322-.024-.485-.024h-4.515C4.243.015,2,2.258,2,5.015v14c0,2.757,2.243,5,5,5h10c2.757,0,5-2.243,5-5v-8.515c0-.163-.013-.324-.024-.485Zm-6.269,8.506l-1.613,1.614c-.577.577-1.336.866-2.094.866s-1.517-.289-2.094-.866l-1.613-1.614c-.391-.391-.391-1.024,0-1.414.391-.391,1.023-.391,1.414,0l1.293,1.293v-4.398c0-.552.447-1,1-1s1,.448,1,1v4.398l1.293-1.293c.391-.391,1.023-.391,1.414,0,.391.39.391,1.023,0,1.414Z" />
                  </svg>
                  Download Template
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                  <li><button type='button' className="dropdown-item">Download Blank Template</button></li>
                  <li><button type='button' className="dropdown-item" onClick={handleToggle}>Download Template With Items</button></li>
                </ul>
              </div>
              {isVisible && (
                <div className="p-3 border rounded-4 my-3 pb-0" >
                  <div className="row">
                    <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">Creation Date (From)</label>
                        <input
                          type="datetime-local"
                          value={orderDeadline}
                          onChange={(e) => setOrderDeadline(e.target.value)}
                          required
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">Creation Date (To)</label>
                        <input
                          type="datetime-local"
                          value={orderDeadline}
                          onChange={(e) => setOrderDeadline(e.target.value)}
                          required
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">Item Type</label>
                        <div className="custom-select-wrap">
                          <Select
                            name="vendor_name"
                            options={ItemType}
                            theme={(theme) => ({
                              ...theme,
                              colors: {
                                ...theme.colors,
                                primary25: "#ddddff",
                                primary: "#6161ff",
                              },
                            })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">Item Category</label>
                        <div className="custom-select-wrap">
                          <Select
                            name="vendor_name"
                            options={CategoryItem}
                            theme={(theme) => ({
                              ...theme,
                              colors: {
                                ...theme.colors,
                                primary25: "#ddddff",
                                primary: "#6161ff",
                              },
                            })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-group d-flex justify-content-end ">
                        <button className="btn btn-exp-green" type='button'>
                          Download Template With Items
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className='form-group mb-0'>
                  <label className='form-label'>Upload File</label>
                  <div className='custom-select-wrap'>
                    <input type="file" required className='form-control' accept=".xlsx, .csv"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type='button' className="btn btn-secondary">Cancel</button>
          <button type='submit' className="btn btn-success">Submit</button>
        </Modal.Footer>
      </Modal>
      {/* edit Item Multiple Modal */}
      {/* Delete multiple item*/}
      {/* <DeleteMultipleItemsModal
        show={removeItem}
        onClose={removeItemModalClose}
      /> */}
      {/* Delete multiple item */}

      {/* Add Multiple Items Modal */}
      <AddMultipleItemsModal
        show={multipleItems}
        onClose={multipleItemsModalClose}
        FetchProduct={fetchData}
      />
      {/* Add Multiple Items Modal End*/}
      {/* Tally Integration Extension Modal Start*/}
      <TallyIntegrationModal
        show={showTallyIntegrationExtensionModal}
        handleClose={handleCloseTallyIntegrationExtensionModal}
        faqItems={faqItems}
      />
      {/* Tally Integration Extension Modal end*/}
      {/* Explore All Features Modal Start*/}
      <ExploreAllFeaturesModal
        show={showExploreAllFeaturesModal}
        handleClose={handleCloseExploreAllFeaturesModal}
      />
      {/* Explore All Features Modal end*/}

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
                          {/* <th>Price per Unit</th> */}
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
                            {/* <td>
                              {variant.price_per_unit ? (
                                <span className="fw-medium">{variant.price_per_unit}</span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td> */}
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
                          {/* <th>Required</th> */}
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
                            {/* <td>
                              {attr.productAttribute?.is_required === 1 ? (
                                <span className="badge bg-danger">Required</span>
                              ) : (
                                <span className="badge bg-secondary">Optional</span>
                              )}
                            </td> */}
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
