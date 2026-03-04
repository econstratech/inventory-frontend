import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { Button } from '@mui/material';

function AbcAnalysisReport() {
    const [selectedRange, setSelectedRange] = useState("3m");
    const [fmsData, setFmsData] = useState({ startDate: null, endDate: null });
    const [filter, setFilter] = useState({ logic: "and", filters: [] });

    const handleGenerateReport = (e) => {
        e.preventDefault();
        if (selectedRange === "custom") {
            if (!fmsData.startDate || !fmsData.endDate) {
                alert("Please select both start and end dates.");
                return;
            }
            if (fmsData.startDate > fmsData.endDate) {
                alert("Start date cannot be after end date.");
                return;
            }
        }
        console.log("Selected Range:", selectedRange);
        console.log("Date Range:", fmsData);
    };

    const handleReset = () => {
        setSelectedRange("3m");
        setFmsData({ startDate: null, endDate: null });
        setFilter({ logic: "and", filters: [] });
    };

    const data = [
        { id: 1, category: "TV", location: "Delhi", abcStatus: "High Volume", quantity: 1000 },
        { id: 2, category: "Phone", location: "Kolkata", abcStatus: "Medium Volume", quantity: 1100 },
        { id: 3, category: "Ear Phone", location: "Pune", abcStatus: "Low Volume", quantity: 100 }
    ];

    return (
        <div className='p-4'>
            <div className='mb-3'>
                <Button className="btn link-btn text-dark" onClick={() => window.history.back()}
                    startIcon={<i className="fas fa-long-arrow-alt-left me-1" />}>
                    Back
                </Button>
            </div>

            <div className='card mt-4'>
                <div className='card-header bg-primary'>
                    <h4 className='card-title mb-0'>ABC Analysis Report</h4>
                </div>
                <div className='card-body p-0'>
                    <div className='row'>
                        <div className='col-lg-12'>
                            <div className='table-responsive mb-0'>
                                <Grid
                                    data={process(data, { filter })}
                                    filterable={true}
                                    filter={filter}
                                    onFilterChange={(e) => setFilter(e.filter)}
                                    style={{ width: '100%' }}
                                >
                                    <GridColumn
                                        field="id"
                                        title="#"
                                        width="80px"
                                        headerClassName="fw-bold"
                                        filterable={false}
                                    />
                                    <GridColumn
                                        field="category"
                                        title="Category"
                                        width="150px"
                                        headerClassName="fw-bold"
                                        cell={(props) => (
                                            <td><div>{(props.dataItem.category)}</div></td>
                                        )}
                                    />
                                    <GridColumn
                                        field="location"
                                        title="Location"
                                        width="150px"
                                        headerClassName="fw-bold"
                                        cell={(props) => (
                                            <td><div>{(props.dataItem.location)}</div></td>
                                        )}
                                    />
                                    <GridColumn
                                        field="abcStatus"
                                        title="ABC Status"
                                        width="150px"
                                        headerClassName="fw-bold"
                                        cell={(props) => {
                                            const status = props.dataItem.abcStatus;
                                            let badgeClass = "badge-secondary";

                                            if (status === "High Volume") badgeClass = "badge-success";
                                            else if (status === "Medium Volume") badgeClass = "badge-primary";
                                            else if (status === "Low Volume") badgeClass = "badge-secondary";

                                            return (
                                                <td>
                                                    <span className={`badge ${badgeClass}`}>{status}</span>
                                                </td>
                                            );
                                        }}
                                    />
                                    <GridColumn
                                        field="quantity"
                                        title="Quantity"
                                        width="150px"
                                        headerClassName="fw-bold"
                                        cell={(props) => (
                                            <td><div>{(props.dataItem.quantity)}</div></td>
                                        )}
                                    />
                                </Grid>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AbcAnalysisReport;
