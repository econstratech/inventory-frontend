import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Select from "react-select";
import { PrivateAxios } from '../../../environment/AxiosInstance';
import { Tooltip } from 'antd';

const LinkChildBomModal = ({ show, handleClose, showLinkChildModalId, selectedRowData, handleSave }) => {
    const [bomList, setBomList] = useState([]); 
    const [selectedBomMap, setSelectedBomMap] = useState({}); 
    const [finishedGoodsMap, setFinishedGoodsMap] = useState({});
    const [rawMaterialsMap, setRawMaterialsMap] = useState({}); 
    const [noBOMFound, setNoBOMFound] = useState(false); 

    useEffect(() => {
        if (show && selectedRowData?.product_code) {
            setBomList([]);
            setSelectedBomMap({});
            setFinishedGoodsMap({});
            setRawMaterialsMap({});
            setNoBOMFound(false);
            
            fetchBOMsByProductCode(selectedRowData.product_code);
        }
    }, [show, selectedRowData]);

    const fetchBOMsByProductCode = async (product_code) => {
        try {
            const response = await PrivateAxios.get(`/production/bom-by-product-code/${product_code}`);
            if (response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
                const bomOptions = response.data.data.map(bom => ({
                    value: bom.bomNumber,
                    label: bom.bomNumber,
                    fullData: bom, 
                }));
                setBomList(bomOptions);
                setNoBOMFound(false);
            } else {
                console.warn("No BOMs found for product:", product_code);
                setBomList([]);
                setNoBOMFound(true);
            }
        } catch (error) {
            console.error("Error fetching BOMs:", error);
            setBomList([]);
            setNoBOMFound(true);
        }
    };

    const handleBomChange = (selectedOption, rowId) => {
        setSelectedBomMap(prev => ({
            ...prev,
            [rowId]: selectedOption,
        }));
    
        setFinishedGoodsMap(prev => ({
            ...prev,
            [rowId]: selectedOption?.fullData?.finishedGoods || [],
        }));
    
        // setRawMaterialsMap(prev => ({
        //     ...prev,
        //     [rowId]: selectedOption?.fullData?.rawMaterials || [],
        // }));
        setRawMaterialsMap((prev) => ({
            ...prev,
            [rowId]: selectedOption?.fullData?.rawMaterials.map((rm) => ({
                ...rm,
                alternateItems: rm.alternatives || [],
            })) || [],
        }));
    };
    
    const handleSaveData = () => {
        if (handleSave) {
            console.log("Saving Raw Materials to row:", showLinkChildModalId);
            handleSave(showLinkChildModalId, rawMaterialsMap[showLinkChildModalId] || []);
            
        }
    };

    const finishedGoods = finishedGoodsMap[showLinkChildModalId] || [];
    const rawMaterials = rawMaterialsMap[showLinkChildModalId] || [];
   
    return (
        <>
            <Modal id="LinkChildBomModal" show={show} onHide={handleClose} backdrop="static" centered size="xl">
                <Modal.Header closeButton>
                    <Modal.Title className="gth-modal-title">Link Child BOM</Modal.Title>
                </Modal.Header>
                <Modal.Body className='moday-body-overflow-none'>
                    
                  <div className="table-responsive">
                    <table className="table table-bordered primary-table-head">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Item Category</th>
                                <th style={{ textAlign: "right" }}>Quantity</th>
                                <th style={{ textAlign: "right" }}>Unit</th>
                                <th style={{ textAlign: "right" }}>Cost Allocation (%)</th>
                                <th>Comment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {finishedGoods.length > 0 ? (
                                finishedGoods.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.product_code}</td>
                                        <td>{item.name}</td>
                                        <td>{item.category}</td>
                                        <td style={{ textAlign: "right" }}>{item.quantity}</td>
                                        <td style={{ textAlign: "right" }}>{item.unit}</td>
                                        <td style={{ textAlign: "right" }}>{item.costAllocation || 0}</td>
                                        <td>{item.comment || "-"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center text-danger">No Records Found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="table-responsive">
                    <table className="table table-bordered primary-table-head">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th style={{ textAlign: "right" }}>Quantity</th>
                                <th style={{ textAlign: "right" }}>Unit</th>
                                <th>Comment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rawMaterials.length > 0 ? (
                                rawMaterials.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.product_code}</td>
                                        <td>{item.name}</td>
                                        <td>{item.category}</td>
                                        <td style={{ textAlign: "right" }}>{item.quantity}</td>
                                        <td style={{ textAlign: "right" }}>{item.unit}</td>
                                        <td>{item.comment || "-"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center text-danger">No Records Found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className='form-group d-flex align-items-center mb-0'>
                    <div className='w-75 pe-3'>
                        <label className='form-label'>Select BOM</label>
                        <div className='custom-select-wrap'>
                            <Select
                                options={bomList}
                                onChange={(selectedOption) => handleBomChange(selectedOption, showLinkChildModalId)}
                                value={selectedBomMap[showLinkChildModalId] || null}
                                placeholder={noBOMFound ? "No BOM Found" : "Select BOM"}
                                isDisabled={noBOMFound}
                            />
                        </div>
                    </div>
                    <Tooltip title="View BOM">
                        <Link to="#" className='icon-btn'><i className='fas fa-external-link-alt text-primary'></i></Link>
                    </Tooltip>
                </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type="reset" className="btn btn-light" onClick={handleClose}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" onClick={handleSaveData}>
                        Save
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default LinkChildBomModal;
