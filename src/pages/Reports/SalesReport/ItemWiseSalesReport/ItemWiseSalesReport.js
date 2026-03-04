import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Button } from '@mui/material';
import { subMonths } from 'date-fns';
import { PrivateAxios } from '../../../../environment/AxiosInstance';
import ProductSelect from '../../../filterComponents/ProductSelect';

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

function ItemWiseSalesReport() {
  const [selectedRange, setSelectedRange] = useState('3m');
  const [fmsData, setFmsData] = useState({ startDate: null, endDate: null });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [pagination, setPagination] = useState({
    total_records: 0,
    total_pages: 0,
    current_page: 1,
    per_page: 10,
    has_next_page: false,
    has_prev_page: false,
    next_page: null,
    prev_page: null,
  });
  const [pageSize, setPageSize] = useState(10);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const PAGE_SIZE_OPTIONS = [10, 15, 25, 50];

  const fetchReportData = useCallback(
    async (startDate, endDate, page = 1, limit = 10, productId = null) => {
      try {
        setLoading(true);
        const params = { page, limit };
        const startStr = toDateString(startDate);
        const endStr = toDateString(endDate);
        if (startStr) params.startDate = startStr;
        if (endStr) params.endDate = endStr;
        if (productId != null && productId !== '') params.product_id = productId;
        const response = await PrivateAxios.get('report/item-wise-sales-report', { params });
        const data = response.data?.data;
        const rows = data?.rows ?? [];
        const pag = data?.pagination ?? {};
        setReportData(rows);
        setPagination({
          total_records: pag.total_records ?? 0,
          total_pages: pag.total_pages ?? 0,
          current_page: pag.current_page ?? 1,
          per_page: pag.per_page ?? limit,
          has_next_page: !!pag.has_next_page,
          has_prev_page: !!pag.has_prev_page,
          next_page: pag.next_page ?? null,
          prev_page: pag.prev_page ?? null,
        });
      } catch (error) {
        console.error('Error fetching item-wise sales report:', error);
        setReportData([]);
        setPagination((prev) => ({ ...prev, total_records: 0, total_pages: 0 }));
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
    fetchReportData(startDate, endDate, 1, pageSize, selectedProductId);
  };

  const handleReset = () => {
    setSelectedRange('');
    setFmsData({ startDate: null, endDate: null });
    setSelectedProductId(null);
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
    fetchReportData(start, end, newPage, pageSize, selectedProductId);
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value) || 10;
    setPageSize(newSize);
    const { start, end } = getDateRangeForFetch();
    fetchReportData(start, end, 1, newSize, selectedProductId);
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
                  <label className="col-form-label">Filter by Product</label>
                  <ProductSelect
                    value={selectedProductId}
                    onChange={(option) => setSelectedProductId(option?.value ?? null)}
                    placeholder="Search and select product..."
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
          <h4 className="card-title mb-0">Item-wise Sales Report</h4>
        </div>
        <div className="card-body p-0 table-responsive">
          {loading ? (
            <div className="p-4 text-center">Loading report data...</div>
          ) : (
            <>
              <Grid data={reportData}>
                <GridColumn
                  field="product_code"
                  title="Product Code"
                  width="140px"
                  cell={(props) => (
                    <td>
                      <span
                        style={{
                          backgroundColor: '#e8f4fd',
                          color: '#0d6efd',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          display: 'inline-block',
                        }}
                      >
                        {props.dataItem.product_code ?? '—'}
                      </span>
                    </td>
                  )}
                />
                <GridColumn field="product_name" title="Product Name" width="200px" />
                <GridColumn field="total_sales_count" title="Total Sales" width="140px" cell={(props) => (
                  <td className="text-end">
                    {Number(props.dataItem.total_sales_count ?? 0).toLocaleString('en-IN')}
                  </td>
                )} />
                <GridColumn field="total_received_quantity" title="Received Quantity" width="140px" cell={(props) => (
                  <td className="text-end">
                    {Number(props.dataItem.total_received_quantity ?? 0).toLocaleString('en-IN')}
                  </td>
                )} />

                <GridColumn
                  field="total_amount_without_tax"
                  title="Amount (excl. tax)"
                  width="140px"
                  cell={(props) => (
                    <td className="text-end">
                      ₹ {(props.dataItem.total_amount_without_tax ?? 0).toLocaleString('en-IN')}
                    </td>
                  )}
                />
                <GridColumn
                  field="total_tax_amount"
                  title="Tax Amount"
                  width="120px"
                  cell={(props) => (
                    <td className="text-end">
                      ₹ {(props.dataItem.total_tax_amount ?? 0).toLocaleString('en-IN')}
                    </td>
                  )}
                />
                <GridColumn
                  field="total_received_amount"
                  title="Total (incl. tax)"
                  width="140px"
                  cell={(props) => (
                    <td className="text-end">
                      ₹ {(props.dataItem.total_received_amount ?? 0).toLocaleString('en-IN')}
                    </td>
                  )}
                />
                <GridColumn
                  field="last_created_at"
                  title="Last Sold"
                  width="120px"
                  cell={(props) => <td>{formatDisplayDate(props.dataItem.last_created_at)}</td>}
                />
              </Grid>

              {(pagination.total_pages > 0 || reportData.length > 0) && (
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 px-3 py-2 border-top">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="text-muted small">
                      Showing page {pagination.current_page} of {pagination.total_pages || 1} (
                      {pagination.total_records} records)
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
                      disabled={!pagination.has_prev_page}
                      onClick={() => handlePageChange(pagination.prev_page ?? pagination.current_page - 1)}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      disabled={!pagination.has_next_page}
                      onClick={() => handlePageChange(pagination.next_page ?? pagination.current_page + 1)}
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
    </div>
  );
}

export default ItemWiseSalesReport;
