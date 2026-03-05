import React, { useEffect, useState } from "react";
import { OverlayTrigger, Tooltip, Modal } from "react-bootstrap";

import Select from "react-select";

import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
// import { UserAuth } from "../auth/Auth";
// import {
//   AllCategories,
// } from "../../environment/GlobalApi";
import "../global.css";
import {
  PrivateAxios,
  // PrivateAxiosFile,
} from "../../environment/AxiosInstance";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import InventoryMasterEditTopBar from "./InventoryMasterEdit/InventoryMasterEditTopBar";
function InventoryMasterEditItemDetails() {
  const [isEditing, setIsEditing] = useState(false);
  // const [isEditing1, setIsEditing1] = useState(false);
  // const [isEditing2, setIsEditing2] = useState(false);
  // const [isEditing3, setIsEditing3] = useState(false);
  // const [isEditingO, setIsEditingO] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteShow, setDeleteShow] = useState(false);
  // const [stores, setStores] = useState([]);
  // const [users, setUsers] = useState([]);
  const location = useLocation();
  // const { user, Logout } = UserAuth();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("auth_user")) || null);
  const navigate = useNavigate();
  const { data } = location.state || {};
  const { id } = useParams();
  // const [catProduct, setcategory] = useState([
  //   { value: "select", label: "-Select-" },
  // ]);

  const [uomData, setUomData] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [formData, setFormData] = useState({
    product_code: "",
    product_name: "",
    product_type_id: null,
    product_category_id: null,
    is_batch_applicable: "1",
    brand_id: null,
    // uom_id: null,
    // buffer_size: "",
    dynamic_attributes: [], // dynamic attributes,
    product_variants: [], // product variants
    masterUOM: null,
    masterProductType: null,
    masterProductCategory: null,
  });
  // const [message, setMessage] = useState("");
  const [error, setError] = useState({});
  
  // const [formData, setAddItemFormData] = useState({
  //   product_code: "",
  //   product_name: "",
  //   product_type_id: null,
  //   is_batch_applicable: "1",
  //   uom_id: null,
  //   buffer_size: "",
  //   dynamic_attributes: [] // dynamic attributes
  // });
  const [productTypes, setProductTypes] = useState([]);
  const [masterBrands, setMasterBrands] = useState([]);
  const [selectedProductType, setSelectedProductType] = useState([]);
  const [selectedProductCategory, setSelectedProductCategory] = useState([]);
  const [productAttributes, setProductAttributes] = useState([]);
  const [selectedBatchApplicable, setSelectedBatchApplicable] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  // const [dynamicProductAttributes, setDynamicProductAttributes] = useState([]);
  
  // Product variants state
  const [productVariants, setProductVariants] = useState([]);
  const [isEditingVariants, setIsEditingVariants] = useState(false);


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
   * Fetch master product categories
   */
  const fetchProductCategories = async() => {
    try {
      const res = await PrivateAxios.get(`master/product-category`);
      setProductCategories(res.data.data);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Fetch master product attributes
   */
  const fetchProductAttributes = async () => {
    try {
      const productAttributesRes = await PrivateAxios.get(
        `master/product-attribute/list?company_id=${user?.company_id}`
      );
  
      setProductAttributes(productAttributesRes.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  }

  const fetchMasterBrands = async () => {
    try {
      const res = await PrivateAxios.get(`master/brand/list`);
      setMasterBrands(res.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchUomData();
    fetchProductTypes();
    fetchProductAttributes();
    fetchProductCategories();
    fetchMasterBrands();
  }, []);

  /**
   * Fetch product details
   */
  const fetchData = async () => {
    try {
      const productResponse = await PrivateAxios.get(`product/details/${id}`);

      const productData = productResponse.data.data;
      const attributeValues = productData?.productAttributeValues || [];

      const updatedAttributes = productAttributes.map(attr => {
        const matchedValue = attributeValues.find(
          v => Number(v.product_attribute_id) === Number(attr.id)
        );

        return {
          ...attr,
          value: matchedValue ? matchedValue.value : null
        }
      });

      setFormData(prev => {
        prev.dynamic_attributes = updatedAttributes;
        return {
          ...prev,
          ...productData,
        }
      });

      // Load product variants
      if (productData?.productVariants && Array.isArray(productData.productVariants)) {
        const variants = productData.productVariants.map((variant, index) => ({
          id: variant.id || Date.now() + index,
          uom_id: variant.uom_id || null,
          weight: variant.weight_per_unit?.toString() || ""
        }));
        setProductVariants(variants);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [productAttributes]);

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


  useEffect(() => {
    setSelectedBatchApplicable(formData.is_batch_applicable);
  }, [formData?.is_batch_applicable]);

  useEffect(() => {
    if (!isEditing) {
      setErrorMessage(null);
    }
  }, [isEditing])


  useEffect(() => {
    setSelectedProductType(productTypes?.find(
      opt => opt.id === formData.product_type_id
    ));
  }, [productTypes, formData]);

  useEffect(() => {
    setSelectedProductCategory(productCategories?.find(
      opt => opt.id === formData?.product_category_id
    ));
  }, [productCategories, formData]);

  useEffect(() => {
    setSelectedBrand(masterBrands?.find(
      opt => opt.id === formData.brand_id
    ));
  }, [masterBrands, formData]);

  // Get add item input type fields
  const handleAddItemFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  // Get add item dropdown type fields
  const handleAddItemSelectChange = (fieldName) => (selectedOption) => {
    if (fieldName === 'product_type_id') {
      setSelectedProductType(selectedOption);
    } else if (fieldName === 'is_batch_applicable') {
      setSelectedBatchApplicable(selectedOption.value);
    } else if (fieldName === 'product_category_id') {
      setSelectedProductCategory(selectedOption);
    } else if (fieldName === 'brand_id') {
      setSelectedBrand(selectedOption);
    }
    setFormData(prev => ({
      ...prev,
      [fieldName]: selectedOption.id
    }));
  };

  const handleDynamicChange = (e) => {
    const { value, dataset } = e.target;
  
    const attrId = Number(dataset.attrId);
    const isRequired = Number(dataset.required);
  
    setFormData(prev => {
      const existingIndex = prev.dynamic_attributes.findIndex(
        attr => attr.id === attrId
      );
  
      let updatedAttributes;
  
      if (existingIndex !== -1) {
        // Update existing attribute value
        updatedAttributes = prev.dynamic_attributes.map(attr =>
          attr.id === attrId
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

  // Add item form validation
  const validateAddItemForm = () => {
    let newErrors = {};
  
    if (!formData.product_code.trim()) {
      newErrors.product_code = "Item Code is required";
    } else if (!formData.product_name.trim()) {
      newErrors.product_name = "Item Name is required";
    } else if (!formData.product_type_id) {
      newErrors.product_type_id = "Item Type is required";
    }  else if (!formData.product_category_id) {
      newErrors.product_category_id = "Category is required";
    } else {
      // 🔥 Dynamic attributes validation (ARRAY BASED)
      formData.dynamic_attributes.forEach(attr => {
        if (attr.is_required === 1) {
          const found = formData.dynamic_attributes.find(
            item => item.id === attr.id
          );

          if (!found || !found.value?.trim()) {
            newErrors[`dynamic_${attr.id}`] = `${attr.name} is required`;
          }
        }
      });

      // Validate product variants - at least one complete variant is required
      const validVariants = productVariants.filter(
        variant => variant.uom_id && variant.weight && variant.weight.trim() !== ""
      );
      
      if (validVariants.length === 0) {
        newErrors.product_variants = "At least one product variant with Unit of Measurement and Weight is required";
      }

      productVariants.forEach(variant => {
        if (variant.weight?.trim() === "" || variant.uom_id === null) {
          newErrors.product_variants = "Both Unit of Measurement and Weight is required for all variants";
        }
      });
    }
  
    setErrorMessage(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProductUpdate = async () => {
    // Check validation before submit data
    if (!validateAddItemForm()) return;

    const product_attributes_payload = formData.dynamic_attributes.map((attribute) => {
      return {
        product_attribute_id: attribute.id,
        is_required: attribute.is_required,
        value: attribute.value
      };
    })

    // Prepare variants data for submission
    // const variantsData = productVariants
    //   .filter(variant => variant.uom_id && variant.weight)
    //   .map(variant => ({
    //     id: variant.id ? variant.id : null,
    //     uom_id: variant.uom_id,
    //     weight: parseFloat(variant.weight) || 0
    //   }));

    const productData = {
      product_code: formData.product_code,
      product_name: formData.product_name,
      product_type_id: formData.product_type_id,
      product_category_id: formData.product_category_id,
      is_batch_applicable: formData.is_batch_applicable,
      brand_id: formData.brand_id,
      dynamic_attributes: product_attributes_payload,
      // product_variants: variantsData
    };

    try {
      const response = await PrivateAxios.post(`product/update/${id}`, productData);
      if (response.status === 200) {
        setIsEditing(false);
        setIsEditingVariants(false);
        fetchData();
        SuccessMessage("Data saved successfully");
      } else {
        ErrorMessage("Failed to save data");
      }
    } catch (error) {
      console.error("Error updating section:", error);
      ErrorMessage("Failed to save data");
    }
  }

  const handleVariantsUpdate = async () => {
    // Check validation for variants
    const validVariants = productVariants.filter(
      variant => variant.uom_id && variant.weight && variant.weight.trim() !== ""
    );
    
    if (validVariants.length === 0) {
      setErrorMessage({ product_variants: "At least one product variant with Unit of Measurement and Weight is required" });
      return;
    }

    // Prepare variants data for submission
    const variantsData = validVariants.map(variant => ({
      id: variant.id ? variant.id : null,
      uom_id: variant.uom_id,
      weight: parseFloat(variant.weight) || 0
    }));

    const productData = {
      product_variants: variantsData
    };

    try {
      const response = await PrivateAxios.post(`product/update-variants/${id}`, productData);
      if (response.status === 200) {
        setIsEditingVariants(false);
        fetchData();
        SuccessMessage("Product variants saved successfully");
      } else {
        ErrorMessage("Failed to save variants");
      }
    } catch (error) {
      console.error("Error updating variants:", error);
      ErrorMessage("Failed to save variants");
    }
  }

  // const handleSectionUpdate = async (sectionName) => {
  //   let sectionData = {};
  //   let editdata = new FormData()
  //   switch (sectionName) {
  //     case "BasicDetails":
  //       sectionData = {
  //         product_code: formData.product_code,
  //         product_name: formData.product_name,
  //         product_type_id: formData.product_type_id,
  //         uom_id: formData.uom_id,
  //         product_category_id: formData.product_category_id,
  //         buffer_size: formData.buffer_size,
  //         is_batch_applicable: formData.buffer_size,
  //         dynamic_attributes: formData.dynamic_attributes        
  //       };
  //       break;
  //     case "PriceDetails":
  //       sectionData = {
  //         product_price: formData.product_price,
  //         regular_buying_price: formData.regular_buying_price,
  //         regular_selling_price: formData.regular_selling_price,
  //         dealer_price: formData.dealer_price,
  //         wholesale_buying_price: formData.wholesale_buying_price,
  //         mrp: formData.mrp,
  //         distributor_price: formData.distributor_price,
  //       };
  //       break;
  //     case "StockDetails":
  //       sectionData = {
  //         total_stock: formData.total_stock,
  //         minimum_stock_level: formData.minimum_stock_level,
  //         reject_stock: formData.reject_stock,
  //         maximum_stock_level: formData.maximum_stock_level,
  //       };
  //       break;
  //     case "OthersDetails":
  //       sectionData = {
  //         safety_stock: formData.safety_stock,
  //         sku_description: formData.sku_description,
  //         replenishment_time: formData.replenishment_time,
  //         replenishment_multiplications: formData.replenishment_multiplications,
  //         minimum_replenishment: formData.minimum_replenishment,
  //         buffer_size: formData.buffer_size,
  //       };
  //       break;
  //     case "Attachments":
  //       editdata.append("file", formData.file)
  //       break;
  //     default:
  //       console.error("Invalid section name");
  //       return;
  //   }

  //   try {

  //     const response = await PrivateAxiosFile.post(`product/update/${id}`, sectionName == 'Attachments' ? editdata : sectionData);
  //     if (response.status === 200) {
  //       setIsEditing(false);
  //       setIsEditing1(false);
  //       setIsEditing2(false);
  //       setIsEditing3(false);
  //       setIsEditingO(false);
  //       fetchData();
  //       SuccessMessage("Data saved successfully");
  //     } else {
  //       ErrorMessage("Failed to save data");
  //     }
  //   } catch (error) {
  //     console.error("Error updating section:", error);
  //   }
  // };

  //delete
  const deleteModalClose = () => setDeleteShow(false);
  // const deleteModalShow = () => setDeleteShow(true);
  //delete
  const deleteModalShow = (id) => {
    setDeleteId(id);
    setDeleteShow(true);
  };
  const handleDelete = () => {
    PrivateAxios.delete(`product/${deleteId}`)
      .then((res) => {
        setDeleteShow(false);
        setDeleteId(null);
        SuccessMessage("Record deleted successfully");
        navigate('/inventory/inventory-master');
      })
      .catch((error) => {
        console.error('Error deleting data:', error);
        setDeleteShow(false);
        setDeleteId(null);
      });
  };
  // const getAdjustmentDisplayName = (adjustmentType) => {
  //   switch (adjustmentType) {
  //     case 'adjustment':
  //       return 'Manual Adjustment';
  //     case 'Out':
  //       return 'Dispatched'; // Assuming you want 'Out' to display as 'Dispatched'
  //     case 'StockTransfer':
  //       return 'Stock Transfer';
  //     default:
  //       return adjustmentType; // Default to the original name
  //   }
  // };
  return (
    <>
      <InventoryMasterEditTopBar />
      <div className="p-4">
        <div className="card">
          <div className="card-header text-dark text-danger">
            <h5 className="mb-0">Item Details ({formData.product_code})</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-lg-6 col-md-6 col-sm-12 mb-4">
                <div className="itemDetails_card">
                  <div className="card-header d-flex flex-wrap justify-content-between">
                    <div className="d-flex align-items-center my-1">
                      <h5 className="mb-0 me-3 fw-bold text-dark">
                        Basic Details
                      </h5>
                      <label className="mb-0 badge exp-badge-primary-light rounded-pill">
                        Product
                      </label>
                    </div>
                    <div className="ms-auto">
                      {!isEditing ? (
                        <div className="first-- d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Delete</Tooltip>}
                          >
                            <button type='button' className="btn icon-btn w-fit-content" onClick={() => deleteModalShow(data.id)}>
                              <i className="fas fa-trash-alt text-danger"></i>
                            </button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit</Tooltip>}
                          >
                            <button
                              className="btn icon-btn w-fit-content"
                              onClick={() => setIsEditing(true)}
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      ) : (
                        <div className="second-- d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Cancel</Tooltip>}
                          >
                            <button
                              className="btn icon-btn bg-danger w-fit-content"
                              onClick={() => setIsEditing(false)}
                            >
                              <i className="fas fa-times text-white"></i>
                            </button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Save</Tooltip>}
                          >
                            <button
                              className="btn icon-btn bg-success w-fit-content"
                              onClick={handleProductUpdate}
                            >
                              <i className="fas fa-save text-white"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card-body pb-1">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">
                            Item Code  <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            id="product_code"
                            name="product_code"
                            placeholder="Enter Item Id"
                            className="form-control css-olqui2-singleValue"
                            value={formData.product_code}
                            onChange={handleAddItemFormChange}
                            disabled={!isEditing}
                          />
                          {errorMessage?.product_code && (
                            <span className="error-message">{errorMessage.product_code}</span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">
                            Item Name  <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            id="product_name"
                            name="product_name"
                            placeholder="Enter Item Name"
                            className="form-control css-olqui2-singleValue"
                            value={formData.product_name}
                            onChange={handleAddItemFormChange}
                            disabled={!isEditing}
                          />
                          {errorMessage?.product_name && (
                            <span className="error-message">{errorMessage.product_name}</span>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">
                            Brand
                          </label>
                          <Select
                            name="brand_id"
                            id="brand_id"
                            options={masterBrands}
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.id}
                            value={selectedBrand}
                            isDisabled={!isEditing}
                            onChange={handleAddItemSelectChange("brand_id")}
                          />
                          {errorMessage?.brand_id && (
                            <span className="error-message">{errorMessage.brand_id}</span>
                          )}
                        </div>
                      </div>


                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">
                            Item Type  <span className="text-danger">*</span>
                          </label>
                          <Select
                            name="product_type_id"
                            id="product_type_id"
                            options={productTypes}
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.id}
                            value={selectedProductType}
                            isDisabled={!isEditing}
                            onChange={handleAddItemSelectChange("product_type_id")}
                          />
                          {errorMessage?.product_type_id && (
                            <span className="error-message">{errorMessage.product_type_id}</span>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">
                            Category  <span className="text-danger">*</span>
                          </label>
                          <Select
                            name="product_category_id"
                            id="product_category_id"
                            options={productCategories}
                            getOptionLabel={(option) => option.title}
                            getOptionValue={(option) => option.id}
                            value={selectedProductCategory}
                            isDisabled={!isEditing}
                            onChange={handleAddItemSelectChange("product_category_id")}
                          />
                          {errorMessage?.product_category_id && (
                            <span className="error-message">{errorMessage.product_category_id}</span>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">
                            Batch Applicable  <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-select css-olqui2-singleValue"
                            id="is_batch_applicable"
                            name="is_batch_applicable"
                            value={selectedBatchApplicable}
                            disabled={!isEditing}
                            onChange={handleAddItemSelectChange("is_batch_applicable")}
                          >
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                          </select>
                        </div>
                      </div>
                      {formData.dynamic_attributes.map((attr) => (
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
                              key={attr.id}
                              name={`attribute_${attr.id}`}
                              placeholder={`Enter ${attr.name}`}
                              data-attr-id={attr.id}
                              data-required={attr.is_required}
                              className="form-control css-olqui2-singleValue"
                              value={attr.value ?? ''}
                              onChange={handleDynamicChange}
                              disabled={!isEditing}
                            />
                          {errorMessage?.[`dynamic_${attr?.id}`] && (
                              <span className="error-message">
                                {errorMessage[`dynamic_${attr?.id}`]}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {/* <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Item Category</label>
                          <Select
                            name="product_category"
                            value={
                              formData.product_category
                                ? { value: formData.product_category, label: formData.product_category_label || formData.Categories?.title }
                                : null
                            }
                            options={catProduct}
                            onChange={getTaskData}
                            isDisabled={!isEditing}
                          />

                        </div>
                      </div> */}
                      {/* <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Tax</label>
                          <input
                            type="text"
                            name="tax"
                            value={formData.tax}
                            placeholder="Enter TAX"
                            className="form-control"
                            onChange={getTaskData}
                            disabled={!isEditing}
                          />
                        </div>
                      </div> */}
                      {/* <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">HSN Code</label>
                          <input
                            type="text"
                            name="hsn_code"
                            value={formData.hsn_code}
                            placeholder="Enter HSN Code"
                            className="form-control"
                            onChange={getTaskData}
                            disabled={!isEditing}
                          />
                        </div>
                      </div> */}
                      {/* <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">SKU</label>
                          <input
                            type="text"
                            name="sku_product"
                            value={formData.sku_product}
                            placeholder="Enter SKU"
                            className="form-control"
                            onChange={getTaskData}
                            disabled={!isEditing}
                          />
                        </div>
                      </div> */}
                 
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-md-6 col-sm-12 mb-4">
                <div className="itemDetails_card">
                  <div className="card-header d-flex flex-wrap justify-content-between">
                    <div className="d-flex align-items-center my-1">
                      <h5 className="mb-0 me-3 fw-bold">
                        Product Variants
                      </h5>
                    </div>
                    <div className="ms-auto">
                      {!isEditingVariants ? (
                        <div className="first-- d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit</Tooltip>}
                          >
                            <button
                              className="btn icon-btn w-fit-content"
                              onClick={() => setIsEditingVariants(true)}
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      ) : (
                        <div className="second-- d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Cancel</Tooltip>}
                          >
                            <button
                              className="btn icon-btn bg-danger w-fit-content"
                              onClick={() => {
                                setIsEditingVariants(false);
                                fetchData(); // Reset to original data
                              }}
                            >
                              <i className="fas fa-times text-white"></i>
                            </button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Save</Tooltip>}
                          >
                            <button
                              className="btn icon-btn bg-success w-fit-content"
                              onClick={handleVariantsUpdate}
                            >
                              <i className="fas fa-save text-white"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card-body pb-1">
                    {productVariants.length === 0 ? (
                      <p className="text-muted text-center mb-0 py-3">
                        No variants added. Click "Edit" to add product variants.
                      </p>
                    ) : (
                      <div className="row">
                        {productVariants.map((variant, index) => (
                          <div className="col-12 mb-3" key={variant.id}>
                            <div className="card border-secondary">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <h6 className="mb-0">Variant {index + 1}</h6>
                                  {isEditingVariants && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-danger"
                                      onClick={() => handleRemoveVariant(variant.id)}
                                    >
                                      <i className="fas fa-trash"></i> Remove
                                    </button>
                                  )}
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
                                        isDisabled={!isEditingVariants}
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
                                        className="form-control css-olqui2-singleValue"
                                        placeholder="Enter Weight"
                                        value={variant.weight}
                                        onChange={(e) => handleVariantWeightChange(variant.id, e.target.value)}
                                        disabled={!isEditingVariants}
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
                    {isEditingVariants && (
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
                    )}
                    {errorMessage?.product_variants && (
                      <div className="row mt-2">
                        <div className="col-12">
                          <span className="error-message">{errorMessage.product_variants}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* <div className="col-lg-6 col-md-6 col-sm-12 mb-4">
                <div className="itemDetails_card">
                  <div className="card-header d-flex flex-wrap justify-content-between">
                    <div className="d-flex align-items-center my-1">
                      <h5 className="mb-0 me-3 fw-bold text-dark">
                        Price Details
                      </h5>
                    </div>
                    <div className="ms-auto">
                      {!isEditing2 ? (
                        <div className="first-- d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit</Tooltip>}
                          >
                            <button
                              className="btn icon-btn w-fit-content"
                              onClick={() => setIsEditing2(true)}
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      ) : (
                        <div className="second-- d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Cancel</Tooltip>}
                          >
                            <button
                              className="btn icon-btn bg-danger w-fit-content"
                              onClick={() => setIsEditing2(false)}
                            >
                              <i className="fas fa-times text-white"></i>
                            </button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Save</Tooltip>}
                          >
                            <button
                              className="btn icon-btn bg-success w-fit-content"
                              onClick={() => handleSectionUpdate("PriceDetails")}
                            >
                              <i className="fas fa-save text-white"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card-body pb-1">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Default Price</label>
                          <div className="d-flex">
                            <input
                              type="text"
                              placeholder="Enter Default Price"
                              onChange={getTaskData}
                              value={formData.product_price}
                              name="product_price"
                              className="form-control"
                              disabled={!isEditing2}
                            />
                            <button type='button' className="link-btn ps-2">
                              <i className="fas fa-long-arrow-alt-down text-primary"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12">
                        <h6>Other Prices</h6>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Regular Buying Price</label>
                          <input
                            type="text"
                            name="regular_buying_price"
                            placeholder="Enter Regular Buying Price"
                            onChange={getTaskData}
                            value={formData.regular_buying_price}
                            className="form-control"
                            disabled={!isEditing2}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Wholesale Buying Price</label>
                          <input
                            type="text"
                            name="wholesale_buying_price"
                            placeholder="Enter Wholesale Buying Price"
                            onChange={getTaskData}
                            value={formData.wholesale_buying_price}
                            className="form-control"
                            disabled={!isEditing2}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Regular Selling Price</label>
                          <input
                            type="text"
                            name="regular_selling_price"
                            placeholder="Enter Regular Selling Price"
                            onChange={getTaskData}
                            value={formData.regular_selling_price}
                            className="form-control"
                            disabled={!isEditing2}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">MRP</label>
                          <input
                            type="text"
                            name="mrp"
                            placeholder="Enter MRP"
                            onChange={getTaskData}
                            value={formData.mrp}
                            className="form-control"
                            disabled={!isEditing2}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Dealer Price</label>
                          <input
                            type="text"
                            name="dealer_price"
                            placeholder="Enter Dealer Price"
                            onChange={getTaskData}
                            className="form-control"
                            value={formData.dealer_price}
                            disabled={!isEditing2}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Distributor Price</label>
                          <input
                            type="text"
                            name="distributor_price"
                            placeholder="Enter Distributor Price"
                            onChange={getTaskData}
                            value={formData.distributor_price}
                            className="form-control"
                            disabled={!isEditing2}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}
              {/* <div className="col-lg-6 col-md-6 col-sm-12 mb-4">
                <div className="itemDetails_card">
                  <div className="card-header d-flex flex-wrap justify-content-between">
                    <div className="d-flex align-items-center my-1">
                      <h5 className="mb-0 me-3 fw-bold text-dark">
                        Stock Details
                      </h5>
                    </div>
                    <div className="ms-auto">
                      {!isEditing1 ? (
                        <div className="first-- d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit</Tooltip>}
                          >
                            <button
                              className="btn icon-btn w-fit-content"
                              onClick={() => setIsEditing1(true)}
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      ) : (
                        <div className="second-- d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Cancel</Tooltip>}
                          >
                            <button
                              className="btn icon-btn bg-danger w-fit-content"
                              onClick={() => setIsEditing1(false)}
                            >
                              <i className="fas fa-times text-white"></i>
                            </button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Save</Tooltip>}
                          >
                            <button
                              className="btn icon-btn bg-success w-fit-content"
                              onClick={() => handleSectionUpdate("StockDetails")}
                            >
                              <i className="fas fa-save text-white"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card-body pb-1">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Total Stock</label>
                          <input
                            type="text"
                            placeholder="Enter Total Stock "
                            name="total_stock"
                            onChange={getTaskData}
                            value={formData.total_stock}
                            className="form-control"
                            disabled={!isEditing1}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Reject Stock</label>
                          <input
                            type="text"
                            placeholder="Enter Reject Stock"
                            name="reject_stock"
                            onChange={getTaskData}
                            value={formData.reject_stock}
                            className="form-control"
                            disabled={!isEditing1}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Minimum Stock Level</label>
                          <input
                            type="text"
                            value={formData.minimum_stock_level}
                            name="minimum_stock_level"
                            onChange={getTaskData}
                            placeholder="Enter Minimum Stock Level"
                            className="form-control"
                            disabled={!isEditing1}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Maximum Stock Level</label>
                          <input
                            type="text"
                            value={formData.maximum_stock_level}
                            name="maximum_stock_level"
                            onChange={getTaskData}
                            placeholder="Enter Maximum Stock Level"
                            className="form-control"
                            disabled={!isEditing1}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-md-6 col-sm-12 mb-4">
                <div className="itemDetails_card">
                  <div className="card-header d-flex flex-wrap justify-content-between">
                    <div className="d-flex align-items-center my-1">
                      <h5 className="mb-0 me-3 fw-bold text-dark">
                        Others Details
                      </h5>
                    </div>
                    <div className="ms-auto">
                      {!isEditingO ? (
                        <div className="first-- d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit</Tooltip>}
                          >
                            <button
                              className="btn icon-btn w-fit-content"
                              onClick={() => setIsEditingO(true)}
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      ) : (
                        <div className="second-- d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Cancel</Tooltip>}
                          >
                            <button
                              className="btn icon-btn bg-danger w-fit-content"
                              onClick={() => setIsEditingO(false)}
                            >
                              <i className="fas fa-times text-white"></i>
                            </button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Save</Tooltip>}
                          >
                            <button
                              className="btn icon-btn bg-success w-fit-content"
                              onClick={() => handleSectionUpdate("OthersDetails")}
                            >
                              <i className="fas fa-save text-white"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card-body pb-1">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Safety Stock</label>
                          <input
                            type="text"
                            name="safety_stock"
                            onChange={getTaskData}
                            placeholder="Enter Safty Stock "
                            value={formData.safety_stock}
                            className="form-control"
                            disabled={!isEditingO}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">SKU Description</label>
                          <input
                            type="text"
                            name="sku_description"
                            onChange={getTaskData}
                            placeholder="Enter SKU Description"
                            value={formData.sku_description}
                            className="form-control"
                            disabled={!isEditingO}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Replenishment Time</label>
                          <input
                            type="text"
                            name="replenishment_time"
                            onChange={getTaskData}
                            value={formData.replenishment_time}
                            placeholder="Enter Replenishment Time"
                            className="form-control"
                            disabled={!isEditingO}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">
                            Replenishment Multiplications
                          </label>
                          <input
                            type="text"
                            name="replenishment_multiplications"
                            onChange={getTaskData}
                            value={formData.replenishment_multiplications}
                            placeholder="Enter Replenishment Multiplications"
                            className="form-control"
                            disabled={!isEditingO}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Minimum Replenishment</label>
                          <input
                            type="text"
                            name="minimum_replenishment"
                            onChange={getTaskData}
                            value={formData.minimum_replenishment}
                            placeholder="Enter Minimum Replenishment"
                            className="form-control"
                            disabled={!isEditingO}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Buffer Size</label>
                          <input
                            type="text"
                            name="buffer_size"
                            onChange={getTaskData}
                            value={formData.buffer_size}
                            placeholder="Enter Buffer Size"
                            className="form-control"
                            disabled={!isEditingO}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-md-6 col-sm-12 mb-4">
                <div className="itemDetails_card">
                  <div className="card-header d-flex flex-wrap justify-content-between">
                    <div className="d-flex align-items-center my-1">
                      <h5 className="mb-0 me-3 fw-bold text-dark">Attachments</h5>
                    </div>
                    <div className="ms-auto">
                      {!isEditing3 ? (
                        <div className="first-- d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit</Tooltip>}
                          >
                            <button
                              className="btn icon-btn w-fit-content"
                              onClick={() => setIsEditing3(true)}
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      ) : (
                        <div className="second-- d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Cancel</Tooltip>}
                          >
                            <button
                              className="btn icon-btn bg-danger w-fit-content"
                              onClick={() => setIsEditing3(false)}
                            >
                              <i className="fas fa-times text-white"></i>
                            </button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Save</Tooltip>}
                          >
                            <button
                              className="btn icon-btn bg-success w-fit-content"
                              onClick={() => handleSectionUpdate("Attachments")}
                            >
                              <i className="fas fa-save text-white"></i>
                            </button>
                          </OverlayTrigger>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="form-group">
                      <label className="form-label">Upload File</label>

                      <input
                        type="file"
                        className="form-control"
                        placeholder="Enter Task Name"
                        accept=".png, .jpg, .jpeg"
                        onChange={fileUpload}
                        disabled={!isEditing3}
                      />
                    </div>
                    <div className="gth-attachment-body">
                      <figure className="gth-attachment-tile-item">

                        <div className="attachment-image">
                          <div className="image-expand">
                            <img className="figure-img" src={formData.attachment_file != null ? formData.attachment_file : '/https://automybizz.s3.ap-south-1.amazonaws.com/ERP/sample/picture.png'} />
                          </div>
                        </div>

                      </figure>

                    </div>
                  </div>
                </div>
              </div> */}

            </div>

          </div>
        </div>


      </div>
      {/* Delete modal start */}
      <Modal
        show={deleteShow}
        onHide={deleteModalClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="delete-confirm-wrap text-center">
            <div className="delete-confirm-icon mb-3 mt-2">
              <img src={process.env.PUBLIC_URL + '/assets/images/delete-warning.svg'} alt="Warning" className="img-fluid" />
            </div>
            <h4 className="text-muted">Are you sure?</h4>
            <p className="text-muted">
              Do you really want to delete these record? This process cannot be undone.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className='justify-content-center'>
          <button type='button' className='btn btn-secondary' onClick={deleteModalClose}>
            Cancel
          </button>
          <button type='submit' className='btn btn-exp-red' onClick={handleDelete}>
            Delete
          </button>
        </Modal.Footer>
      </Modal>
      {/* Delete modal end */}
    </>

  );
}

export default InventoryMasterEditItemDetails;
