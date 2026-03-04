

import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { Button } from '@mui/material';
import { Tooltip } from 'antd';
import { ReactComponent as PODownload } from './../../../Reports/icons/memo-circle-check.svg';
import { ReactComponent as InvoiceDownload } from './../../../Reports/icons/point-of-sale-bill.svg';

function PurchaseRegister() {
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
            item: 'Samsung TV',
            qty: 100,
            poNumber: 'PO-001',
            invoiceDate: '2025-05-10',
            action: 'View Details'
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
                        <h4 className="card-title">Purchase Register</h4>
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
                            field="item"
                            title="Item"
                            width="300px"
                            headerStyle={{ minWidth: '300px' }}
                            cellStyle={{ minWidth: '300px' }}
                            headerClassName="fw-bold"
                            cell={(props) => (
                                <td style={{ minWidth: '300px' }}>
                                    <div><span>{props.dataItem.item}</span></div>
                                </td>
                            )}
                        />
                        <GridColumn
                            field="qty"
                            title="Qty"
                            width="100px"
                            headerStyle={{ minWidth: '100px' }}
                            cellStyle={{ minWidth: '100px' }}
                            headerClassName="fw-bold"
                            cell={(props) => (
                                <td style={{ minWidth: '100px' }}>
                                    <div><span>{props.dataItem.qty}</span></div>
                                </td>
                            )}
                        />
                        <GridColumn
                            field="poNumber"
                            title="PO Number"
                            width="150px"
                            headerStyle={{ minWidth: '150px' }}
                            cellStyle={{ minWidth: '150px' }}
                            headerClassName="fw-bold"
                        />
                        <GridColumn
                            field="invoiceDate"
                            title="Invoice Date"
                            width="150px"
                            headerStyle={{ minWidth: '150px' }}
                            cellStyle={{ minWidth: '150px' }}
                            headerClassName="fw-bold"
                        />
                        <GridColumn
                            field="action"
                            title="Action"
                            width="150px"
                            headerStyle={{ minWidth: '150px' }}
                            cellStyle={{ minWidth: '150px' }}
                            headerClassName="fw-bold"
                            cell={(props) => (
                                <td>
                                    <div className='d-flex gap-2'>
                                        <Tooltip title="P.O. Download">
                                            <button type='button' className='icon-btn'>
                                                <PODownload />
                                            </button>
                                        </Tooltip>
                                        <Tooltip title="Invoice Download">
                                            <button type='button' className='icon-btn'>
                                                <InvoiceDownload />
                                            </button>
                                        </Tooltip>
                                    </div>
                                </td>
                            )}
                        />
                    </Grid>
                </div>
            </div>
        </div>
    );
}

export default PurchaseRegister;
