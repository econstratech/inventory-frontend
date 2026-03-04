import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Button } from '@mui/material';
import { Modal } from 'react-bootstrap';
import { subMonths } from 'date-fns';
import { PrivateAxios } from '../../../../environment/AxiosInstance';
import CustomerSelect from '../../../filterComponents/CustomerSelect';

const toDateString = (d) => {
  if (!d || !(d instanceof Date)) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

function CustomerWiseSalesReport() {
  const [selectedRange, setSelectedRange] = useState('3m');
  const [fmsData, setFmsData] = useState({ startDate: null, endDate: null });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [pageSize, setPageSize] = useState(10);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [itemsModalShow, setItemsModalShow] = useState(false);
  const [itemsModalCustomerId, setItemsModalCustomerId] = useState(null);
  const [itemsModalCustomerName, setItemsModalCustomerName] = useState('');
  const [demandedProducts, setDemandedProducts] = useState([]);
  const [demandedProductsPagination, setDemandedProductsPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });
  const [demandedProductsLoading, setDemandedProductsLoading] = useState(false);
  const [demandedProductsPageSize, setDemandedProductsPageSize] = useState(10);

  const PAGE_SIZE_OPTIONS = [10, 15, 25, 50];
  const MODAL_PAGE_SIZE_OPTIONS = [10, 15, 25, 50];

  const fetchReportData = useCallback(
    async (startDate, endDate, page = 1, limit = 10, customerId = null) => {
      try {
        setLoading(true);
        const params = { page, limit };
        const startStr = toDateString(startDate);
        const endStr = toDateString(endDate);
        if (startStr) params.startDate = startStr;
        if (endStr) params.endDate = endStr;
        if (customerId != null && customerId !== '') params.customerId = customerId;
        const response = await PrivateAxios.get('report/customer-wise-sales-report', { params });
        const data = response.data?.data ?? [];
        const pag = response.data?.pagination ?? {};
        setReportData(Array.isArray(data) ? data : []);
        setPagination({
          total: pag.total ?? 0,
          page: pag.page ?? 1,
          limit: pag.limit ?? limit,
          totalPages: pag.totalPages ?? 0,
        });
      } catch (error) {
        console.error('Error fetching customer-wise sales report:', error);
        setReportData([]);
        setPagination((prev) => ({ ...prev, total: 0, totalPages: 0 }));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const today = new Date();
    const threeMonthsAgo = subMonths(today, 3);
    setFmsData({ startDate: threeMonthsAgo, endDate: today });
    fetchReportData(threeMonthsAgo, today, 1, 10, null);
  }, [fetchReportData]);

  const handleGenerateReport = (e) => {
    e.preventDefault();
    let startDate = null;
    let endDate = null;
    const today = new Date();
    if (selectedRange === 'custom') {
      if (!fmsData.startDate || !fmsData.endDate) {
        alert('Please select both start and end dates.');
        return;
      }
      if (fmsData.startDate > fmsData.endDate) {
        alert('Start date cannot be after end date.');
        return;
      }
      startDate = fmsData.startDate;
      endDate = fmsData.endDate;
    } else if (selectedRange === '3m') {
      startDate = subMonths(today, 3);
      endDate = today;
      setFmsData({ startDate, endDate });
    } else if (selectedRange === '6m') {
      startDate = subMonths(today, 6);
      endDate = today;
      setFmsData({ startDate, endDate });
    }
    fetchReportData(startDate, endDate, 1, pageSize, selectedCustomerId);
  };

  const handleReset = () => {
    setSelectedRange('');
    setFmsData({ startDate: null, endDate: null });
    setSelectedCustomerId(null);
    setPageSize(10);
    fetchReportData(null, null, 1, 10, null);
  };

  const getDateRangeForFetch = () => {
    if (!selectedRange) return { start: null, end: null };
    const today = new Date();
    if (selectedRange === '3m') return { start: subMonths(today, 3), end: today };
    if (selectedRange === '6m') return { start: subMonths(today, 6), end: today };
    if (selectedRange === 'custom') return { start: fmsData.startDate, end: fmsData.endDate };
    return { start: null, end: null };
  };

  const handlePageChange = (newPage) => {
    const { start, end } = getDateRangeForFetch();
    fetchReportData(start, end, newPage, pageSize, selectedCustomerId);
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value) || 10;
    setPageSize(newSize);
    const { start, end } = getDateRangeForFetch();
    fetchReportData(start, end, 1, newSize, selectedCustomerId);
  };

  const fetchDemandedProducts = useCallback(async (customerId, page = 1, limit = 10) => {
    if (!customerId) return;
    try {
      setDemandedProductsLoading(true);
      const response = await PrivateAxios.get(`customer/demanded-products/${customerId}`, {
        params: { page, limit },
      });
      const data = response.data?.data ?? [];
      const pag = response.data?.pagination ?? {};
      setDemandedProducts(Array.isArray(data) ? data : []);
      setDemandedProductsPagination({
        total: pag.total ?? 0,
        page: pag.page ?? 1,
        pageSize: pag.pageSize ?? limit,
        totalPages: pag.totalPages ?? 0,
      });
    } catch (error) {
      console.error('Error fetching demanded products:', error);
      setDemandedProducts([]);
      setDemandedProductsPagination((prev) => ({ ...prev, total: 0, totalPages: 0 }));
    } finally {
      setDemandedProductsLoading(false);
    }
  }, []);

  const openItemsModal = (dataItem) => {
    const customerId = dataItem.customer_id;
    const customerName = dataItem.name ?? 'Customer';
    setItemsModalCustomerId(customerId);
    setItemsModalCustomerName(customerName);
    setItemsModalShow(true);
    setDemandedProductsPageSize(10);
    fetchDemandedProducts(customerId, 1, 10);
  };

  const closeItemsModal = () => {
    setItemsModalShow(false);
    setItemsModalCustomerId(null);
    setItemsModalCustomerName('');
    setDemandedProducts([]);
  };

  const handleDemandedProductsPageChange = (newPage) => {
    if (itemsModalCustomerId == null) return;
    fetchDemandedProducts(itemsModalCustomerId, newPage, demandedProductsPageSize);
  };

  const handleDemandedProductsPageSizeChange = (e) => {
    const newSize = Number(e.target.value) || 10;
    setDemandedProductsPageSize(newSize);
    if (itemsModalCustomerId != null) {
      fetchDemandedProducts(itemsModalCustomerId, 1, newSize);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-3">
        <Button className="btn link-btn text-dark" onClick={() => window.history.back()}>
          <i className="fas fa-long-arrow-alt-left me-1" /> Back
        </Button>
      </div>

      <form onSubmit={handleGenerateReport}>
        <div className="card">
          <div
            className="card-header d-flex justify-content-between align-items-center cursor-pointer"
            onClick={() => setFilterCollapsed((c) => !c)}
            style={{ cursor: 'pointer' }}
            aria-expanded={!filterCollapsed}
          >
            <h4 className="card-title mb-0">Filters</h4>
            <span className="btn btn-sm btn-link text-dark p-0">
              {filterCollapsed ? <i className="fas fa-chevron-down" /> : <i className="fas fa-chevron-up" />}
            </span>
          </div>

          <div style={{ display: filterCollapsed ? 'none' : 'block' }}>
            <div className="card-body pb-1">
              <div className="row">
                <div className="col-xl-6">
                  <label className="col-form-label">
                    Quick Report <span className="text-exp-red">*</span>
                  </label>
                  <div className="d-flex flex-wrap">
                    {['3m', '6m', 'custom'].map((range) => (
                      <label key={range} className="custom-radio btn-type-radio mb-2 me-3">
                        <input
                          type="radio"
                          name="reportRange"
                          value={range}
                          checked={selectedRange === range}
                          onChange={() => setSelectedRange(range)}
                        />
                        <span className="checkmark" />
                        <span className="text-">
                          {range === '3m' ? '3 Months' : range === '6m' ? '6 Months' : 'Custom Range'}
                        </span>
                      </label>
                    ))}
                  </div>

                  {selectedRange === 'custom' && (
                    <div className="row">
                      <div className="col-md-6 col-12">
                        <div className="form-group">
                          <label className="col-form-label">
                            From <span className="text-exp-red">*</span>
                          </label>
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
                          <label className="col-form-label">
                            To <span className="text-exp-red">*</span>
                          </label>
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
                <div className="col-xl-6" style={{ marginBottom: '5px' }}>
                  <label className="col-form-label">Filter by Customer</label>
                  <CustomerSelect
                    value={selectedCustomerId}
                    onChange={(option) => setSelectedCustomerId(option?.value ?? option?.id ?? null)}
                    placeholder="Search and select customer..."
                  />
                </div>
              </div>
            </div>

            <div className="card-footer d-flex justify-content-end">
              <button type="button" className="btn btn-exp-light me-2" onClick={handleReset}>
                Reset
              </button>
              <button type="submit" className="btn btn-exp-green">
                Apply
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="card mt-4">
        <div className="card-header bg-primary">
          <h4 className="card-title mb-0">Customer-wise Sales Report</h4>
        </div>
        <div className="card-body p-0 table-responsive">
          {loading ? (
            <div className="p-4 text-center">Loading report data...</div>
          ) : (
            <>
              <Grid data={reportData}>
                <GridColumn field="name" title="Customer Name" width="200px" />
                <GridColumn
                  field="total_sales_count"
                  title="Total Sales Count"
                  width="140px"
                  cell={(props) => (
                    <td className="text-end">
                      {Number(props.dataItem.total_sales_count ?? 0).toLocaleString('en-IN')}
                    </td>
                  )}
                />
                <GridColumn
                  field="total_sales_amount"
                  title="Total Sales Amount"
                  width="160px"
                  cell={(props) => (
                    <td className="text-end">
                      ₹ {Number(props.dataItem.total_sales_amount ?? 0).toLocaleString('en-IN')}
                    </td>
                  )}
                />
                <GridColumn
                  field="last_order_date"
                  title="Last Order Date"
                  width="120px"
                  cell={(props) => <td>{formatDisplayDate(props.dataItem.last_order_date)}</td>}
                />
                <GridColumn
                  title=""
                  width="80px"
                  cell={(props) => (
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-link p-0 text-primary"
                        onClick={() => openItemsModal(props.dataItem)}
                        title="View items received"
                      >
                        <i className="fas fa-eye" />
                      </button>
                    </td>
                  )}
                />
              </Grid>

              {(pagination.totalPages > 0 || reportData.length > 0) && (
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 px-3 py-2 border-top">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="text-muted small">
                      Showing page {pagination.page} of {pagination.totalPages || 1} ({pagination.total} records)
                    </span>
                    <label className="d-flex align-items-center gap-1 small mb-0">
                      <span className="text-muted">Per page:</span>
                      <select
                        className="form-select form-select-sm"
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        style={{ width: 'auto' }}
                      >
                        {PAGE_SIZE_OPTIONS.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="d-flex gap-1">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      disabled={pagination.page <= 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        show={itemsModalShow}
        onHide={closeItemsModal}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Items Received — {itemsModalCustomerName}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {demandedProductsLoading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-bordered table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Reference No.</th>
                      <th>Product Name</th>
                      <th>Product Code</th>
                      <th>Store Name</th>
                      <th className="text-end">Total Received</th>
                      <th className="text-end">Total Amount</th>
                      <th>Last Received Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demandedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-4">
                          No items found.
                        </td>
                      </tr>
                    ) : (
                      demandedProducts.map((row) => (
                        <tr key={row.id}>
                          <td>{row.sale.reference_number ?? '—'}</td>
                          <td>{row.productData?.product_name ?? '—'}</td>
                          <td>{row.productData?.product_code ?? '—'}</td>
                          <td>{row.sales_product_received?.warehouse?.name ?? '—'}</td>
                          <td className="text-end">{Number(row.total_received ?? 0).toLocaleString('en-IN')}</td>
                          <td className="text-end">₹ {Number(row.total_amount ?? 0).toLocaleString('en-IN')}</td>
                          <td>{formatDisplayDate(row.created_at)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {(demandedProductsPagination.totalPages > 0 || demandedProducts.length > 0) && (
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 px-3 py-2 border-top">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="text-muted small">
                      Page {demandedProductsPagination.page} of {demandedProductsPagination.totalPages || 1} ({demandedProductsPagination.total} records)
                    </span>
                    <label className="d-flex align-items-center gap-1 small mb-0">
                      <span className="text-muted">Per page:</span>
                      <select
                        className="form-select form-select-sm"
                        value={demandedProductsPageSize}
                        onChange={handleDemandedProductsPageSizeChange}
                        style={{ width: 'auto' }}
                      >
                        {MODAL_PAGE_SIZE_OPTIONS.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="d-flex gap-1">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      disabled={demandedProductsPagination.page <= 1}
                      onClick={() => handleDemandedProductsPageChange(demandedProductsPagination.page - 1)}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      disabled={demandedProductsPagination.page >= demandedProductsPagination.totalPages}
                      onClick={() => handleDemandedProductsPageChange(demandedProductsPagination.page + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default CustomerWiseSalesReport;
