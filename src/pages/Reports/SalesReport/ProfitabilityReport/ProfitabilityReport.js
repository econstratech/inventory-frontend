import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { Button } from '@mui/material';
import Select from 'react-select';
import ProfitabilityReportGraph from './ProfitabilityReportGraph';


function ProfitabilityReport() {
    const [selectedRange, setSelectedRange] = useState("3m");
    const [fmsData, setFmsData] = useState({
        startDate: null,
        endDate: null
    });

    const [filter, setFilter] = useState({
        logic: "and",
        filters: []
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
            endDate: null
        });
        setFilter({
            logic: "and",
            filters: []
        });
    };

    const data = [
        {
            id: 1,
            itemName: 'Samsung Tv 32"',
            itemCode: 'SL 0001',
            itemCategory: 'TV',
            itemLocation: 'Delhi',
            saleAmount: '32000',
            saleQty: '5'
        }
    ];

    // List of Not Converted to PO Modal start
    const [showListNotConvertedPoModal, setShowListNotConvertedPoModal] = useState(false);
    const handleCloseListNotConvertedPoModal = () => setShowListNotConvertedPoModal(false);
    const handleShowListNotConvertedPoModal = () => setShowListNotConvertedPoModal(true);

    const notConvertedPoList = [
        { quotationNo: 'PR-0001', quotationDate: '01/01/2022' },
        { quotationNo: 'PR-0002', quotationDate: '05/01/2022' }
    ];
    // List of Not Converted to PO Modal end

    return (
        <>
            <div className='p-4'>
                <div className='mb-3'>
                    <Button className="btn link-btn text-dark"
                        onClick={() => window.history.back()}
                    >
                        <i className="fas fa-long-arrow-alt-left me-1" />
                        Back
                    </Button>
                </div>

                <form onSubmit={handleGenerateReport}>
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Profitability Report</h4>
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

                <div className='card mt-4'>
                    <div className='card-header bg-primary'>
                        <h4 className='card-title'>Report Preview</h4>
                    </div>
                    <div className='card-body p-0 rounded-10'>
                        <div className='row'>
                            <div className='col-lg-12'>
                                <ProfitabilityReportGraph />
                            </div>

                        </div>

                    </div>
                </div>
            </div>

        </>
    );
}

export default ProfitabilityReport;