import React, { useEffect, useState } from "react";
import { PrivateAxios } from "../../environment/AxiosInstance";
import { SuccessMessage } from "../../environment/ToastMessage";
import SettingsInventoryTopBar from "./settingsInventory/SettingsInventoryTopBar";
//import './DefaultApproval.css';

function DefaultApproval() {
    const [activateAll, setActivateAll] = useState(false);
    const [switchData, setSwitchData] = useState([]);

    // Fetch initial state from the backend when the component mounts
    useEffect(() => {
        const fetchInitialState = async () => {
            try {
                const response = await PrivateAxios.get('/get_initial_state');
                const data = response.data.data;

                // Set the initial switch data
                setSwitchData(data);

                // Check if all switches are on to set the "Activate All" state
                const allActive = data.every(item => item.status === 1);
                setActivateAll(allActive);
            } catch (error) {
                console.error("Error fetching initial state:", error);
            }
        };

        fetchInitialState();
    }, []);

    // Handle individual switch change
    const handleSwitchChange = async (keyname, status) => {
        const updatedStatus = status === 0 ? 1 : 0;

        const updatedSwitchData = switchData.map(data =>
            data.keyname === keyname ? { ...data, status: updatedStatus } : data
        );

        setSwitchData(updatedSwitchData);

        // Update the "Activate All" checkbox based on the updated switchData
        const allActive = updatedSwitchData.every(item => item.status === 1);
        setActivateAll(allActive);

        try {
            await PrivateAxios.post('/updatedapproval', {
                keyname: keyname,
                status: updatedStatus,
            });
            SuccessMessage("Status updated successfully");
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    // Handle "Activate All" change
    const handleActivateAllChange = async () => {
        const newState = !activateAll;

        const updatedSwitchData = switchData.map(data => ({
            ...data,
            status: newState ? 1 : 0
        }));

        setSwitchData(updatedSwitchData);
        setActivateAll(newState);

        try {
            await PrivateAxios.post('/update_all', {
                status: newState,
            });
            SuccessMessage("All statuses updated successfully");
        } catch (error) {
            console.error("Error updating all statuses:", error);
        }
    };

    const labels = [
        { keyname: 'invoice', label: 'Invoice' },
        { keyname: 'grnQirPurchaseOrder', label: 'GRN/QIR (Purchase Order)' },
        { keyname: 'grnQirSubContract', label: 'GRN/QIR (Sub-contract)' },
        { keyname: 'inwardPurchaseOrder', label: 'Inward (Purchase Order)' },
        { keyname: 'inwardSoSc', label: 'Inward (SO/SC)' },
        { keyname: 'challanOrderConfirmation', label: 'Challan (Order Confirmation)' },
        { keyname: 'challanSubContract', label: 'Challan (Sub-contract)' },
        { keyname: 'purchaseReturnChallan', label: 'Purchase Return Challan' },
    ];

    return (
        <>
            <SettingsInventoryTopBar />
            <div className="p-4">
                <div className="card mb-0">
                    <div className="card-header ">
                        <h3 className="card-title">Default Approval</h3>
                        <p className="mb-0">
                            Setting to select on which document creation you need to update the
                            Inventory
                        </p>
                    </div>
                    <div className="card-body pb-1">
                        <div className="col-12">
                            <div className='activate-all mb-3 col-lg-5 col-md-6 col-12 d-flex align-items-center justify-content-between flex-wrap'>
                                <label className="switch-label my-1 f-s-14">
                                    Activate All:
                                </label>
                                <label className="custom-switch">
                                    <input
                                        type="checkbox"
                                        checked={activateAll}
                                        onChange={handleActivateAllChange}
                                    />
                                    <div className="switch-slider switch-round" />
                                </label>
                            </div>

                            <div className="row justify-content-between">
                                {labels.map((item, index) => (
                                    <div key={index} className="col-lg-5 col-md-12 col-sm-12 col-12 mb-3">
                                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                            <div className="switch-label-text fw-bold f-s-14">{item.label} :</div>
                                            <div className="d-flex align-items-center gap-2">
                                                <label className="my-1 text-muted">
                                                    Manual
                                                </label>
                                                <label className="custom-switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={switchData.find(data => data.keyname === item.keyname)?.status === 1}
                                                        onChange={() => handleSwitchChange(item.keyname, switchData.find(data => data.keyname === item.keyname)?.status)}
                                                    />
                                                    <div className="switch-slider switch-round" />
                                                </label>
                                                <label className="my-1 text-muted">
                                                    Auto
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default DefaultApproval;
