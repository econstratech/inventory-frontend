import React, { useState } from "react";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Link } from "react-router-dom";
import ProductionStatusBar from "./WorkStatusBar";
import BomPageTopBar from "../BOM/BomPageTopBar";
import WorkStatusBar from "./WorkStatusBar";

function WorkOrdersWip() {
    const [data, setData] = useState([
        {
            itemID: "FG01",
            itemName: "Finished Good #1",
            UOM: "Kg",
            quantity: "10",
            buyer: "Merc Demo Buyer",
            documentNumber: "OC00001",
            orderType: "-",
            processNumber: "-",
            processStage: "wip",
            documentDate: "17/12/2024, 1:20 pm",
            deliveryDate: "27/12/2024, 12:00 am",
            createdBy: "John Doe",
        },
        {
            itemID: "FG01",
            itemName: "Finished Good #1",
            UOM: "Kg",
            quantity: "10",
            buyer: "Merc Demo Buyer",
            documentNumber: "OC00001",
            orderType: "-",
            processNumber: "-",
            processStage: "wip",
            documentDate: "17/12/2024, 1:20 pm",
            deliveryDate: "27/12/2024, 12:00 am",
            createdBy: "John Doe",
        },
        {
            itemID: "FG01",
            itemName: "Finished Good #1",
            UOM: "Kg",
            quantity: "10",
            buyer: "Merc Demo Buyer",
            documentNumber: "OC00001",
            orderType: "-",
            processNumber: "-",
            processStage: "wip",
            documentDate: "17/12/2024, 1:20 pm",
            deliveryDate: "27/12/2024, 12:00 am",
            createdBy: "John Doe",
        },
        {
            itemID: "FG01",
            itemName: "Finished Good #1",
            UOM: "Kg",
            quantity: "10",
            buyer: "Merc Demo Buyer",
            documentNumber: "OC00001",
            orderType: "-",
            processNumber: "-",
            processStage: "wip",
            documentDate: "17/12/2024, 1:20 pm",
            deliveryDate: "27/12/2024, 12:00 am",
            createdBy: "John Doe",
        },
        {
            itemID: "FG01",
            itemName: "Finished Good #1",
            UOM: "Kg",
            quantity: "10",
            buyer: "Merc Demo Buyer",
            documentNumber: "OC00001",
            orderType: "-",
            processNumber: "-",
            processStage: "wip",
            documentDate: "17/12/2024, 1:20 pm",
            deliveryDate: "27/12/2024, 12:00 am",
            createdBy: "John Doe",
        },

    ]);


    const statuses = [
        { text: "Open", value: "open" },
        { text: "Planned", value: "planned" },
        { text: "Pending", value: "pending" },
        { text: "WIP", value: "wip" },
        { text: "Completed", value: "completed" }
    ];

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
                                    <button type='button' className="btn btn-outline-primary btn-sm">
                                        <i className="fas fa-plus"></i><span className="ms-2">Start Process</span>
                                    </button>
                                    <div className="d-flex gap-2">
                                        <p className="my-1 me-3 fw-medium text-muted">2 Items selected</p>
                                        <button type='button' className="btn btn-outline-danger btn-sm">
                                            <i className="fas fa-trash-alt"></i><span className="ms-2">Delete</span>
                                        </button>
                                    </div>
                                </div>
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
                                            cell={() => (
                                                <td>
                                                    <label className="custom-checkbox me-0 mb-0">
                                                        <input
                                                            type="checkbox"
                                                        />
                                                        <span className="checkmark" />
                                                        <span className="text-"></span>
                                                    </label>
                                                </td>
                                            )}
                                            filterable={false}
                                        />
                                        <GridColumn
                                            field="itemID"
                                            width="200px"
                                            title="Item ID"
                                            filterable={false}
                                            locked={false}
                                        />
                                        <GridColumn
                                            field="itemName"
                                            title="Item Name"
                                            filter="text"
                                            width="200px"
                                            locked={false} // Locked column

                                        />
                                        <GridColumn
                                            field="UOM"
                                            title="UOM"
                                            filter="text"
                                            width="200px"
                                        />
                                        <GridColumn
                                            field="quantity"
                                            title="Quantity"
                                            filter="dropdown"
                                            width="250px"
                                            filterCell={CustomDropDownFilter}
                                            //cell={CustomCell} // Dynamically render badges
                                        />
                                        <GridColumn
                                            field="buyer"
                                            title="Buyer"
                                            filter="text"
                                            width="200px"
                                            locked={false} // Locked column
                                        // cell={() => (
                                        //     <td>
                                        //         <Link to="/production/bom/view-bom">
                                        //             BOM00001 <span className="ms-2 text-primary"><i className="fas fa-external-link-alt"></i></span>
                                        //         </Link>
                                        //     </td>
                                        // )}
                                        />
                                        <GridColumn
                                            field="documentNumber"
                                            title="Document Number"
                                            filter="text"
                                            width="200px"
                                        />
                                        <GridColumn
                                            field="orderType"
                                            title="Order Type"
                                            filter="text"
                                            width="200px"
                                        />
                                        <GridColumn
                                            field="processNumber"
                                            title="Process Number"
                                            filter="text"
                                            width="200px"
                                        />
                                        <GridColumn
                                            field="processStage"
                                            title="Process Stage"
                                            filter="text"
                                            filterable={true}
                                            width="200px"
                                            cell={CustomCell} // Dynamically render badges
                                        />
                                        <GridColumn
                                            field="documentDate"
                                            title="Document Date"
                                            filter="numeric"
                                            filterable={true}
                                            width="200px"
                                        />
                                        <GridColumn
                                            field="deliveryDate"
                                            title="Delivery Date"
                                            filter="text"
                                            filterable={false}
                                            width="200px"
                                        />
                                        <GridColumn
                                            field="createdBy"
                                            title="Created By"
                                            filter="text"
                                            filterable={true}
                                            width="200px"
                                        />

                                    </Grid>
                                </div>
                            </div>
                        </div>



                    </div>
                </div>
            </div>
        </>
    )
}

export default WorkOrdersWip