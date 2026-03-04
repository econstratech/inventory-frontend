import React, { useEffect, useState } from "react";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { useNavigate } from "react-router-dom";

import ProductionStatusBar from "./WorkStatusBar";
import BomPageTopBar from "../BOM/BomPageTopBar";
import WorkStatusBar from "./WorkStatusBar";
import { PrivateAxios } from "../../../environment/AxiosInstance";
import { format } from "date-fns"; 
import { ErrorMessage, SuccessMessage } from "../../../environment/ToastMessage";
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd-MM-yyyy h:mm a"); // Correct format
};

function WorkOrders() {
    const navigate = useNavigate(); 
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBOMs, setSelectedBOMs] = useState([]);   
    useEffect(() => {
        fetchWorkOrders();
    }, []);

    const fetchWorkOrders = async () => {
        try {
            const response = await PrivateAxios.get("sales/production/allworkorder");
            const filteredData = response.data.filter(order => 
                order.is_deleted !== 1 && 
                (order.production_status === 0)
            );
            console.log(filteredData);
            
            setData(filteredData);
        } catch (error) {
            console.error("Error fetching work orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const CustomDropDownFilter = (props) => {
        const handleChange = (e) => {
            props.onChange({
                value: e.value,
                operator: "eq",
                field: props.field,
            });
        };

        return (
            <DropDownList
                data={statuses}
                textField="text"
                dataItemKey="value"
                value={statuses.find((s) => s.value === props.value) || statuses[0]}
                onChange={handleChange}
            />
        );
    };
    
    const statuses = [
        { text: "Open", value: "open" },
        { text: "Planned", value: "planned" },
        { text: "Pending", value: "pending" },
        { text: "WIP", value: "wip" },
        { text: "Completed", value: "completed" }
    ];

    const statusStyles = {
        open: "badge-outline-active",
        planned: "badge-outline-warning",
        pending: "badge-outline-yellowGreen",
        wip: "badge-outline-wip",
        completed: "badge-outline-green"

    };

    const getStatusBadge = (status) => {
        const style = statusStyles[status] || "badge-outline-secondary";
        return (
            <label className={`mb-0 badge ${style}`}>
                <i className="fas fa-circle f-s-8 d-flex me-1"></i>
                {statuses.find((s) => s.value === status)?.text || status}
            </label>
        );
    };

       const CustomCell = (props) => {
        const { dataItem, field } = props;
        const status = dataItem[field];

        return <td>{getStatusBadge(status)}</td>;
    };
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const handleCheckboxChange = (productId) => {
        // setSelectedItems((prev) => {
        //     const exists = prev.includes(productId);
        //     return exists ? prev.filter((id) => id !== productId) : [...prev, productId];
        // });
        setSelectedItem((prev) => (prev === productId ? null : productId));
    };
    const handleStartProcess = () => {
        if (!selectedItem) {
            alert("Please select a work order to proceed.");
            return;
        }
        
        console.log("Navigating with selected ID:", selectedItem); // ✅ Debugging
        navigate("/production/all-production-process/create-production", { 
            state: { selectedIds: [selectedItem] }  // Wrap selectedItem in an array
        });
    };
    const deleteSelectedItems = async () => {
        if (!selectedItem) {
            alert("Please select an item to delete.");
            return;
        }
    
        try {
            const response = await PrivateAxios.post("production/workordersoft-delete", {
                ids: [selectedItem], // ✅ Wrap in an array since the API expects a list
            });
    
            if (response.data.success) {
                SuccessMessage("Work order soft deleted successfully.");
                setSelectedItem(null); // ✅ Clear the selection after deletion
                fetchWorkOrders(); // ✅ Refresh the data
            } else {
                ErrorMessage("Failed to delete the work order.");
            }
        } catch (error) {
            console.error("Error deleting work order:", error);
            ErrorMessage("Error deleting work order.");
        }
    };
    return (
        <>
            <BomPageTopBar />
            <WorkStatusBar />
            <div className="p-4">
                <div className="row">

                    <div className="col-12">
                        <div className="card">
                            <div className="card-body p-0">
                                <div className="d-flex justify-content-between align-items-center flex-wrap p-3">
                                <button 
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={handleStartProcess} 
                                    disabled={!selectedItem}
                                >
                                    <i className="fas fa-plus"></i> <span className="ms-2">Start Process</span>
                                </button>

                                    <div className="d-flex gap-2">
                                    <p className="my-1 me-3 fw-medium text-muted">
    {selectedItem ? "1 Item selected" : "0 item selected"}
</p>
                                        <button type='button' className="btn btn-outline-danger btn-sm" onClick={deleteSelectedItems}
    disabled={!selectedItem} >
                                            <i className="fas fa-trash-alt"></i><span className="ms-2">Delete</span>
                                        </button>
                                    </div>
                                </div>
                                {loading ? (
                                    <div className="text-center my-3">Loading work orders...</div>
                                ) : (
                                <div className="bg_succes_table_head rounded_table">
                                    <Grid
                                        data={data}
                                        sortable
                                        //filterable
                                        pageable={{ buttonCount: 3, pageSizes: true }}

                                    >
                                        <GridColumn
                                                field=""
                                                title=""
                                                width="55px"
                                                cell={(props) => {
                                                    const { dataItem } = props;
                                                    if (dataItem.production_status === 5 || dataItem.production_status === 1 || dataItem.production_status === 2) {
                                                        return <td />;
                                                    }
                                                    const isChecked = selectedItem === dataItem.id;
                                                    return (
                                                        <td>
                                                            <label className="custom-checkbox me-0 mb-0">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => handleCheckboxChange(dataItem.id)} // ✅ Pass correct ID
                                                                
                                                                />
                                                                <span className="checkmark" />
                                                            </label>
                                                        </td>
                                                    );
                                                }}
                                                filterable={false}
                                            />
                                        <GridColumn
                                                field="ProductsItem.product_code"
                                                title="Item ID"
                                                width="200px"
                                                cell={(props) => {
                                                    const product = props.dataItem.ProductsItem;
                                                    return <td>{product?.product_code || "N/A"}</td>;
                                                }}
                                            />

                                            <GridColumn
                                                field="ProductsItem.product_name"
                                                title="Item Name"
                                                width="200px"
                                                cell={(props) => {
                                                    const product = props.dataItem.ProductsItem;
                                                    return <td>{product?.product_name || "N/A"}</td>;
                                                }}
                                            />
                                        <GridColumn
                                        field="ProductsItem.Masteruom.unit_name"
                                        title="UOM"
                                        width="150px"
                                        cell={(props) => {
                                            const uom = props.dataItem.ProductsItem?.Masteruom;
                                            return <td>{uom?.unit_name || "N/A"}</td>;
                                        }}
                                    />
                                        <GridColumn
                                            field="qty"
                                            title="Quantity"
                                            filter="dropdown"
                                            width="250px"
                                           
                                        //cell={CustomCell} // Dynamically render badges
                                        />
                                        <GridColumn
                                            field="purchase.customer.name"
                                            title="Buyer"
                                            filter="text"
                                            width="200px"
                                            locked={false} // Locked column
                                       
                                        />
                                        <GridColumn
                                            field="purchase.reference_number"
                                            title="Document Number"
                                            filter="text"
                                            width="200px"
                                        />
                                        {/* <GridColumn
                                            field="orderType"
                                            title="Order Type"
                                            filter="text"
                                            width="200px"
                                        /> */}
                                        <GridColumn
                                            field="purchase.production_number"
                                            title="Process Number"
                                            filter="text"
                                            width="200px"
                                            cell={(props) => {
                                                
                                                return <td>{props.dataItem.production_number}</td>;
                                            }}
                                        />
                                        <GridColumn
                                        field="processStage"
                                        title="Process Stage"
                                        filter="text"
                                        filterable={true}
                                        width="200px"
                                        cell={(props) => {
                                            const { dataItem } = props; // ✅ Destructure props

                                            return (
                                                <>
                                                    {dataItem.production_status === 1 ? (
                                                        <td><span className="badge badge-info">Planned</span></td>
                                                    ) : dataItem.production_status === 2 ? (
                                                        <td><span className="badge badge-warning">WIP</span></td>
                                                    ) : dataItem.production_status === 5 ? (
                                                        <td><span className="badge badge-success">Completed</span></td>
                                                    ) : <td/>}
                                                </>
                                            );
                                        }}
                                    />     
                                            <GridColumn
                                            field="purchase.created_at"
                                            title="Document Date"
                                            filter="numeric"
                                            filterable={true}
                                            width="200px"
                                            cell={(props) => {
                                                return <td>{formatDate(props.dataItem.purchase?.expiration)}</td>;
                                            }}
                                        />
                                        <GridColumn
                                            field="purchase.expiration"
                                            title="Delivery Date"
                                            filter="text"
                                            filterable={false}
                                            width="200px"
                                            cell={(props) => {
                                                return <td>{formatDate(props.dataItem.purchase?.expiration)}</td>;
                                            }}
                                        />
                                        <GridColumn
                                            field="purchase.createdByUser.name"
                                            title="Created By"
                                            width="200px"
                                            cell={(props) => {
                                                const user = props.dataItem.purchase?.createdByUser;
                                                return <td>{user?.name || "N/A"}</td>;
                                            }}
                                        />

                                    </Grid>
                                </div>
                                 )}
                            </div>
                        </div>



                    </div>
                </div>
            </div>
        </>
    )
}

export default WorkOrders