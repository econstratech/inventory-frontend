import React, { useState } from "react";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Link } from "react-router-dom";
import ProductionStatusBar from "./ProductionStatusBar";
import BomPageTopBar from "../BOM/BomPageTopBar";

function AllProductionProcessApprovePendingList() {
    const [data, setData] = useState([
        {
            ReferenceNumber: "REF001",
            ProcessNumber: "PROC001",
            Stage: "WIP",
            status: "ApprovedPending",
            BOMNumber: "BOM0001",
            FGItemID: "FG001",
            FGName: "Finished Good #1",
            TypeofProcess: "Assembly",
            FGUoM: "Pieces",
            TargetQty: 500,
            CompletedQty: 150,
            CreationDate: "2024-12-01",
            LastModifiedBy: "John Doe",
            LastModifiedDate: "2024-12-05",
        },
        {
            ReferenceNumber: "REF006",
            ProcessNumber: "PROC006",
            Stage: "Completed",
            status: "ApprovedPending",
            BOMNumber: "BOM0002",
            FGItemID: "FG001",
            FGName: "Finished Good #5",
            TypeofProcess: "Assembly",
            FGUoM: "Pieces",
            TargetQty: 500,
            CompletedQty: 150,
            CreationDate: "2024-12-01",
            LastModifiedBy: "John Doe",
            LastModifiedDate: "2024-12-05",
        },
        {
            ReferenceNumber: "REF002",
            ProcessNumber: "PROC002",
            Stage: "WIP",
            status: "ApprovedPending",
            BOMNumber: "BOM0001",
            FGItemID: "FG001",
            FGName: "Raw Material 2",
            TypeofProcess: "Assembly",
            FGUoM: "Pieces",
            TargetQty: 500,
            CompletedQty: 150,
            CreationDate: "2024-12-01",
            LastModifiedBy: "John Doe",
            LastModifiedDate: "2024-12-05",
        },
        {
            ReferenceNumber: "REF004",
            ProcessNumber: "PROC004",
            Stage: "Pending",
            status: "ApprovedPending",
            BOMNumber: "BOM0002",
            FGItemID: "FG001",
            FGName: "Finished Good #3",
            TypeofProcess: "Assembly",
            FGUoM: "Pieces",
            TargetQty: 500,
            CompletedQty: 150,
            CreationDate: "2024-12-01",
            LastModifiedBy: "John Doe",
            LastModifiedDate: "2024-12-05",
        },
        {
            ReferenceNumber: "REF003",
            ProcessNumber: "PROC003",
            Stage: "Pending",
            status: "ApprovedPending",
            BOMNumber: "BOM0002",
            FGItemID: "FG001",
            FGName: "Finished Good #2",
            TypeofProcess: "Assembly",
            FGUoM: "Pieces",
            TargetQty: 500,
            CompletedQty: 150,
            CreationDate: "2024-12-01",
            LastModifiedBy: "John Doe",
            LastModifiedDate: "2024-12-05",
        },
        {
            ReferenceNumber: "REF004",
            ProcessNumber: "PROC004",
            Stage: "Pending",
            status: "ApprovedPending",
            BOMNumber: "BOM0002",
            FGItemID: "FG001",
            FGName: "Finished Good #3",
            TypeofProcess: "Assembly",
            FGUoM: "Pieces",
            TargetQty: 500,
            CompletedQty: 150,
            CreationDate: "2024-12-01",
            LastModifiedBy: "John Doe",
            LastModifiedDate: "2024-12-05",
        },
        {
            ReferenceNumber: "REF005",
            ProcessNumber: "PROC005",
            Stage: "Completed",
            status: "ApprovedPending",
            BOMNumber: "BOM0002",
            FGItemID: "FG001",
            FGName: "Finished Good #4",
            TypeofProcess: "Assembly",
            FGUoM: "Pieces",
            TargetQty: 500,
            CompletedQty: 150,
            CreationDate: "2024-12-01",
            LastModifiedBy: "John Doe",
            LastModifiedDate: "2024-12-05",
        }


    ]);

    //for status badge
    const statuses = [
        { text: "All", value: "all" },
        { text: "Approved Pending", value: "ApprovedPending" },
        { text: "Repair Pending", value: "RepairPending" },
        { text: "Testing Pending", value: "TestingPending" },
        { text: "Approved", value: "Approved" },        
        { text: "Canceled", value: "Canceled" },
        
    ];

    const statusStyles = {
        all: "badge-outline-active",
        ApprovedPending: "badge-outline-warning",
        RepairPending: "badge-outline-repair",
        TestingPending: "badge-outline-yellowGreen",
        Approved: "badge-outline-meantGreen",
        Canceled: "badge-outline-quotation"
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
    //for status badge

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




    return (
        <>
            <BomPageTopBar />
            <ProductionStatusBar />
            <div className="p-4">
                <div className="row">  
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body p-0">
                                <div className="bg_succes_table_head rounded_table">
                                    <Grid
                                        data={data}
                                        sortable
                                        //filterable
                                        pageable={{ buttonCount: 3, pageSizes: true }}

                                    >
                                        <GridColumn
                                            field="ReferenceNumber"
                                            width="200px"
                                            title="Reference Number"
                                            filterable={false}
                                            locked={false}
                                        />
                                        <GridColumn
                                            field="ProcessNumber"
                                            title="Process Number"
                                            filter="text"
                                            width="200px"
                                            locked={false} // Locked column
                                            cell={() => (
                                                <td>
                                                    <Link to="/production/all-production-process/view-production">
                                                        PID00001 <span className="ms-2 text-primary"><i className="fas fa-external-link-alt"></i></span>
                                                    </Link>
                                                </td>
                                            )}
                                        />
                                        <GridColumn field="Stage" title="Stage" filter="text" width="200px" />
                                        <GridColumn
                                            field="status"
                                            title="Status"
                                            filter="dropdown"
                                            width="250px"
                                            filterCell={CustomDropDownFilter}
                                            cell={CustomCell} // Dynamically render badges
                                        />
                                        <GridColumn
                                            field="BOMNumber"
                                            title="BOM Number"
                                            filter="text"
                                            width="200px"
                                            locked={false} // Locked column
                                            cell={() => (
                                                <td>
                                                    <Link to="/production/bom/view-bom">
                                                        BOM00001 <span className="ms-2 text-primary"><i className="fas fa-external-link-alt"></i></span>
                                                    </Link>
                                                </td>
                                            )}
                                        />
                                        <GridColumn field="FGItemID" title="FG Item ID" filter="text" width="200px" />
                                        <GridColumn field="FGName" title="FG Name" filter="text" width="200px" />
                                        <GridColumn field="TypeofProcess" title="Type of Process" filter="text" width="200px" />
                                        <GridColumn field="FGUoM" title="FG UoM" filter="text" width="200px" />
                                        <GridColumn field="TargetQty" title="Target Qty." filter="numeric" filterable={true} width="200px" />
                                        <GridColumn field="CompletedQty" title="Completed Qty." filter="numeric" filterable={true} width="200px" />
                                        <GridColumn field="CreationDate" title="Creation Date" filter="text" filterable={false} width="200px" />
                                        <GridColumn field="LastModifiedBy" title="Last Modified By" filter="text" filterable={true} width="200px" />
                                        <GridColumn field="LastModifiedDate" title="Last Modified Date" filter="text" filterable={false} width="200px" />
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

export default AllProductionProcessApprovePendingList