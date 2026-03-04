import { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { PrivateAxios } from '../../../environment/AxiosInstance';

function TransactionHistory() {
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [filter, setFilter] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [gridData, setGridData] = useState([]);
    const [page, setPage] = useState({ skip: 0, take: 10 });

    // Status mapper function
    const getStatusLabel = (status) => {
        switch (status) {
            case 0:
                return 'In Progress';
            case 1:
                return 'Delivered';
            case 2:
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    };

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await PrivateAxios.get("/pos/getAllOrdersWithItems");
                const rawData = response.data;

                const formattedData = rawData.map((item) => ({
                    customerName: item.customer_name || 'N/A',
                    item: item.product_name || 'N/A',
                    code: item.product_code || 'N/A',
                    bookingOrderDate: item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : 'N/A',
                    bookingOrderMonthYear: item.created_at
                        ? new Date(item.created_at)
                        : null,
                    itemQuantity: item.quantity || 0,
                    orderId: item.custom_order_id || 'N/A',
                    orderAmount: item.item_total || 0,
                    transationID: item.payment_id || 'N/A',
                    paymentDetails: item.payment_status || 'N/A',
                    paymentAmount: item.item_total || 0,
                    deliveryStatus: getStatusLabel(item.item_status),
                }));

                setTableData(formattedData);
            } catch (error) {
                console.error("Error fetching transaction data:", error);
            }
        };

        fetchData();
    }, []);

    // Filter tableData by selected month & year from date picker
    const filteredByMonth = tableData.filter(item => {
        if (!item.bookingOrderMonthYear) return false;

        const selYear = selectedMonth.getFullYear();
        const selMonth = selectedMonth.getMonth();

        return (
            item.bookingOrderMonthYear.getFullYear() === selYear &&
            item.bookingOrderMonthYear.getMonth() === selMonth
        );
    });

    // Update grid data whenever data, filter, page or selectedMonth changes
    useEffect(() => {
        setGridData(process(filteredByMonth, { filter, skip: page.skip, take: page.take }));
    }, [filteredByMonth, filter, page]);

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
                            setPage({ skip: 0, take: page.take }); // reset to first page on month change
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
                            <Grid
                                data={gridData}
                                filterable={true}
                                filter={filter}
                                onFilterChange={(e) => {
                                    setFilter(e.filter);
                                    setPage({ skip: 0, take: page.take }); // reset page on filter change
                                }}
                                pageable={{
                                    pageSizes: [5, 10, 20],
                                    buttonCount: 5,
                                    info: true,
                                }}
                                skip={page.skip}
                                take={page.take}
                                total={process(filteredByMonth, { filter }).data.length}
                                onPageChange={(e) => setPage({ skip: e.page.skip, take: e.page.take })}
                                sortable={true}
                                style={{ width: '100%' }}
                            >
                                <GridColumn field="customerName" title="Customer Name" width="200px" headerClassName="fw-bold" />
                                <GridColumn
                                    field="item"
                                    title="Item Details"
                                    width="250px"
                                    headerClassName="fw-bold"
                                    cell={(props) => (
                                        <td>
                                            <div>Item: <span className='fw-bold'>{props.dataItem.item}</span></div>
                                            <div>Code: <span className='fw-bold'>{props.dataItem.code}</span></div>
                                        </td>
                                    )}
                                />
                                <GridColumn field="bookingOrderDate" title="Booking Date" width="140px" headerClassName="fw-bold" />
                                <GridColumn field="itemQuantity" title="Quantity" width="100px" headerClassName="fw-bold" />
                                <GridColumn field="orderId" title="Order ID" width="150px" headerClassName="fw-bold" />
                                <GridColumn
                                    field="orderAmount"
                                    title="Order Amount"
                                    width="140px"
                                    headerClassName="fw-bold justify-content-end"
                                    cell={(props) => (
                                        <td className="text-end">₹ {props.dataItem.orderAmount}</td>
                                    )}
                                />
                                <GridColumn
                                    field="transationID"
                                    title="Transaction ID"
                                    width="150px"
                                    headerClassName="fw-bold"
                                    cell={(props) => (
                                        <td><span className='badge badge-light'>{props.dataItem.transationID}</span></td>
                                    )}
                                />
                                <GridColumn field="paymentDetails" title="Payment Details" width="140px" headerClassName="fw-bold" />
                                <GridColumn
                                    field="paymentAmount"
                                    title="Payment Amount"
                                    width="150px"
                                    headerClassName="fw-bold justify-content-end"
                                    cell={(props) => (
                                        <td className="text-end">₹ {props.dataItem.paymentAmount}</td>
                                    )}
                                />
                                <GridColumn
                                    field="deliveryStatus"
                                    title="Delivery Status"
                                    width="140px"
                                    headerClassName="fw-bold"
                                    cell={(props) => {
                                        const status = props.dataItem.deliveryStatus;
                                        const badgeClass =
                                            status === "Delivered"
                                                ? "badge badge-success"
                                                : status === "In Progress"
                                                    ? "badge badge-warning"
                                                    : status === "Cancelled"
                                                        ? "badge badge-danger"
                                                        : "badge badge-secondary";
                                        return (
                                            <td><span className={badgeClass}>{status}</span></td>
                                        );
                                    }}
                                />
                            </Grid>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TransactionHistory;
