import { DropDownList } from '@progress/kendo-react-dropdowns'
import { Tooltip } from 'antd'
import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Select from 'react-select'
import DeleteModal from '../../CommonComponent/DeleteModal'
import CustomizeDocumentNumberModal from '../../CommonComponent/CustomizeDocumentNumberModal'
import DocumentNumberFormatModal from '../../CommonComponent/DocumentNumberFormatModal'
import { useNavigate } from "react-router-dom";
import { PrivateAxios } from "../../../environment/AxiosInstance"; 
import { ErrorMessage } from '../../../environment/ToastMessage'

function CreateProduction() {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedIds = location.state?.selectedIds || [];
    const [productList, setProductList] = useState([]);
    const [inStockStores, setInStockStores] = useState([]);
    const [rejectedGoodsStores, setRejectedGoodsStores] = useState([]);

   
    useEffect(() => {
        if (selectedIds.length > 0) {
            fetchProducts();
        }
    }, [selectedIds]);

    const fetchProducts = async () => {
        console.log("Selected IDs:", selectedIds);
        
        if (selectedIds.length === 0) return; 
        try {
           
            
            const response = await PrivateAxios.post("production/getselectedproductsforprocessing", { ids: selectedIds });
            console.log(response.data);
            
            const processedData = response.data.workOrders.map(product => ({
                id: product.id,
                product_name: product?.ProductsItem?.product_name || "N/A",
                product_code: product?.ProductsItem?.product_code || "N/A",
                current_stock: product.finalStock || "0", 
                qty: product?.qty || "0",
                product_id: product?.product_id || "0",
                sales_id: product?.sales_id || "0",
                uom: product?.ProductsItem?.Masteruom?.unit_name || "N/A",
                ref_no: product?.purchase?.reference_number || "N/A",
                bomNumbers: product.bomNumbers.length > 0 ? product.bomNumbers : [],
                bomNumber: product.bomNumbers.length > 0 ? product.bomNumbers[0] : "N/A",
                fgStore: inStockStores.length > 0 ? inStockStores[0].id : null, 
                rmStore: inStockStores.length > 0 ? inStockStores[0].id : null,
                scrapStore: rejectedGoodsStores.length > 0 ? rejectedGoodsStores[0].id : null 
        }));
       
            setProductList(processedData);
            setInStockStores(response.data.inStockStores);
            setRejectedGoodsStores(response.data.rejectedGoodsStores);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };
    
    
    
    useEffect(() => {
        if (location.pathname === "/production/all-production-process/create-production") {
          document.body.classList.add("sidebar-collapse");
        } else {
          document.body.classList.remove("sidebar-collapse");
        }
        return () => {
          document.body.classList.remove("sidebar-collapse");
        };
      }, [location.pathname]);
      // page redirection side bar collapse end
    //delete modal
    const [deleteShow, setDeleteShow] = useState(false);
    const deleteModalClose = () => setDeleteShow(false);
    const deleteModalShow = () => setDeleteShow(true);
    // Customize Document Number Modal start
    const [showCustomizeDocumentNumberModalModal, setShowCustomizeDocumentNumberModalModal] = useState(false);
    const handleCloseCustomizeDocumentNumberModalModal = () => setShowCustomizeDocumentNumberModalModal(false);
    const handleShowCustomizeDocumentNumberModalModal = () => setShowCustomizeDocumentNumberModalModal(true);
    // Document Number Format Modal start
    const [showDocumentNumberFormatModal, setShowDocumentNumberFormatModal] = useState(false);
    const handleCloseDocumentNumberFormatModal = () => setShowDocumentNumberFormatModal(false);
    const handleShowDocumentNumberFormatModal = () => setShowDocumentNumberFormatModal(true);
    // select stage 
    const selectStage = [
        { value: "CreateProcess", label: "Create Process" },
        // { value: "Publish", label: "Publish" },
        // { value: "BulkIssue_RM_FG", label: "Bulk Issue (RM & FG" },
        // { value: "BulkIssue_ApproveInventory", label: "Bulk Issue & Approve Inventory" },
        { value: "MarkComplete", label: "Mark Complete" },
    ];

    // State to track the selected option
    const [selectedStage, setSelectedStage] = useState(null);

    const handleChange = (selectedOption) => {
        setSelectedStage(selectedOption);
        console.log("Selected Stage:", selectedOption);
    };

    const handleDeleteProduct = (productId) => {
        // Filter out the product with the selected `id`
        const updatedList = productList.filter(product => product.id !== productId);
        setProductList(updatedList);
    };


    const handleInputChange = (index, field, value) => {
        const updatedList = [...productList];
    
        // If the field is one of the store fields, ensure value is just the ID
        if (['fgStore', 'rmStore', 'scrapStore'].includes(field)) {
            updatedList[index][field] = value; // value should already be the ID
        } else if (field === "bomNumber" && typeof value === "object") {
            updatedList[index][field] = value.value;
        } else {
            updatedList[index][field] = value;
        }
    
        setProductList(updatedList);
    };
   
    const handleSubmit = async () => {
        if (!selectedStage || !selectedStage.value) {
            alert("Please select a stage.");
            return;
        }
    
        const payload = {
            stage: selectedStage.value,
            products: productList.map(product => ({
                id: product.id,
                productid: product.product_id,
                salesid: product.sales_id,
                qty: product.qty,
                fgStore: product.fgStore || inStockStores[0]?.id, 
                rmStore: product.rmStore || inStockStores[0]?.id ,
                scrapStore: product.scrapStore || rejectedGoodsStores[0]?.id, 
                bomNumber:
                product.bomNumber && typeof product.bomNumber === "object"
                    ? product.bomNumber.value
                    : product.bomNumber || 'N/A', // ✅ Always send BOM
        })),
           
        };
        console.log("Payload to be sent:", payload);
        try {
            console.log("Submitting Payload:", payload);
            const productionResponse = await PrivateAxios.post("production/getproductiondetailsaftersubmit", payload);
            console.log("Fetched Production & BOM Data:", productionResponse.data);
            if (productionResponse.data.success && productionResponse.data.insertedProductions.length > 0) {
                const productionId = productionResponse.data.insertedProductions[0].production.id; // ✅ Extract production ID
                
                navigate(`/production/all-production-process/view-production/${productionId}`); // ✅ Redirect to production page
            } else {
                console.error("Production creation failed, no ID returned.");
                ErrorMessage("Failed to create production. Please try again.");
            }
        } catch (error) {
            console.error("Error saving production data:", error);
            // message.error("Failed to save production data.");
        }
    };
    
    return (
        <>
            <div className='p-4'>
                <div className="mb-4">
                    <button
                        className="link-btn"
                        onClick={() => navigate(-1)}
                    >
                        <i className="fas fa-arrow-left"></i>
                        <span className="ms-2 f-s-16">Back</span>
                    </button>
                </div>


                <div className='card'>
                    <div className='card-header border-bottom-0'>
                        <h5 className='card-title'>Create Production</h5>
                    </div>
                    <div className='card-body p-0'>
                        <div className='table-responsive'>
                            <table className='table table-bordered primary-table-head'>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Item Id</th>
                                        <th>Item Name</th>
                                        <th>BOM</th>
                                        <th>Current Stock</th>
                                        <th>Quantity</th>
                                        <th>UOM</th>
                                        <th>Reference Number</th>
                                        <th>FG Store</th>
                                        <th>RM Store</th>
                                        <th>Scrap Store</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {productList.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center">
                                            No products found.
                                        </td>
                                    </tr>
                                ) : (
                                    productList.map((product, index) => (
                                    <tr>
                                        <td>
                                            <div className='d-flex gap-2 align-items-center'>
                                                {index +1}
                                                <Tooltip title="Remove">
                                                    <button type='button' className='icon-btn' onClick={() => handleDeleteProduct(product.id)}>
                                                        <i className="fas fa-trash-alt text-danger"></i>
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </td>
                                        <td>
                                        {product.product_code}
                                        </td>
                                        <td> <div style={{ width: '200px' }}>
                                        {product.product_name}
                                        </div></td>
                                       
                                        <td>
                                         {product.bomNumbers && product.bomNumbers.length > 0 ? (
                                        <DropDownList
                                        style={{ width: "200px" }}
                                        data={product.bomNumbers.map(bom => ({ label: bom, value: bom }))} 
                                        textField="label"
                                        dataItemKey="value"
                                        value={
                                            product.bomNumber
                                                ? { label: product.bomNumber, value: product.bomNumber }
                                                : { label: product.bomNumbers[0], value: product.bomNumbers[0] } // ✅ Default to first BOM
                                        }
                                        defaultValue={
                                            product.bomNumbers.length > 0
                                                ? { label: product.bomNumbers[0], value: product.bomNumbers[0] }
                                                : null
                                        }
                                        onChange={e => handleInputChange(index, 'bomNumber', e.value)} 
                                    />
                                    ) : (
                                        <button 
                                        onClick={() => window.open('/production/bom/create-bom', '_blank')} 
                                        className="btn btn-outline-primary btn-sm"
                                        >
                                        Create BOM
                                        </button>
                                    )}
                                        </td>
                                        <td>
                                            <div style={{ width: '150px' }}>{product.current_stock}</div>
                                        </td>
                                        <td>
                                            <div style={{ width: '150px' }}>
                                                <input className='form-control' type='number' value={product.qty} />
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ width: '100px' }}>{product.uom}</div>
                                        </td>
                                        <td>
                                            <div style={{ width: '200px' }}>
                                                {product.ref_no}
                                            </div>
                                        </td>
                                        <td>
                                        <DropDownList
                                            style={{ width: "200px" }}
                                            data={inStockStores.map(store => ({ label: store.name, value: store.id }))} 
                                            textField="label"
                                            dataItemKey="value"
                                            value={{ label: inStockStores.find(store => store.id === product.fgStore)?.name || inStockStores[0]?.name, value: product.fgStore || inStockStores[0]?.id }} 
                                            defaultValue={{ label: inStockStores[0]?.name, value: inStockStores[0]?.id }} 
                                            onChange={e => handleInputChange(index, 'fgStore', e.value.value)} 
                                        />
                                           
                                        </td>
                                        <td>
                                        <DropDownList
                                            style={{ width: "200px" }}
                                            data={inStockStores.map(store => ({ label: store.name, value: store.id }))} 
                                            textField="label"
                                            dataItemKey="value"
                                            value={{ label: inStockStores.find(store => store.id === product.rmStore)?.name || inStockStores[0]?.name, value: product.rmStore || inStockStores[0]?.id }} 
                                            defaultValue={{ label: inStockStores[0]?.name, value: inStockStores[0]?.id }} 
                                            onChange={e => handleInputChange(index, 'rmStore', e.value.value)} 
                                        />
                                        </td>
                                        <td>
                                 
                                        <DropDownList
                                            style={{ width: "200px" }}
                                            data={rejectedGoodsStores.map(store => ({ label: store.name, value: store.id }))} 
                                            textField="label"
                                            dataItemKey="value"
                                            value={{ label: rejectedGoodsStores.find(store => store.id === product.scrapStore)?.name || rejectedGoodsStores[0]?.name, value: product.scrapStore || rejectedGoodsStores[0]?.id }} 
                                            defaultValue={{ label: rejectedGoodsStores[0]?.name, value: rejectedGoodsStores[0]?.id }} 
                                            onChange={e => handleInputChange(index, 'scrapStore',e.value.value)} 
                                        />
                                        </td>
                                     
                                    </tr>
                               
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                        <div className='px-4'>
                            <div className='row justify-content-between'>
                               
                                <div className='col-lg-4'>
                                   
                                </div>
                                <div className='col-lg-4'>
                                    <div className="form-group" controlId="docDate">
                                        <label className="form-label">Select Stage</label>
                                        <div className='custom-select-wrap'>
                                            <Select
                                                name="SelectStage"
                                                options={selectStage}
                                                value={selectedStage}
                                                onChange={handleChange}
                                                placeholder="Select a stage"
                                            />
                                        </div>
                                        <div className='mt-3 text-end'>
                                            <button type='button' className='btn btn-success' onClick={handleSubmit}>
                                                <i className='fas fa-save me-2'></i>Submit
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customize Document Number Modal */}
            <CustomizeDocumentNumberModal
                show={showCustomizeDocumentNumberModalModal}
                handleClose={handleCloseCustomizeDocumentNumberModalModal}
                documentNumberFormatModal={handleShowDocumentNumberFormatModal}
                documentNumberDelete={deleteModalShow}
            />

            {/* Customize Document Number Modal */}
            <DocumentNumberFormatModal
                show={showDocumentNumberFormatModal}
                handleClose={handleCloseDocumentNumberFormatModal} />

            {/* Delete Modal */}
            <DeleteModal
                show={deleteShow}
                handleClose={deleteModalClose} />
        </>
    )
}

export default CreateProduction