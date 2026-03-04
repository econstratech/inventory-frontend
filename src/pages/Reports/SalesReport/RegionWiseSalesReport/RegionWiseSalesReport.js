import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { Button } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function RegionWiseSalesReport() {
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

    // Sample data with added fields
    const data = [
        { id: 1, location: "Delhi", stckvalue: 300 },
        { id: 2, location: "Mumbai", stckvalue: 500 },
        { id: 3, location: "Pune", stckvalue: 1500 }
    ];

    const doughnutData = {
        labels: data.map(item => item.location),
        datasets: [{
            data: data.map(item => item.stckvalue),
            backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc'],
            hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf'],
            hoverBorderColor: "rgba(234, 236, 244, 1)",
        }]
    };

    const doughnutOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20
                }
            }
        },
        cutout: '70%'
    };

    return (
        <div className='p-4'>
            <div className='mb-3'>
                <Button className="btn link-btn text-dark" onClick={() => window.history.back()}
                    startIcon={<i className="fas fa-long-arrow-alt-left me-1" />}>
                    Back
                </Button>
            </div>

            {/* <form onSubmit={handleGenerateReport}>
                <div className='card'>
                    <div className='card-header d-flex justify-content-between align-items-center'>
                        <h4 className='card-title mb-0'>Region Wise Stock and value Report</h4>
                    </div>
                    <div className='card-body pb-1'>
                        <div className='row'>
                            <div className='col-xl-6'>
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
                                    <div className='row'>
                                        <div className='col-md-6 col-12'>
                                            <div className="form-group">
                                                <label className='col-form-label'>From <span className='text-exp-red'>*</span></label>
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
                                                <label className='col-form-label'>To <span className='text-exp-red'>*</span></label>
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
                    <div className="card-footer d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-exp-light me-2" onClick={handleReset}>Reset</button>
                        <button type="submit" className="btn btn-exp-green">Generate Report</button>
                    </div>
                </div>
            </form> */}

            <div className='card mt-4'>
                <div className='card-header bg-primary'>
                    <h4 className='card-title mb-0'>Region Wise Stock and value Report</h4>
                </div>
                <div className='card-body p-4'>
                    <div className='row'>
                        <div className='col-lg-8'>
                            <div className='table-responsive'>
                                <Grid
                                    data={process(data, { filter })}
                                    filterable={true}
                                    filter={filter}
                                    onFilterChange={(e) => setFilter(e.filter)}
                                    style={{ width: '100%' }}
                                >
                                    <GridColumn field="id" title="#" width="80px" headerClassName="fw-bold" />
                                    <GridColumn
                                        field="location"
                                        title="Location"
                                        width="150px"
                                        cell={(props) => <td >{props.dataItem.location}</td>}
                                        headerClassName="fw-bold"
                                    />
                                    <GridColumn
                                        field="stckvalue"
                                        title="Stock Value"
                                        width="150px"
                                        cell={(props) => <td className="text-end">${props.dataItem.stckvalue.toFixed(2)}</td>}
                                        headerClassName="fw-bold justify-content-end"
                                    />
                                </Grid>
                            </div>
                        </div>
                        <div className='col-lg-4 mt-4 mt-lg-0'>
                            <div className='card h-100'>
                                <div className='card-header'>
                                    <h5 className='card-title mb-0'>Value Distribution</h5>
                                </div>
                                <div className='card-body d-flex flex-column'>
                                    <div className='chart-pie pt-4 pb-2'>
                                        <Doughnut
                                            data={doughnutData}
                                            options={doughnutOptions}
                                            height={300}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegionWiseSalesReport;
