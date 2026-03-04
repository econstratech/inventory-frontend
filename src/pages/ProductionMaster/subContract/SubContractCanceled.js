import React, { useState } from "react";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Link } from "react-router-dom";
import ProductionStatusBar from "./SubContractStatusBar";
import BomPageTopBar from "../BOM/BomPageTopBar";
import WorkStatusBar from "./SubContractStatusBar";
import SubContractStatusBar from "./SubContractStatusBar";

function SubContractCanceled() {
    const [data, setData] = useState([
        {
            ProcessNumber: "REF001",
            JobWorkNumber: "PROC001",
            Stage: "Pending",
            Status: "Canceled",
            FGItemID: "FG001",
            FGName: "Finished Goods Name",
            FGUoM: "Pieces",
            TargetQty: 500,
            CompletedQty: 150,
            CreationDate: "2024-12-01",
            CreatedBy: "John Doe"
        },
        {
            ProcessNumber: "REF002",
            JobWorkNumber: "PROC002",
            Stage: "WIP",
            Status: "Canceled",
            FGItemID: "FG002",
            FGName: "Finished Goods Name2",
            FGUoM: "Pieces",
            TargetQty: 500,
            CompletedQty: 150,
            CreationDate: "2024-12-01",
            CreatedBy: "John Doe"
        },
        {
            ProcessNumber: "REF003",
            JobWorkNumber: "PROC003",
            Stage: "Completed",
            Status: "Canceled",
            FGItemID: "FG003",
            FGName: "Finished Goods Name3",
            FGUoM: "Pieces",
            TargetQty: 500,
            CompletedQty: 150,
            CreationDate: "2024-12-01",
            CreatedBy: "John Doe"
        },


    ]);


    const statuses = [
        { text: "Approval Pending", value: "ApprovalPending" },
        { text: "Approved", value: "Approved" },
        { text: "Canceled", value: "Canceled" }
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
        ApprovalPending: "badge-outline-warning",
        Approved: "badge-outline-green",
        Canceled: "badge-outline-danger",
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
            <SubContractStatusBar />
            <div className="p-4">
                <div className="row">                    
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body p-0">
                                <div className="d-flex justify-content-between align-items-center flex-wrap p-3">
                                    <button type='button' className="btn btn-outline-primary btn-sm">
                                        <i className="fas fa-paper-plane"></i><span className="ms-2">Send Order</span>
                                    </button>
                                    <div className="d-flex gap-2">
                                        {/* <p className="my-1 me-3 fw-medium text-muted">2 Items selected</p> */}
                                        <button type='button' className="btn btn-outline-warning btn-sm text-dark">
                                            <i className="fas fa-undo"></i><span className="ms-2"> Revert Sub Contract </span>
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
                                            field="ProcessNumber"
                                            width="200px"
                                            title="Process Number"
                                            filterable={false}
                                            locked={false}
                                        />
                                        <GridColumn
                                            field="JobWorkNumber"
                                            title="Job Work Number"
                                            filter="text"
                                            width="200px"
                                            locked={false} // Locked column
                                        // cell={() => (
                                        //     <td>
                                        //         <Link to="/production/all-production-process/view-production">
                                        //             PID00001 <span className="ms-2 text-primary"><i className="fas fa-external-link-alt"></i></span>
                                        //         </Link>
                                        //     </td>
                                        // )}
                                        />
                                        <GridColumn
                                            field="Stage"
                                            title="Stage"
                                            filter="text"
                                            width="200px"
                                        />
                                        <GridColumn
                                            field="Status"
                                            title="Status"
                                            filter="dropdown"
                                            width="250px"
                                            filterCell={CustomDropDownFilter}
                                            cell={CustomCell} // Dynamically render badges
                                        />
                                        <GridColumn
                                            field="FGItemID"
                                            title="FG Item ID"
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
                                            field="FGName"
                                            title="FG Name"
                                            filter="text"
                                            width="200px"
                                        />
                                        <GridColumn
                                            field="FGUoM"
                                            title="FG UoM"
                                            filter="text"
                                            width="200px"
                                        />
                                        <GridColumn
                                            field="TargetQty"
                                            title="Target Qty."
                                            filter="numeric"
                                            filterable={true}
                                            width="200px"
                                        />
                                        <GridColumn
                                            field="CompletedQty"
                                            title="Completed Qty."
                                            filter="numeric"
                                            filterable={true}
                                            width="200px"
                                        />
                                        <GridColumn
                                            field="CreationDate"
                                            title="Creation Date"
                                            filter="text"
                                            filterable={false}
                                            width="200px"
                                        />
                                        <GridColumn
                                            field="CreatedBy"
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

export default SubContractCanceled