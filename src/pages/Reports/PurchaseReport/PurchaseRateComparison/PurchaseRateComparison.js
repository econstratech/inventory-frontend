

import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { Button } from '@mui/material';
import { Tooltip } from 'antd';
import { ReactComponent as PODownload } from './../../../Reports/icons/memo-circle-check.svg';
import { ReactComponent as InvoiceDownload } from './../../../Reports/icons/point-of-sale-bill.svg';

function PurchaseRateComparison() {
    const [selectedRange, setSelectedRange] = useState("3m");
    const [fmsData, setFmsData] = useState({
        startDate: null,
        endDate: null,
    });

    const [filter, setFilter] = useState({
        logic: "and",
        filters: [],
    });

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
        setFmsData({
            startDate: null,
            endDate: null,
        });
        setFilter({
            logic: "and",
            filters: [],
        });
    };

    const data = [
        {
            id: 1,
            itemName: 'Samsung TV 32"',
            itemCode: 'SL123456',
            vendorName: 'Samsung',
            purchaseAmount: '1500',
            purchaseDate: '2022-01-01',
        },
    ];

    return (
        <div className="p-4">
            <div className="mb-3">
                <Button className="btn link-btn text-dark" onClick={() => window.history.back()}>
                    <i className="fas fa-long-arrow-alt-left me-1" />
                    Back
                </Button>
            </div>

            <form onSubmit={handleGenerateReport}>
                <div className="card">
                    <div className="card-header">
                        <h4 className="card-title">Purchase Rate Comparison</h4>
                    </div>
                    <div className="card-body pb-1">
                        <div className="row">
                            <div className="col-xl-6">
                                <label className="col-form-label">Quick Report <span className="text-exp-red">*</span></label>
                                <div className="d-flex flex-wrap">
                                    {["3m", "6m", "custom"].map((range) => (
                                        <label key={range} className="custom-radio btn-type-radio mb-2 me-3">
                                            <input
                                                type="radio"
                                                name="reportRange"
                                                value={range}
                                                checked={selectedRange === range}
                                                onChange={() => setSelectedRange(range)}
                                            />
                                            <span className="checkmark" />
                                            <span className='text-'>
                                                {range === "3m" ? "3 Months" : range === "6m" ? "6 Months" : "Custom Range"}
                                            </span>
                                        </label>
                                    ))}
                                </div>

                                {selectedRange === "custom" && (
                                    <div className="row">
                                        <div className="col-md-6 col-12">
                                            <div className="form-group">
                                                <label className="col-form-label">From <span className="text-exp-red">*</span></label>
                                                <div className="exp-datepicker-cont">
                                                    <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                                                    <DatePicker
                                                        required
                                                        selected={fmsData.startDate}
                                                        onChange={(date) => setFmsData({ ...fmsData, startDate: date })}
                                                        dateFormat="dd/MM/yyyy"
                                                        placeholderText="Select Date"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6 col-12">
                                            <div className="form-group">
                                                <label className="col-form-label">To <span className="text-exp-red">*</span></label>
                                                <div className="exp-datepicker-cont">
                                                    <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                                                    <DatePicker
                                                        required
                                                        selected={fmsData.endDate}
                                                        onChange={(date) => setFmsData({ ...fmsData, endDate: date })}
                                                        dateFormat="dd/MM/yyyy"
                                                        placeholderText="Select Date"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card-footer d-flex justify-content-end">
                        <button type="button" className="btn btn-exp-light me-2" onClick={handleReset}>
                            Reset
                        </button>
                        <button type="submit" className="btn btn-exp-green">
                            Generate Report
                        </button>
                    </div>
                </div>
            </form>

            <div className="card mt-4">
                <div className="card-header bg-primary">
                    <h4 className="card-title">Report Preview</h4>
                </div>
                <div className="card-body p-0 rounded-10 table-responsive mb-0">
                    <Grid
                        data={process(data, { filter })}
                        filterable={true}
                        filter={filter}
                        onFilterChange={(e) => setFilter(e.filter)}
                    >
                        <GridColumn
                            field="id"
                            title="#"
                            filterable={false}
                            width="80px"
                            headerStyle={{ minWidth: '80px' }}
                            cellStyle={{ minWidth: '80px' }}
                            headerClassName="fw-bold"
                        />
                        <GridColumn
                            title="Item"
                            width="200px"
                            headerStyle={{ minWidth: '200px' }}
                            cellStyle={{ minWidth: '200px' }}
                            headerClassName="fw-bold"
                            cell={(props) => ( 
                                <td>
                                    <div>Name: <span className='fw-bold'>{props.dataItem.itemName}</span></div>
                                    <div>Code: <span className='fw-bold'>{props.dataItem.itemCode}</span></div>
                                </td>
                            )}
                        />
                        <GridColumn
                            field="vendorName"
                            title="Vendor Name"
                            width="200px"
                            headerStyle={{ minWidth: '200px' }}
                            cellStyle={{ minWidth: '200px' }}
                            headerClassName="fw-bold"
                            cell={(props) => (
                                <td>
                                    <div><span>{props.dataItem.vendorName}</span></div>
                                </td>
                            )}
                        />                        
                        <GridColumn
                            field="purchaseAmount"
                            title="Purchase Amount"
                            width="150px"
                            headerStyle={{ minWidth: '150px' }}
                            cellStyle={{ minWidth: '150px' }}
                            headerClassName="fw-bold justify-content-end"
                            cell={(props) => (
                                <td>
                                    <div className='text-end'><span>$ {props.dataItem.purchaseAmount}</span></div>
                                </td>
                            )}
                        />
                        
                        <GridColumn
                            field="purchaseDate"
                            title="Purchase Date"
                            width="100px"
                            headerStyle={{ minWidth: '100px' }}
                            cellStyle={{ minWidth: '100px' }}
                            headerClassName="fw-bold"
                            cell={(props) => (
                                <td>
                                    <div><span>{props.dataItem.purchaseDate}</span></div>
                                </td>
                            )}
                        />
                    </Grid>
                </div>
            </div>
        </div>
    );
}

export default PurchaseRateComparison;
