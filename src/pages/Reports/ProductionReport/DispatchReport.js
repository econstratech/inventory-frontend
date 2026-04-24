import React, { useState, useEffect, useCallback } from "react";
import { Tag } from "antd";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { subMonths } from "date-fns";
import { PrivateAxios } from "../../../environment/AxiosInstance";
import { UserAuth } from "../../auth/Auth";

const toDateString = (d) => {
  if (!d || !(d instanceof Date)) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const DISPATCH_STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "0", label: "Not Dispatched" },
  { value: "1", label: "Partially Dispatched" },
  { value: "2", label: "Fully Dispatched" },
];

const dispatchStatusTagColor = (status) => {
  const s = Number(status);
  if (s === 2) return "green";
  if (s === 1) return "orange";
  return "default";
};

function DispatchReport() {
  const { isVariantBased } = UserAuth();

  const [selectedRange, setSelectedRange] = useState("3m");
  const [fmsData, setFmsData] = useState({ startDate: null, endDate: null });
  const [search, setSearch] = useState("");
  const [dispatchStatus, setDispatchStatus] = useState("");
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
  const [pageSize, setPageSize] = useState(15);
  const [filterCollapsed, setFilterCollapsed] = useState(false);

  const PAGE_SIZE_OPTIONS = [10, 15, 25, 50];

  const getDateParams = useCallback(
    (rangeOverride, fmsOverride) => {
      const range = rangeOverride ?? selectedRange;
      const fms = fmsOverride ?? fmsData;
      const today = new Date();
      let startDate = null;
      let endDate = null;

      if (range === "custom" && fms.startDate && fms.endDate) {
        startDate = fms.startDate;
        endDate = fms.endDate;
      } else if (range === "3m") {
        startDate = subMonths(today, 3);
        endDate = today;
      } else if (range === "6m") {
        startDate = subMonths(today, 6);
        endDate = today;
      }
      return { startDate, endDate };
    },
    [selectedRange, fmsData]
  );

  const fetchReportData = useCallback(
    async (startDate, endDate, page = 1, limit = 15, searchVal = "", statusVal = "") => {
      setLoading(true);
      try {
        const params = { page, limit };
        const startStr = toDateString(startDate);
        const endStr = toDateString(endDate);
        if (startStr) params.date_from = startStr;
        if (endStr) params.date_to = endStr;
        if (searchVal.trim()) params.search = searchVal.trim();
        if (statusVal !== "") params.dispatch_status = statusVal;

        const response = await PrivateAxios.get("report/production/dispatch-report", { params });
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
        console.error("Failed to fetch dispatch report:", error);
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
    fetchReportData(threeMonthsAgo, today, 1, 15, "", "");
  }, [fetchReportData]);

  const handleGenerateReport = (e) => {
    e.preventDefault();
    const { startDate, endDate } = getDateParams();
    if (selectedRange === "custom" && (!fmsData.startDate || !fmsData.endDate || fmsData.startDate > fmsData.endDate)) {
      alert("Please provide a valid custom date range.");
      return;
    }
    if (selectedRange === "3m" || selectedRange === "6m") {
      setFmsData({ startDate, endDate });
    }
    fetchReportData(startDate, endDate, 1, pageSize, search, dispatchStatus);
  };

  const handleReset = () => {
    const today = new Date();
    const threeMonthsAgo = subMonths(today, 3);
    setSelectedRange("");
    setFmsData({ startDate: threeMonthsAgo, endDate: today });
    setSearch("");
    setDispatchStatus("");
    setPageSize(15);
    fetchReportData(null, null, 1, 15, "", "");
  };

  const handlePageChange = (newPage) => {
    const { startDate, endDate } = getDateParams();
    fetchReportData(startDate, endDate, newPage, pageSize, search, dispatchStatus);
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value) || 15;
    setPageSize(newSize);
    const { startDate, endDate } = getDateParams();
    fetchReportData(startDate, endDate, 1, newSize, search, dispatchStatus);
  };

  const handleRangeToggle = (range) => {
    setSelectedRange((prev) => (prev === range ? "" : range));
  };

  const colCount = isVariantBased ? 10 : 7;

  return (
    <div className="p-4">
      <div className="mb-3">
        <button className="btn link-btn text-dark" onClick={() => window.history.back()}>
          <i className="fas fa-long-arrow-alt-left me-1" />
          Back
        </button>
      </div>

      {/* ── Filters ── */}
      <form onSubmit={handleGenerateReport}>
        <div className="card">
          <div
            className="card-header d-flex justify-content-between align-items-center"
            onClick={() => setFilterCollapsed((c) => !c)}
            style={{ cursor: "pointer" }}
            aria-expanded={!filterCollapsed}
          >
            <h4 className="card-title mb-0">Filters</h4>
            <span className="btn btn-sm btn-link text-dark p-0">
              {filterCollapsed ? <i className="fas fa-chevron-down" /> : <i className="fas fa-chevron-up" />}
            </span>
          </div>
          <div style={{ display: filterCollapsed ? "none" : "block" }}>
            <div className="card-body pb-1">
              <div className="row g-3">
                <div className="col-xl-4 col-lg-12 py-3">
                  <label className="col-form-label">Quick Report (click again to clear)</label>
                  <div className="d-flex flex-nowrap gap-2 overflow-auto">
                    {["3m", "6m", "custom"].map((range) => (
                      <label
                        key={range}
                        className={`custom-radio btn-type-radio mb-0 ${selectedRange === range ? "active" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleRangeToggle(range);
                        }}
                        style={{ flex: "0 0 auto" }}
                      >
                        <input type="radio" name="reportRange" value={range} checked={selectedRange === range} readOnly tabIndex={-1} />
                        <span className="checkmark" />
                        <span className="text-">{range === "3m" ? "3 Months" : range === "6m" ? "6 Months" : "Custom Range"}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="col-xl-3 col-lg-4 col-md-6 py-3">
                  <label className="col-form-label">Dispatch Status</label>
                  <select
                    className="form-select"
                    value={dispatchStatus}
                    onChange={(e) => setDispatchStatus(e.target.value)}
                  >
                    {DISPATCH_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-xl-3 col-lg-8 col-md-6 py-3">
                  <label className="col-form-label">Search</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by WO number or FG name / code"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {selectedRange === "custom" && (
                  <>
                    <div className="col-xl-3 col-md-6">
                      <label className="col-form-label">
                        From <span className="text-exp-red">*</span>
                      </label>
                      <div className="exp-datepicker-cont">
                        <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                        <DatePicker
                          required
                          selected={fmsData.startDate}
                          onChange={(date) => setFmsData({ ...fmsData, startDate: date })}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Select Date"
                        />
                      </div>
                    </div>
                    <div className="col-xl-3 col-md-6">
                      <label className="col-form-label">
                        To <span className="text-exp-red">*</span>
                      </label>
                      <div className="exp-datepicker-cont">
                        <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                        <DatePicker
                          required
                          selected={fmsData.endDate}
                          onChange={(date) => setFmsData({ ...fmsData, endDate: date })}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Select Date"
                        />
                      </div>
                    </div>
                  </>
                )}
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

      {/* ── Report Table ── */}
      <div className="card mt-4">
        <div className="card-header bg-primary d-flex justify-content-between align-items-center">
          <h4 className="card-title mb-0">Dispatch Report</h4>
        </div>
        <div className="card-body p-0 table-responsive">
          {loading ? (
            <div className="p-4 text-center">Loading report data...</div>
          ) : (
            <>
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 80 }}>SL No.</th>
                    <th>Work Order No.</th>
                    <th>FG Name</th>
                    {isVariantBased && <th>Variant</th>}
                    <th>Planned Qty</th>
                    {isVariantBased && <th>Planned Weight</th>}
                    <th>Raw Material Used Qty</th>
                    {isVariantBased && <th>Used Weight</th>}
                    <th>Dispatch Status</th>
                    <th>Production Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.length === 0 ? (
                    <tr>
                      <td colSpan={colCount} className="text-center text-muted py-4">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    reportData.map((row, index) => (
                      <tr key={row.id}>
                        <td>{(pagination.current_page - 1) * pagination.per_page + index + 1}</td>
                        <td className="fw-semibold">{row.wo_number}</td>
                        <td>
                          <div>{row.fg_product?.product_name || "N/A"}</div>
                          {row.fg_product?.product_code && (
                            <small className="text-muted">{row.fg_product.product_code}</small>
                          )}
                        </td>
                        {isVariantBased && (
                          <td>
                            {row.fg_variant ? (
                              <span>
                                {row.fg_variant.weight_per_unit} {row.fg_variant.uom_label}
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </td>
                        )}
                        <td>{row.planned_qty}</td>
                        {isVariantBased && (
                          <td className="fw-semibold">{row.planned_weight || "N/A"}</td>
                        )}
                        <td>{row.raw_material_used_qty}</td>
                        {isVariantBased && (
                          <td className="fw-semibold">{row.used_weight || "N/A"}</td>
                        )}
                        <td>
                          <Tag
                            color={dispatchStatusTagColor(row.dispatch_status)}
                            style={{ fontWeight: 600 }}
                          >
                            {row.dispatch_status_label || "N/A"}
                          </Tag>
                        </td>
                        <td>{formatDisplayDate(row.production_completed_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {(pagination.total_pages > 0 || reportData.length > 0) && (
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 px-3 py-2 border-top">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="text-muted small">
                      Showing page {pagination.current_page} of {pagination.total_pages || 1} ({pagination.total_records} records)
                    </span>
                    <label className="d-flex align-items-center gap-1 small mb-0">
                      <span className="text-muted">Per page:</span>
                      <select className="form-select form-select-sm" value={pageSize} onChange={handlePageSizeChange} style={{ width: "auto" }}>
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

export default DispatchReport;
