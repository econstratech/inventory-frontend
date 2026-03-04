import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { PrivateAxios } from '../../../environment/AxiosInstance';

const STATUS_LABELS = {
    0: 'Inprogress',
    1: 'Delivered',
    2: 'Cancelled'
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function DeliveryPendingReport() {
    const [chartData, setChartData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [filter, setFilter] = useState(null);
    const [page, setPage] = useState({
        skip: 0,
        take: 5,
    });
    const [sort, setSort] = useState([]);

    useEffect(() => {
        PrivateAxios.get('/order-status-summary')
            .then(res => {
                const raw = res.data;
                const monthlyData = Array.from({ length: 12 }, (_, i) => ({
                    name: months[i],
                    Inprogress: 0,
                    Delivered: 0,
                    Cancelled: 0
                }));
                raw.forEach(item => {
                    const monthIndex = item.month - 1;
                    const label = STATUS_LABELS[item.status];
                    if (label && monthlyData[monthIndex]) {
                        monthlyData[monthIndex][label] = Number(item.count);
                    }
                });
                setChartData(monthlyData);
            })
            .catch(err => console.error("Chart data error:", err));
    }, []);

    useEffect(() => {
        PrivateAxios.get("/pos/getAllOrdersWithItems")
            .then((res) => setTableData(res.data))
            .catch((err) => console.error(err));
    }, []);

    // Process the data including filter, sort, paging
    const dataState = {
        filter,
        sort,
        skip: page.skip,
        take: page.take,
    };

    const processedData = process(tableData, dataState);

    const onPageChange = (event) => {
        setPage({
            skip: event.page.skip,
            take: event.page.take,
        });
    };

    const onSortChange = (event) => {
        setSort(event.sort);
    };

    return (
        <div className='card'>
            <div className='card-header d-flex justify-content-between align-items-center flex-wrap gap-2'>
                <h5 className='card-title'>Delivery Report</h5>
                <div className="exp-datepicker-cont ms-auto month_year">
                    <span className="cal-icon"><i className="bi bi-calendar3" /></span>
                    <DatePicker
                        selected={selectedMonth}
                        onChange={(date) => setSelectedMonth(date)}
                        dateFormat="MM/yyyy"
                        showMonthYearPicker
                        className="form-control"
                    />
                </div>
            </div>

            <div className='card-body'>
                <div className='row'>
                    <div className='col-lg-6'>
                        <div className='table-responsive mb-0'>
                            <Grid
                                data={processedData.data}
                                total={processedData.total}
                                pageable={{ pageSizes: [5, 10, 20], buttonCount: 5 }}
                                skip={page.skip}
                                take={page.take}
                                onPageChange={onPageChange}
                                sortable={{ allowUnsort: true, mode: "single" }}
                                sort={sort}
                                onSortChange={onSortChange}
                                filterable={true}
                                filter={filter}
                                onFilterChange={(e) => setFilter(e.filter)}
                                style={{ width: "100%" }}
                            >
                                <GridColumn
                                    field="customer_name"
                                    title="Customer Name"
                                    width="200px"
                                    headerClassName="fw-bold"
                                />
                                <GridColumn
                                    field="product_name"
                                    title="Item"
                                    width="200px"
                                    headerClassName="fw-bold"
                                    cell={(props) => (
                                        <td>
                                            <div>
                                                Item: <span className="fw-bold">{props.dataItem.product_name}</span>
                                            </div>
                                            <div>
                                                Code: <span className="fw-bold">{props.dataItem.product_code}</span>
                                            </div>
                                        </td>
                                    )}
                                />
                                <GridColumn
                                    field="created_at"
                                    title="Purchase Date"
                                    width="120px"
                                    headerClassName="fw-bold"
                                    cell={(props) => (
                                        <td>{new Date(props.dataItem.created_at).toLocaleDateString()}</td>
                                    )}
                                />
                                <GridColumn
                                    field="quantity"
                                    title="Quantity"
                                    width="100px"
                                    headerClassName="fw-bold"
                                />
                                <GridColumn
                                    field="item_total"
                                    title="Amount"
                                    width="100px"
                                    headerClassName="fw-bold justify-content-end"
                                    cell={(props) => (
                                        <td>
                                            <div className="text-end">₹ {props.dataItem.item_total.toFixed(2)}</div>
                                        </td>
                                    )}
                                />
                                <GridColumn
                                    field="item_status"
                                    title="Delivery Status"
                                    width="200px"
                                    headerClassName="fw-bold"
                                    cell={(props) => {
                                        const status = props.dataItem.item_status;
                                        let badgeClass = "badge-secondary";
                                        let statusText = "Unknown";

                                        if (status === 0) {
                                            badgeClass = "badge-warning";
                                            statusText = "Inprogress";
                                        } else if (status === 1) {
                                            badgeClass = "badge-success";
                                            statusText = "Delivered";
                                        } else if (status === 2) {
                                            badgeClass = "badge-danger";
                                            statusText = "Cancelled";
                                        }

                                        return (
                                            <td>
                                                <span className={`badge ${badgeClass}`}>{statusText}</span>
                                            </td>
                                        );
                                    }}
                                />
                                <GridColumn
                                    field="payment_id"
                                    title="Transaction"
                                    width="250px"
                                    headerClassName="fw-bold"
                                    cell={(props) => (
                                        <td>
                                            <div className="mb-1">
                                                Tran. ID :{" "}
                                                <span className="badge badge-light">{props.dataItem.payment_id || "-"}</span>
                                            </div>
                                            <div>
                                                Payment Mode: <b>{props.dataItem.payment_type || "-"}</b>
                                            </div>
                                        </td>
                                    )}
                                />
                                <GridColumn
                                    field="custom_order_id"
                                    title="Order No."
                                    width="200px"
                                    headerClassName="fw-bold"
                                />
                                <GridColumn
                                    field="created_at"
                                    title="Order Date"
                                    width="200px"
                                    headerClassName="fw-bold"
                                    cell={(props) => (
                                        <td>{new Date(props.dataItem.created_at).toLocaleDateString()}</td>
                                    )}
                                />
                            </Grid>
                        </div>
                    </div>

                    <div className='col-lg-6'>
                        <div style={{ width: '100%', height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
                                    margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="Inprogress" stroke="#ff9f00" name="Inprogress" />
                                    <Line type="monotone" dataKey="Delivered" stroke="#28a745" name="Delivered" />
                                    <Line type="monotone" dataKey="Cancelled" stroke="#dc3545" name="Cancelled" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeliveryPendingReport;
