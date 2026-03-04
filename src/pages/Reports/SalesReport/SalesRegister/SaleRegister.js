import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { Button } from '@mui/material';
import Select from 'react-select';
import { ReactComponent as OnTimeDelivery } from './../../../Reports/icons/shipping-fast.svg';
import { ReactComponent as DelayDelivery } from './../../../Reports/icons/shipping-timed.svg';
import { ReactComponent as AvarageDelay } from './../../../Reports/icons/badge-percent.svg';


function SaleRegister() {
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
            saleDate: '10-05-2025',
            saleOrderNumber: 'SLO 0001',
            customerName: 'RK India Pvt Ltd.',
            deliveryDate: '12-05-2025',
            status: 'Pending',
            etd: '2 Days',
        }
    ];



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

                <div className='row'>
                    <div className='col-lg-4'>
                        <form onSubmit={handleGenerateReport}>
                            <div className='card'>
                                <div className='card-header'>
                                    <h4 className='card-title'>Sales Register</h4>
                                </div>
                                <div className='card-body pb-1'>
                                    <div className='row'>
                                        <div className='col-12'>
                                            <div className='form-group'>
                                                <label className="col-form-label">Select Month <span className="text-exp-red">*</span></label>
                                                <div className="custom-select-wrap">
                                                    <Select
                                                        isMulti
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-footer d-flex justify-content-end">
                                    <button
                                        type="button"
                                        name="reset_button"
                                        className="btn btn-exp-light me-2"
                                        onClick={handleReset}
                                    >
                                        Reset
                                    </button>
                                    <button
                                        type="submit"
                                        name="submit_button"
                                        className="btn btn-exp-green"
                                    >
                                        Generate Report
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className='col-lg-8'>
                        <div className='row'>
                            <div className='col-md-4'>
                                <div className='card gth-bg-success-alpha'>
                                    <div className='card-body text-center'>
                                        <span className='badge badge-secondary mb-3'>January</span>
                                        <div className='mb-3'>
                                            <OnTimeDelivery className='text-success' width="50px" height="50px" />
                                        </div>
                                        <p className='mb-1'>On Time Delivery</p>
                                        <h6 className='mb-0 fs-4 fw-bold'>100</h6>
                                    </div>
                                </div>

                            </div>
                            <div className='col-md-4'>
                                <div className='card gth-bg-danger-alpha'>
                                    <div className='card-body text-center'>
                                        <span className='badge badge-secondary mb-3'>January</span>
                                        <div className='mb-3'>
                                            <DelayDelivery className='text-danger' width="50px" height="50px" />
                                        </div>
                                        <p className='mb-1'>Delay Delivery</p>
                                        <h6 className='mb-0 fs-4 fw-bold'>5</h6>

                                    </div>
                                </div>
                            </div>
                            <div className='col-md-4'>
                                <div className='card gth-bg-primary-alpha'>
                                    <div className='card-body text-center'>
                                        <span className='badge badge-secondary mb-3'>January</span>
                                        <div className='mb-3'>
                                            <AvarageDelay className='text-primary' width="50px" height="50px" />
                                        </div>
                                        <p className='mb-1'>Avarage Delay %</p>
                                        <h6 className='mb-0 fs-4 fw-bold'>50%</h6>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='card mt-2'>
                    <div className='card-header bg-primary'>
                        <h4 className='card-title'>Report Preview</h4>
                    </div>
                    <div className='card-body p-0 rounded-10'>
                        <ul className="nav nav-tabs exp-tabs border-bottom-0"  role="tablist">
                            <li className="nav-item" role="presentation">
                                <button
                                    className="nav-link active"
                                    data-bs-toggle="tab"
                                    data-bs-target="#Pending"
                                    type="button"
                                    role="tab"
                                    aria-controls="Pending"
                                    aria-selected="true"
                                >
                                    Pending
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className="nav-link"
                                    data-bs-toggle="tab"
                                    data-bs-target="#Complete"
                                    type="button"
                                    role="tab"
                                    aria-controls="Complete"
                                    aria-selected="false"
                                >
                                    Complete
                                </button>
                            </li>
                        </ul>

                        <div className="tab-content">
                            <div
                                className="tab-pane active"
                                id="Pending"
                                role="tabpanel"
                            >
                                <div className='row'>
                                    <div className='col-lg-12'>
                                        <div className='table-responsive mb-0'>
                                            <Grid
                                                data={process(data, { filter })}
                                                filterable={true}
                                                filter={filter}
                                                onFilterChange={(e) => setFilter(e.filter)}
                                                style={{ width: '100%', minWidth: '800px' }}
                                            >
                                                <GridColumn
                                                    field="id"
                                                    title="#"
                                                    width="80px"
                                                    filterable={false}
                                                    headerStyle={{ minWidth: '80px' }}
                                                    cellStyle={{ minWidth: '80px' }}
                                                    headerClassName="fw-bold"
                                                />
                                                <GridColumn
                                                    title="Sale Date"
                                                    filterable={true}
                                                    cell={(props) => (
                                                        <td>
                                                            <div><span>{props.dataItem.saleDate}</span></div>
                                                        </td>
                                                    )}
                                                    width="150px"
                                                    headerStyle={{ minWidth: '150px' }}
                                                    cellStyle={{ minWidth: '150px' }}
                                                    headerClassName="fw-bold"
                                                />
                                                <GridColumn
                                                    title="Sale Order No"
                                                    width="150px"
                                                    headerStyle={{ minWidth: '150px' }}
                                                    cellStyle={{ minWidth: '150px' }}
                                                    headerClassName="fw-bold"
                                                    cell={(props) => (
                                                        <td>
                                                            <div><span>{props.dataItem.saleOrderNumber}</span></div>
                                                        </td>
                                                    )}
                                                />
                                                <GridColumn
                                                    title="Customer Name"
                                                    width="150px"
                                                    headerStyle={{ minWidth: '150px' }}
                                                    cellStyle={{ minWidth: '150px' }}
                                                    headerClassName="fw-bold"
                                                    cell={(props) => (
                                                        <td>
                                                            <div><span>{props.dataItem.customerName}</span></div>
                                                        </td>
                                                    )}
                                                />
                                                <GridColumn
                                                    title="Delivery Date"
                                                    width="150px"
                                                    headerStyle={{ minWidth: '150px' }}
                                                    cellStyle={{ minWidth: '150px' }}
                                                    headerClassName="fw-bold"
                                                    cell={(props) => (
                                                        <td>
                                                            <div><span>{props.dataItem.deliveryDate}</span></div>
                                                        </td>
                                                    )}
                                                />
                                                <GridColumn
                                                    title="Status"
                                                    width="150px"
                                                    headerStyle={{ minWidth: '150px' }}
                                                    cellStyle={{ minWidth: '150px' }}
                                                    headerClassName="fw-bold"
                                                    cell={(props) => (
                                                        <td>
                                                            <div><span className='badge badge-secondary'>{props.dataItem.status}</span></div>
                                                        </td>
                                                    )}
                                                />
                                                <GridColumn
                                                    title="ETD"
                                                    width="150px"
                                                    headerStyle={{ minWidth: '150px' }}
                                                    cellStyle={{ minWidth: '150px' }}
                                                    headerClassName="fw-bold"
                                                    cell={(props) => (
                                                        <td>
                                                            <div><span>{props.dataItem.etd}</span></div>
                                                        </td>
                                                    )}
                                                />

                                            </Grid>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="tab-pane"
                                id="Complete"
                                role="tabpanel"
                            >
                                <div className='row'>
                                    <div className='col-lg-12'>
                                        <div className='table-responsive mb-0'>
                                            <Grid
                                                data={process(data, { filter })}
                                                filterable={true}
                                                filter={filter}
                                                onFilterChange={(e) => setFilter(e.filter)}
                                                style={{ width: '100%', minWidth: '800px' }}
                                            >
                                                <GridColumn
                                                    field="id"
                                                    title="#"
                                                    width="80px"
                                                    filterable={false}
                                                    headerStyle={{ minWidth: '80px' }}
                                                    cellStyle={{ minWidth: '80px' }}
                                                    headerClassName="fw-bold"
                                                />
                                                <GridColumn
                                                    title="Sale Date"
                                                    filterable={true}
                                                    cell={(props) => (
                                                        <td>
                                                            <div><span>{props.dataItem.saleDate}</span></div>
                                                        </td>
                                                    )}
                                                    width="150px"
                                                    headerStyle={{ minWidth: '150px' }}
                                                    cellStyle={{ minWidth: '150px' }}
                                                    headerClassName="fw-bold"
                                                />
                                                <GridColumn
                                                    title="Sale Order No"
                                                    width="150px"
                                                    headerStyle={{ minWidth: '150px' }}
                                                    cellStyle={{ minWidth: '150px' }}
                                                    headerClassName="fw-bold"
                                                    cell={(props) => (
                                                        <td>
                                                            <div><span>{props.dataItem.saleOrderNumber}</span></div>
                                                        </td>
                                                    )}
                                                />
                                                <GridColumn
                                                    title="Customer Name"
                                                    width="150px"
                                                    headerStyle={{ minWidth: '150px' }}
                                                    cellStyle={{ minWidth: '150px' }}
                                                    headerClassName="fw-bold"
                                                    cell={(props) => (
                                                        <td>
                                                            <div><span>{props.dataItem.customerName}</span></div>
                                                        </td>
                                                    )}
                                                />
                                                <GridColumn
                                                    title="Delivery Date"
                                                    width="150px"
                                                    headerStyle={{ minWidth: '150px' }}
                                                    cellStyle={{ minWidth: '150px' }}
                                                    headerClassName="fw-bold"
                                                    cell={(props) => (
                                                        <td>
                                                            <div><span>{props.dataItem.deliveryDate}</span></div>
                                                        </td>
                                                    )}
                                                />
                                                <GridColumn
                                                    title="Status"
                                                    width="150px"
                                                    headerStyle={{ minWidth: '150px' }}
                                                    cellStyle={{ minWidth: '150px' }}
                                                    headerClassName="fw-bold"
                                                    cell={(props) => (
                                                        <td>
                                                            <div><span className='badge badge-secondary'>{props.dataItem.status}</span></div>
                                                        </td>
                                                    )}
                                                />
                                                <GridColumn
                                                    title="ETD"
                                                    width="150px"
                                                    headerStyle={{ minWidth: '150px' }}
                                                    cellStyle={{ minWidth: '150px' }}
                                                    headerClassName="fw-bold"
                                                    cell={(props) => (
                                                        <td>
                                                            <div><span>{props.dataItem.etd}</span></div>
                                                        </td>
                                                    )}
                                                />

                                            </Grid>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>



                    </div>
                </div>
            </div>

            {/* List of Not Converted to PO Modal end*/}
        </>
    );
}

export default SaleRegister;