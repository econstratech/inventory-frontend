import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { Button } from '@mui/material';
import Select from 'react-select';
import StockSaleAnalysisGraph from './StockSaleAnalysisGraph';
import { PrivateAxios } from '../../../../environment/AxiosInstance';

function StockVsSaleAnalysis() {
    const [selectedRange, setSelectedRange] = useState("6m");
    const [fmsData, setFmsData] = useState({ startDate: null, endDate: null });
    const [reportData, setReportData] = useState([]);
    const [gridDataState, setGridDataState] = useState({ skip: 0, take: 10 });
    const [allLocations, setAllLocations] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);

    const fetchReport = async () => {
        try {
            const response = await PrivateAxios.get("/product/storewise-monthly-stock");
            if (response.data.success) {
                const data = response.data.data;
                setReportData(data);

                // Extract unique store names for dropdown
                const uniqueStores = [...new Set(data.map(item => item.store_name))];
                const options = uniqueStores.map(name => ({ label: name, value: name }));
                setAllLocations(options);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchReport(); // 📦 Fetch on first load
    }, []);

    const handleGenerateReport = async (e) => {
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
        await fetchReport();
    };

    const handleReset = () => {
        setSelectedRange("6m");
        setFmsData({ startDate: null, endDate: null });
        setSelectedLocations([]);
        setGridDataState({ skip: 0, take: 10 });
        fetchReport();
    };

    // Filter by selected locations
    const filteredData = selectedLocations.length > 0
        ? reportData.filter(item => selectedLocations.some(loc => loc.value === item.store_name))
        : reportData;

    return (
        <div className='p-4'>
            <div className='mb-3'>
                <Button className="btn link-btn text-dark" onClick={() => window.history.back()}>
                    <i className="fas fa-long-arrow-alt-left me-1" /> Back
                </Button>
            </div>

            <form onSubmit={handleGenerateReport}>
                <div className='card'>
                    <div className='card-header'>
                        <h4 className='card-title'>Stock vs Sale Analysis</h4>
                    </div>
                    <div className='card-body pb-1'>
                        <div className='row'>
                           
                            <div className='col-xl-6'>
                                <div className='form-group'>
                                    <label className="col-form-label">Location</label>
                                    <div className="custom-select-wrap">
                                        <Select
                                            isMulti
                                            options={allLocations}
                                            value={selectedLocations}
                                            onChange={setSelectedLocations}
                                            placeholder="Select Store(s)"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='col-xl-6'>
                                <label className="col-form-label">Quick Report</label>
                                <div className="d-flex flex-wrap">
                                    {["6m", "custom"].map((range) => (
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
                                                {range === "6m" ? "6 Months" : "Custom Range"}
                                            </span>
                                        </label>
                                    ))}
                                </div>

                                {selectedRange === "custom" && (
                                    <div className='row'>
                                        <div className='col-md-6 col-12'>
                                            <div className="form-group">
                                                <label className='col-form-label'>From</label>
                                                <div className="exp-datepicker-cont">
                                                    <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                                                    <DatePicker
                                                        selected={fmsData.startDate}
                                                        onChange={(date) => setFmsData({ ...fmsData, startDate: date })}
                                                        dateFormat="dd/MM/yyyy"
                                                        placeholderText='Select Date'
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className='col-md-6 col-12'>
                                            <div className="form-group">
                                                <label className='col-form-label'>To</label>
                                                <div className="exp-datepicker-cont">
                                                    <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                                                    <DatePicker
                                                        selected={fmsData.endDate}
                                                        onChange={(date) => setFmsData({ ...fmsData, endDate: date })}
                                                        dateFormat="dd/MM/yyyy"
                                                        placeholderText='Select Date'
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="card-footer">
                        <div className='d-flex gap-2 justify-content-end'>
                            <button type="submit" className="btn btn-exp-green">Generate Report</button>
                            <button type="button" className="btn btn-exp-light" onClick={handleReset}>Reset</button>
                        </div>
                    </div>
                </div>
            </form>

            <div className='card mt-4'>
                <div className='card-header bg-primary'>
                    <h4 className='card-title'>Report Preview</h4>
                </div>
                <div className='card-body p-0 rounded-10'>
                    <Grid
                        style={{ height: "500px" }}
                        data={process(filteredData, gridDataState)}
                        pageable
                        sortable
                        filterable
                        onDataStateChange={(e) => setGridDataState(e.dataState)}
                        {...gridDataState}
                    >
                        <GridColumn field="month" title="Month" />
                        <GridColumn field="store_name" title="Store" />
                        <GridColumn field="product_id" title="Product ID" />
                        <GridColumn field="total_in" title="Total In" />
                        <GridColumn field="total_out" title="Total Out" />
                        <GridColumn field="final_stock" title="Final Stock" />
                    </Grid>
                </div>
            </div>

            <div className='card mt-4'>
                <div className='card-header bg-info'>
                    <h4 className='card-title'>Stock Movement Chart</h4>
                </div>
                <div className='card-body'>
                    <StockSaleAnalysisGraph data={filteredData} />
                </div>
            </div>
        </div>
    );
}

export default StockVsSaleAnalysis;
