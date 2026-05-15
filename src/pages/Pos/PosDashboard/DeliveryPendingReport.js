import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Table } from 'antd';
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
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });
    const [loading, setLoading] = useState(false);

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
        const month = selectedMonth.getMonth() + 1;
        const year = selectedMonth.getFullYear();

        setLoading(true);
        PrivateAxios.get("/pos/getAllOrdersWithItems", {
            params: {
                page: pagination.current,
                limit: pagination.pageSize,
                month,
                year,
            },
        })
            .then((res) => {
                const data = res.data?.data || {};
                const rows = (data.rows || []).map((item, idx) => ({
                    ...item,
                    _key: `${item.order_item_id ?? item.id ?? idx}-${idx}`,
                }));
                setTableData(rows);
                setPagination((prev) => ({
                    ...prev,
                    total: data.pagination?.total_records || 0,
                }));
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [selectedMonth, pagination.current, pagination.pageSize]);

    const columns = [
        {
            title: 'Customer Name',
            dataIndex: 'customer_name',
            key: 'customer_name',
            width: 200,
        },
        {
            title: 'Item',
            dataIndex: 'product_name',
            key: 'product_name',
            width: 200,
            render: (_, record) => (
                <>
                    <div>
                        Item: <span className="fw-bold">{record.product_name}</span>
                    </div>
                    <div>
                        Code: <span className="fw-bold">{record.product_code}</span>
                    </div>
                </>
            ),
        },
        {
            title: 'Purchase Date',
            dataIndex: 'created_at',
            key: 'purchase_date',
            width: 120,
            render: (val) => (val ? new Date(val).toLocaleDateString() : '-'),
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
        },
        {
            title: 'Amount',
            dataIndex: 'item_total',
            key: 'item_total',
            width: 100,
            align: 'right',
            render: (val) => `₹ ${Number(val || 0).toFixed(2)}`,
        },
        {
            title: 'Delivery Status',
            dataIndex: 'item_status',
            key: 'item_status',
            width: 200,
            render: (status) => {
                let badgeClass = 'badge-secondary';
                let statusText = 'Unknown';

                if (status === 0) {
                    badgeClass = 'badge-warning';
                    statusText = 'Inprogress';
                } else if (status === 1) {
                    badgeClass = 'badge-success';
                    statusText = 'Delivered';
                } else if (status === 2) {
                    badgeClass = 'badge-danger';
                    statusText = 'Cancelled';
                }

                return <span className={`badge ${badgeClass}`}>{statusText}</span>;
            },
        },
        {
            title: 'Transaction',
            dataIndex: 'payment_id',
            key: 'payment_id',
            width: 250,
            render: (_, record) => (
                <>
                    <div className="mb-1">
                        Tran. ID :{' '}
                        <span className="badge badge-light">{record.payment_id || '-'}</span>
                    </div>
                    <div>
                        Payment Mode: <b>{record.payment_type || '-'}</b>
                    </div>
                </>
            ),
        },
        {
            title: 'Order No.',
            dataIndex: 'custom_order_id',
            key: 'custom_order_id',
            width: 200,
        },
        {
            title: 'Order Date',
            dataIndex: 'created_at',
            key: 'order_date',
            width: 200,
            render: (val) => (val ? new Date(val).toLocaleDateString() : '-'),
        },
    ];

    return (
        <div className='card'>
            <div className='card-header d-flex justify-content-between align-items-center flex-wrap gap-2'>
                <h5 className='card-title'>Delivery Report</h5>
                <div className="exp-datepicker-cont ms-auto month_year">
                    <span className="cal-icon"><i className="bi bi-calendar3" /></span>
                    <DatePicker
                        selected={selectedMonth}
                        onChange={(date) => {
                            setSelectedMonth(date);
                            setPagination((prev) => ({ ...prev, current: 1 }));
                        }}
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
                            <Table
                                rowKey={(record) => record._key}
                                columns={columns}
                                dataSource={tableData}
                                loading={loading}
                                pagination={{
                                    current: pagination.current,
                                    pageSize: pagination.pageSize,
                                    total: pagination.total,
                                    pageSizeOptions: ['5', '10', '20', '50'],
                                    showSizeChanger: true,
                                    showTotal: (total) => `Total ${total} items`,
                                }}
                                onChange={(p) =>
                                    setPagination((prev) => ({
                                        ...prev,
                                        current: p.current,
                                        pageSize: p.pageSize,
                                    }))
                                }
                                scroll={{ x: 'max-content' }}
                            />
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
