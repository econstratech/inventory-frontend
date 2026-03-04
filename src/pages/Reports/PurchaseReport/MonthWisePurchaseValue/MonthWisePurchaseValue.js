import React, { useState, useEffect, useCallback, PureComponent } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Button } from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { PrivateAxios } from '../../../../environment/AxiosInstance';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const formatMonthLabel = (year, month) => `${MONTH_NAMES[Number(month) - 1] || month} ${year}`;

// Custom Label for graph points
class CustomizedLabel extends PureComponent {
  render() {
    const { x, y, stroke, value } = this.props;
    return (
      <text x={x} y={y} dy={-8} fill={stroke} fontSize={10} textAnchor="middle">
        ₹{value.toLocaleString('en-IN')}
      </text>
    );
  }
}

// Custom X-Axis tick with rotation
class CustomizedAxisTick extends PureComponent {
  render() {
    const { x, y, payload } = this.props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">
          {payload.value}
        </text>
      </g>
    );
  }
}

// Tooltip formatter for INR
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #ccc',
        padding: 10,
        fontSize: 12,
      }}>
        <p><strong>{label}</strong></p>
        {payload.map((pld) => (
          <p key={pld.dataKey} style={{ color: pld.color, margin: 0 }}>
            {pld.name}: ₹{pld.value.toLocaleString('en-IN')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Graph Component that receives data as props
const MonthWisePurchaseValueGraph = ({ data }) => (
  <div style={{ width: '100%', height: '350px' }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 40, right: 40, left: 10, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="monthLabel" tick={<CustomizedAxisTick />} />
        <YAxis
          yAxisId="left"
          tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="total_po_count"
          stroke="#03a03f"
          name="No of POs issued"
          yAxisId="left"
          label={<CustomizedLabel />}
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="total_purchase_amount"
          stroke="#1c13ca"
          name="Total PO Amount (₹)"
          yAxisId="right"
          label={<CustomizedLabel />}
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="completed_po_count"
          stroke="#f39c12"
          name="Completed POs"
          yAxisId="left"
          label={<CustomizedLabel />}
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="completed_total_po_amount"
          stroke="#c0392b"
          name="Total Completed PO Amount (₹)"
          yAxisId="right"
          label={<CustomizedLabel />}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);


// ----- Main Component -----
function MonthWisePurchaseValue() {
  const [selectedRange, setSelectedRange] = useState("3m");
  const [fmsData, setFmsData] = useState({ startDate: null, endDate: null });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total_records: 0,
    total_pages: 0,
    current_page: 1,
    per_page: 15,
    has_next_page: false,
    has_prev_page: false,
    next_page: null,
    prev_page: null,
  });

  const formatRow = (item) => ({
    ...item,
    monthLabel: formatMonthLabel(item.year, item.month),
    total_po_count: Number(item.total_po_count) || 0,
    total_purchase_amount: parseFloat(item.total_purchase_amount) || 0,
    completed_po_count: Number(item.completed_po_count) || 0,
    completed_total_po_amount: parseFloat(item.completed_total_po_amount) || 0,
  });

  const fetchReportData = useCallback(async (startDate, endDate, page = 1, limit = 15) => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (startDate && endDate) {
        params.start_date = startDate.toISOString ? startDate.toISOString().slice(0, 10) : startDate;
        params.end_date = endDate.toISOString ? endDate.toISOString().slice(0, 10) : endDate;
      }
      const res = await PrivateAxios.get('report/monthly-purchase-report', { params });
      const data = res.data?.data;
      const rows = data?.rows ?? [];
      const pag = data?.pagination ?? {};
      setReportData(rows.map(formatRow));
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
      console.error("Error fetching monthly purchase report:", error);
      setReportData([]);
      setPagination((prev) => ({ ...prev, total_records: 0, total_pages: 0 }));
    } finally {
      setLoading(false);
    }
  }, []);

  const getDateRange = () => {
    const now = new Date();
    if (selectedRange === "custom" && fmsData.startDate && fmsData.endDate) {
      return { start: fmsData.startDate, end: fmsData.endDate };
    }
    const start = new Date(now);
    if (selectedRange === "3m") start.setMonth(now.getMonth() - 3);
    else if (selectedRange === "6m") start.setMonth(now.getMonth() - 6);
    return { start, end: now };
  };

  const handleGenerateReport = (e) => {
    if (e) e.preventDefault();
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
    const { start, end } = getDateRange();
    fetchReportData(start, end, 1, 15);
  };

  const handlePageChange = (newPage) => {
    const { start, end } = getDateRange();
    fetchReportData(start, end, newPage, pagination.per_page);
  };

  const handleReset = () => {
    setSelectedRange("3m");
    setFmsData({ startDate: null, endDate: null });
    setReportData([]);
    const now = new Date();
    const start = new Date(now);
    start.setMonth(now.getMonth() - 3);
    fetchReportData(start, now, 1, 15);
  };

  useEffect(() => {
    const now = new Date();
    const start = new Date(now);
    start.setMonth(now.getMonth() - 3);
    fetchReportData(start, now, 1, 15);
  }, [fetchReportData]);

  const lastTwoMonthsData = reportData.slice(0, 2);

  return (
    <>
      <div className='p-4'>
        <div className='mb-3'>
          <Button
            className="btn link-btn text-dark"
            onClick={() => window.history.back()}
          >
            <i className="fas fa-long-arrow-alt-left me-1" />
            Back
          </Button>
        </div>

        <div className='row'>
          <div className='col-lg-6'>
            <form onSubmit={handleGenerateReport}>
              <div className='card'>
                <div className='card-header'>
                  <h4 className='card-title'>Month Wise Purchase Value</h4>
                </div>
                <div className='card-body pb-1'>
                  <div className='row'>
                    <div className='col-xl-12'>
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
                            <span className='text-'>{range === "3m" ? "3 Months" : range === "6m" ? "6 Months" : "Custom Range"}</span>
                          </label>
                        ))}
                      </div>
                      {selectedRange === "custom" && (
                        <div className='row'>
                          <div className='col-md-6 col-12'>
                            <div className='form-group'>
                              <label className='col-form-label'>From <span className='text-exp-red'>*</span></label>
                              <div className="exp-datepicker-cont">
                                <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                                <DatePicker
                                  required
                                  selected={fmsData.startDate}
                            onChange={date => setFmsData({ ...fmsData, startDate: date })}
                                  dateFormat="dd/MM/yyyy"
                                  placeholderText='Select Date'
                                />
                              </div>
                            </div>
                          </div>
                          <div className='col-md-6 col-12'>
                            <div className='form-group'>
                              <label className='col-form-label'>To <span className='text-exp-red'>*</span></label>
                              <div className="exp-datepicker-cont">
                                <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                                <DatePicker
                                  required
                                  selected={fmsData.endDate}
                            onChange={date => setFmsData({ ...fmsData, endDate: date })}
                                 
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
                    className="btn btn-exp-green"  disabled={loading}
                  >
                    {loading ? "Loading..." : "Apply"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className='col-lg-6'>
            <div className='row'>
              {lastTwoMonthsData.length > 0 ? lastTwoMonthsData.map((item, idx) => (
                <div className='col-md-6' key={`${item.year}-${item.month}-${idx}`}>
                  <div className={`month_card_view rounded-10 mb-3 p-3 shadow ${
                    idx === 0 ? 'month_po' : 'month_inv'
                  }`}>
                    <span className='badge badge-secondary mb-3'>{item.monthLabel}</span>
                    <p className='mb-1'>No. of POs issued</p>
                    <h6 className='mb-3 fs-5 fw-bold'>{item.total_po_count}</h6>
                    <p className='mb-1'>Total PO Amount (₹)</p>
                    <h6 className='mb-0 fs-5 fw-bold'>₹ {(item.total_purchase_amount || 0).toLocaleString('en-IN')}</h6>
                    <div className='icon__card'>
                      {/* You can add your SVG icon here if you want */}
                    </div>
                    <hr />
                    <p className='mb-1'>Completed POs</p>
                    <h6 className='mb-3 fs-5 fw-bold'>{item.completed_po_count}</h6>
                    <p className='mb-1'>Total Completed PO Amount (₹)</p>
                    <h6 className='mb-0 fs-5 fw-bold'>₹ {(item.completed_total_po_amount || 0).toLocaleString('en-IN')}</h6>
                  </div>
                </div>
              )) : (
                <p>No recent months data available.</p>
              )}
            </div>
          </div>
        </div>

        <div className='card mt-2'>
          <div className='card-header bg-primary'>
            <h4 className='card-title'>Report Preview</h4>
          </div>
          <div className='card-body p-0 rounded-10'>
            <div className='row g-4'>
              <div className='col-lg-12'>
                <MonthWisePurchaseValueGraph data={reportData} />
              </div>
              <div className='col-lg-12'>
                <div className='table-responsive mb-0'>
                  <Grid style={{ height: 'auto' }} data={reportData} sortable={true}>
                    <GridColumn field="monthLabel" title="Month" />
                    <GridColumn field="total_po_count" title="POs issued" />
                    <GridColumn
                      field="total_purchase_amount"
                      title="Total PO Amount (₹)"
                      cell={(props) => (
                        <td className="text-end">₹ {(props.dataItem.total_purchase_amount || 0).toLocaleString('en-IN')}</td>
                      )}
                    />
                    <GridColumn field="completed_po_count" title="Completed POs" />
                    <GridColumn
                      field="completed_total_po_amount"
                      title="Total Completed PO Amount (₹)"
                      cell={(props) => (
                        <td className="text-end">₹ {(props.dataItem.completed_total_po_amount || 0).toLocaleString('en-IN')}</td>
                      )}
                    />
                  </Grid>
                  {pagination.total_pages > 0 && (
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 px-3 py-2 border-top">
                      <span className="text-muted small">
                        Showing page {pagination.current_page} of {pagination.total_pages} ({pagination.total_records} records)
                      </span>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MonthWisePurchaseValue;
