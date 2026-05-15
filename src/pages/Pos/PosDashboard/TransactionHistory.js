import { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Table } from 'antd';
import { PrivateAxios } from '../../../environment/AxiosInstance';

const getStatusLabel = (status) => {
    switch (status) {
        case 0: return 'In Progress';
        case 1: return 'Delivered';
        case 2: return 'Cancelled';
        default: return 'Unknown';
    }
};

function TransactionHistory() {
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [tableData, setTableData] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const month = selectedMonth.getMonth() + 1; // JS months are 0-indexed
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
                    _key: `${item.order_item_id ?? item.id ?? idx}-${idx}`,
                    customerName: item.customer_name || 'N/A',
                    item: item.product_name || 'N/A',
                    code: item.product_code || 'N/A',
                    bookingOrderDate: item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : 'N/A',
                    itemQuantity: item.quantity || 0,
                    orderId: item.custom_order_id || 'N/A',
                    orderAmount: item.item_total || 0,
                    transationID: item.payment_id || 'N/A',
                    paymentDetails: item.payment_status || 'N/A',
                    paymentAmount: item.item_total || 0,
                    deliveryStatus: getStatusLabel(item.item_status),
                }));
                setTableData(rows);
                setPagination((prev) => ({
                    ...prev,
                    total: data.pagination?.total_records || 0,
                }));
            })
            .catch((error) => console.error("Error fetching transaction data:", error))
            .finally(() => setLoading(false));
    }, [selectedMonth, pagination.current, pagination.pageSize]);

    const columns = [
        {
            title: 'Customer Name',
            dataIndex: 'customerName',
            key: 'customerName',
            width: 200,
        },
        {
            title: 'Item Details',
            dataIndex: 'item',
            key: 'item',
            width: 250,
            render: (_, record) => (
                <>
                    <div>Item: <span className='fw-bold'>{record.item}</span></div>
                    <div>Code: <span className='fw-bold'>{record.code}</span></div>
                </>
            ),
        },
        {
            title: 'Booking Date',
            dataIndex: 'bookingOrderDate',
            key: 'bookingOrderDate',
            width: 140,
        },
        {
            title: 'Quantity',
            dataIndex: 'itemQuantity',
            key: 'itemQuantity',
            width: 100,
        },
        {
            title: 'Order ID',
            dataIndex: 'orderId',
            key: 'orderId',
            width: 150,
        },
        {
            title: 'Order Amount',
            dataIndex: 'orderAmount',
            key: 'orderAmount',
            width: 140,
            align: 'right',
            render: (val) => `₹ ${Number(val || 0).toFixed(2)}`,
        },
        {
            title: 'Transaction ID',
            dataIndex: 'transationID',
            key: 'transationID',
            width: 150,
            render: (val) => <span className='badge badge-light'>{val}</span>,
        },
        {
            title: 'Payment Details',
            dataIndex: 'paymentDetails',
            key: 'paymentDetails',
            width: 140,
        },
        {
            title: 'Payment Amount',
            dataIndex: 'paymentAmount',
            key: 'paymentAmount',
            width: 150,
            align: 'right',
            render: (val) => `₹ ${Number(val || 0).toFixed(2)}`,
        },
        {
            title: 'Delivery Status',
            dataIndex: 'deliveryStatus',
            key: 'deliveryStatus',
            width: 140,
            render: (status) => {
                const badgeClass =
                    status === "Delivered" ? "badge badge-success"
                        : status === "In Progress" ? "badge badge-warning"
                            : status === "Cancelled" ? "badge badge-danger"
                                : "badge badge-secondary";
                return <span className={badgeClass}>{status}</span>;
            },
        },
    ];

    return (
        <div className='card mb-0'>
            <div className='card-header d-flex justify-content-between align-items-center flex-wrap gap-2'>
                <h5 className='card-title'>Transaction History</h5>
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
            <div className='card-body p-0'>
                <div className='row'>
                    <div className='col-lg-12'>
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
                </div>
            </div>
        </div>
    );
}

export default TransactionHistory;
