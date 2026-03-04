import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { Button } from '@mui/material';

import moment from 'moment';
import { PrivateAxiosFile, PrivateAxios } from '../../../../environment/AxiosInstance';

function TopSellingProductsReport() {
    const [selectedRange, setSelectedRange] = useState("3m");
    const [fmsData, setFmsData] = useState({ startDate: null, endDate: null });
    const [rawData, setRawData] = useState([]);
    const [gridDataState, setGridDataState] = useState({ skip: 0, take: 10 });
    const [filter, setFilter] = useState({ logic: "and", filters: [] });

    const [reportData, setReportData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await PrivateAxiosFile.get("/sales/dispatch/allworkorderdispatchfor_report");
            setRawData(response.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleGenerateReport = (e) => {
        e.preventDefault();

        let startDate = null;
        let endDate = null;

        if (selectedRange === "custom") {
            if (!fmsData.startDate || !fmsData.endDate) {
                alert("Please select both start and end dates.");
                return;
            }
            if (fmsData.startDate > fmsData.endDate) {
                alert("Start date cannot be after end date.");
                return;
            }
            startDate = fmsData.startDate;
            endDate = fmsData.endDate;
        } else {
            const today = new Date();
            if (selectedRange === "3m") {
                startDate = moment().subtract(3, 'months').toDate();
            } else if (selectedRange === "6m") {
                startDate = moment().subtract(6, 'months').toDate();
            }
            endDate = today;
        }

        // Filter and process data
        const filtered = rawData.filter(item => {
            const invoiceDate = new Date(item.invoice_date);
            return invoiceDate >= startDate && invoiceDate <= endDate;
        });

        const grouped = {};

        filtered.forEach(item => {
            const key = item.product_id;
            if (!grouped[key]) {
                grouped[key] = {
                    product_id: key,
                    product_name: item.ProductsItem?.product_name || '',
                    product_code: item.ProductsItem?.product_code || '',
                    category: item.ProductsItem?.Categories?.title || '',
                    unit_name: item.ProductsItem?.Masteruom?.unit_name || '',
                    total_qty: 0,
                    total_amount: 0,
                };
            }
            grouped[key].total_qty += Number(item.qty);
            grouped[key].total_amount += Number(item.taxIncl || 0);
        });

        const result = Object.values(grouped).sort((a, b) => b.total_qty - a.total_qty);

        setReportData(result);
    };

    const handleReset = () => {
        setSelectedRange("3m");
        setFmsData({ startDate: null, endDate: null });
        setReportData([]);
        setFilter({ logic: "and", filters: [] });
    };

    return (
        <div className='p-4'>
            <div className='mb-3'>
                <Button className="btn link-btn text-dark" onClick={() => window.history.back()}>
                    <i className="fas fa-long-arrow-alt-left me-1" />
                    Back
                </Button>
            </div>

            <form onSubmit={handleGenerateReport}>
                <div className="card">
                    <div className="card-header">
                        <h4 className="card-title">Top Selling Products Report</h4>
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
                                                    <span className="cal-icon">
                                                        <i className="fas fa-calendar-alt" />
                                                    </span>
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
                                                    <span className="cal-icon">
                                                        <i className="fas fa-calendar-alt" />
                                                    </span>
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

            {reportData.length > 0 && (
                <div className='card mt-4'>
                    <div className='card-header bg-primary text-white'>
                        <h4 className='card-title'>Report Preview</h4>
                    </div>
                    <div className='card-body p-0 rounded-10'>
                        <Grid
                            data={process(reportData, { skip: gridDataState.skip, take: gridDataState.take, filter })}
                            skip={gridDataState.skip}
                            take={gridDataState.take}
                            pageable={true}
                            filterable={true}
                            filter={filter}
                            onFilterChange={(e) => setFilter(e.filter)}
                            onPageChange={(e) => setGridDataState(e.page)}
                        >
                            <GridColumn field="product_code" title="Product Code" />
                            <GridColumn field="product_name" title="Product Name" />
                            <GridColumn field="category" title="Category" />
                            <GridColumn field="unit_name" title="Unit" />
                            <GridColumn field="total_qty" title="Total Qty" filter="numeric" />
                            <GridColumn
                                field="total_amount"
                                title="Total Amount"
                                filter="numeric"
                                cell={(props) => {
                                    const value = props.dataItem[props.field] || 0;
                                    return <td>{`₹ ${value.toFixed(2)}`}</td>;  // Change ₹ to whatever you want
                                }}
                            />
                        </Grid>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TopSellingProductsReport;
