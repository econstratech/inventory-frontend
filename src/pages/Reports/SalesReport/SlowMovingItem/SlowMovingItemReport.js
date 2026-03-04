import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { Button } from '@mui/material';
import { PrivateAxios } from '../../../../environment/AxiosInstance';

function SlowMovingItemReport() {
    const [selectedRange, setSelectedRange] = useState("3m");
    const [fmsData, setFmsData] = useState({ startDate: null, endDate: null });
    const [filter, setFilter] = useState({ logic: "and", filters: [] });
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await PrivateAxios.get('/product/slow-moving-items');
            console.log(response.data);
            
            setReportData(response.data || []);
        } catch (error) {
            console.error("Error fetching report:", error);
            alert("Something went wrong while fetching the report.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setSelectedRange("3m");
        fetchReport(); // ✅ Auto fetch report on load
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

        fetchReport(); // ✅ Fetch on manual trigger
    };

    const handleReset = () => {
        setSelectedRange("3m");
        setFmsData({ startDate: null, endDate: null });
        setFilter({ logic: "and", filters: [] });
        fetchReport(); // ✅ Refresh data
    };

    return (
        <div className='p-4'>
            <div className='mb-3'>
                <Button className="btn link-btn text-dark" onClick={() => window.history.back()}
                    startIcon={<i className="fas fa-long-arrow-alt-left me-1" />}>
                    Back
                </Button>
            </div>

            <form onSubmit={handleGenerateReport}>
                <div className='card'>
                    <div className='card-header d-flex justify-content-between align-items-center'>
                        <h4 className='card-title mb-0'>Slow Moving Item Report</h4>
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
                                                {range === "3m" ? "3 Months" :
                                                    range === "6m" ? "6 Months" : "Custom Range"}
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
            </form>

            <div className='card mt-4'>
                <div className='card-header bg-primary'>
                    <h4 className='card-title mb-0 text-white'>Report Preview</h4>
                </div>
                <div className='card-body p-0'>
                    {loading ? (
                        <div className='p-4 text-center'>Loading...</div>
                    ) : (
                        <div className='table-responsive mb-0'>
                            <Grid
                                data={process(reportData, { filter })}
                                filterable={true}
                                filter={filter}
                                onFilterChange={(e) => setFilter(e.filter)}
                                style={{ width: '100%' }}
                            >
                                <GridColumn field="product_name" title="Product Name" width="200px" headerClassName="fw-bold" />
                                <GridColumn field="product_code" title="Product Code" width="150px" headerClassName="fw-bold" />
                                <GridColumn field="item_location" title="Location" width="150px" headerClassName="fw-bold" /> {/* ✅ store_name used */}
                                <GridColumn field="last_movement_date" title="Last Movement" width="150px" headerClassName="fw-bold" />
                                <GridColumn
                                    field="days_since_last_movement"
                                    title="Days Since Movement"
                                    width="180px"
                                    headerClassName="fw-bold"
                                    cell={(props) => (
                                        <td className={props.dataItem.days_since_last_movement > 90 ? 'text-danger' : ''}>
                                            {props.dataItem.days_since_last_movement} Days
                                        </td>
                                    )}
                                />
                            </Grid>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SlowMovingItemReport;
