import React, { useState, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { subMonths } from "date-fns";
import { PrivateAxios } from "../../../environment/AxiosInstance";

const toDateString = (d) => {
  if (!d || !(d instanceof Date)) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const toTitleCase = (value) => {
  if (!value) return "";
  return String(value)
    .split(/[\s_-]+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");
};

const formatDateDMY = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
};

const INITIAL_WO_PAGINATION = {
  current_page: 1,
  total_pages: 1,
  total_records: 0,
  per_page: 10,
  has_next_page: false,
  has_prev_page: false,
};

function ProductionPlanningVsActualReport() {
  const [type, setType] = useState("employee");
  const [selectedRange, setSelectedRange] = useState("3m");
  const [fmsData, setFmsData] = useState({ startDate: null, endDate: null });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    type: "employee",
    from_date: null,
    to_date: null,
  });
  const [woModalStaff, setWoModalStaff] = useState(null);
  const [woRows, setWoRows] = useState([]);
  const [woLoading, setWoLoading] = useState(false);
  const [woPagination, setWoPagination] = useState(INITIAL_WO_PAGINATION);

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

  const fetchReport = useCallback(async (reportType, startDate, endDate) => {
    setLoading(true);
    try {
      const params = { type: reportType };
      const fromStr = toDateString(startDate);
      const toStr = toDateString(endDate);
      if (fromStr) params.from_date = fromStr;
      if (toStr) params.to_date = toStr;

      const response = await PrivateAxios.get(
        "report/production/production-planning-vs-actual-report",
        { params }
      );
      const data = response.data?.data || {};
      setRows(Array.isArray(data.rows) ? data.rows : []);
      setAppliedFilters({
        type: data.type || reportType,
        from_date: fromStr || null,
        to_date: toStr || null,
      });
    } catch (error) {
      console.error("Failed to fetch production planning vs actual report:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const today = new Date();
    const threeMonthsAgo = subMonths(today, 3);
    setFmsData({ startDate: threeMonthsAgo, endDate: today });
    fetchReport("employee", threeMonthsAgo, today);
  }, [fetchReport]);

  const handleGenerateReport = (e) => {
    e.preventDefault();
    const { startDate, endDate } = getDateParams();
    if (
      selectedRange === "custom" &&
      (!fmsData.startDate || !fmsData.endDate || fmsData.startDate > fmsData.endDate)
    ) {
      alert("Please provide a valid custom date range.");
      return;
    }
    if (selectedRange === "3m" || selectedRange === "6m") {
      setFmsData({ startDate, endDate });
    }
    fetchReport(type, startDate, endDate);
  };

  const handleReset = () => {
    setType("employee");
    setSelectedRange("");
    setFmsData({ startDate: null, endDate: null });
    fetchReport("employee", null, null);
  };

  const handleRangeToggle = (range) => {
    if (selectedRange === range) {
      // Clicking the same tab again clears the date range filter and re-fetches unfiltered.
      setSelectedRange("");
      setFmsData({ startDate: null, endDate: null });
      fetchReport(type, null, null);
    } else {
      setSelectedRange(range);
    }
  };

  const handleTypeChange = (nextType) => {
    if (nextType === type) return;
    setType(nextType);
    const { startDate, endDate } = getDateParams();
    fetchReport(nextType, startDate, endDate);
  };

  const groupKeyLabel = appliedFilters.type === "shift" ? "Shift" : "Responsible Person";
  const groupKeyField =
    appliedFilters.type === "shift" ? "work_shift" : "responsible_staff";

  const totals = rows.reduce(
    (acc, r) => {
      acc.assigned_work_orders += Number(r.assigned_work_orders) || 0;
      acc.planned_qty += Number(r.planned_qty) || 0;
      acc.completed_qty += Number(r.completed_qty) || 0;
      return acc;
    },
    { assigned_work_orders: 0, planned_qty: 0, completed_qty: 0 }
  );

  const completionPct = (planned, completed) => {
    const p = Number(planned) || 0;
    const c = Number(completed) || 0;
    if (p <= 0) return "—";
    return `${((c / p) * 100).toFixed(1)}%`;
  };

  const wastagePct = (planned, completed) => {
    const p = Number(planned) || 0;
    const c = Number(completed) || 0;
    if (p <= 0) return "—";
    const w = Math.max(0, p - c);
    return `${((w / p) * 100).toFixed(1)}%`;
  };

  const fetchStaffWorkOrders = async (staffName, page = 1) => {
    if (!staffName) return;
    setWoLoading(true);
    try {
      const params = { page, limit: 10, responsible_staff: staffName };
      if (appliedFilters.from_date) params.from_date = appliedFilters.from_date;
      if (appliedFilters.to_date) params.to_date = appliedFilters.to_date;
      const response = await PrivateAxios.get("/production/planning/list", { params });
      const data = response.data?.data || {};
      setWoRows(Array.isArray(data.rows) ? data.rows : []);
      setWoPagination({ ...INITIAL_WO_PAGINATION, ...(data.pagination || {}) });
    } catch (error) {
      console.error("Failed to fetch staff work orders:", error);
      setWoRows([]);
      setWoPagination(INITIAL_WO_PAGINATION);
    } finally {
      setWoLoading(false);
    }
  };

  const openWorkOrdersModal = (staffName) => {
    if (!staffName) return;
    setWoModalStaff(staffName);
    setWoRows([]);
    setWoPagination(INITIAL_WO_PAGINATION);
    fetchStaffWorkOrders(staffName, 1);
  };

  const closeWorkOrdersModal = () => {
    setWoModalStaff(null);
    setWoRows([]);
    setWoPagination(INITIAL_WO_PAGINATION);
  };

  const renderPlanDuration = (row) => {
    const start = formatDateDMY(row?.planned_start_date);
    const end = formatDateDMY(row?.planned_end_date);
    if (!start && !end) return "—";
    return `${start || "—"} → ${end || "—"}`;
  };

  const renderFgProduct = (row) => {
    const name = row?.product?.product_name || "N/A";
    const code = row?.product?.product_code;
    const variant = row?.finalProductVariant;
    const variantLabel = variant?.weight_per_unit
      ? `${variant.weight_per_unit} ${variant?.masterUOM?.label || ""}`.trim()
      : "";
    return (
      <>
        <div className="fw-semibold">
          {name}
          {code ? ` (${code})` : ""}
        </div>
        {variantLabel && (
          <div className="text-muted" style={{ fontSize: 12 }}>
            Variant: {variantLabel}
          </div>
        )}
      </>
    );
  };

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
              {filterCollapsed ? (
                <i className="fas fa-chevron-down" />
              ) : (
                <i className="fas fa-chevron-up" />
              )}
            </span>
          </div>
          <div style={{ display: filterCollapsed ? "none" : "block" }}>
            <div className="card-body pb-1">
              <div className="row">
                <div className="col-xl-4">
                  <label className="col-form-label">Group By</label>
                  <div className="form-group">
                    <div className="d-flex flex-wrap">
                      {["employee", "shift"].map((t) => (
                        <label
                          key={t}
                          className={`custom-radio btn-type-radio mb-2 me-3 ${
                            type === t ? "active" : ""
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleTypeChange(t);
                          }}
                        >
                          <input
                            type="radio"
                            name="reportType"
                            value={t}
                            checked={type === t}
                            readOnly
                            tabIndex={-1}
                          />
                          <span className="checkmark" />
                          <span className="text-">{t === "employee" ? "Employee" : "Shift"}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-xl-8">
                  <label className="col-form-label">Quick Report (click again to clear)</label>
                  <div className="form-group">
                    <div className="d-flex flex-wrap">
                      {["3m", "6m", "custom"].map((range) => (
                        <label
                          key={range}
                          className={`custom-radio btn-type-radio mb-2 me-3 ${
                            selectedRange === range ? "active" : ""
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleRangeToggle(range);
                          }}
                        >
                          <input
                            type="radio"
                            name="reportRange"
                            value={range}
                            checked={selectedRange === range}
                            readOnly
                            tabIndex={-1}
                          />
                          <span className="checkmark" />
                          <span className="text-">
                            {range === "3m"
                              ? "3 Months"
                              : range === "6m"
                              ? "6 Months"
                              : "Custom Range"}
                          </span>
                        </label>
                      ))}
                    </div>

                    {selectedRange === "custom" && (
                      <div className="row">
                        <div className="col-md-6 col-12">
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
                              onChange={(date) =>
                                setFmsData({ ...fmsData, startDate: date })
                              }
                              dateFormat="dd/MM/yyyy"
                              placeholderText="Select Date"
                            />
                          </div>
                        </div>
                        <div className="col-md-6 col-12">
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
                              onChange={(date) =>
                                setFmsData({ ...fmsData, endDate: date })
                              }
                              dateFormat="dd/MM/yyyy"
                              placeholderText="Select Date"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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

      {/* ── Report Table ── */}
      <div className="card mt-4">
        <div className="card-header bg-primary d-flex justify-content-between align-items-center">
          <h4 className="card-title mb-0">Production Planning vs Actual Report</h4>
          <div className="small text-white">
            {appliedFilters.from_date || appliedFilters.to_date ? (
              <>
                <i className="fas fa-calendar-alt me-2" />
                {appliedFilters.from_date || "…"} &rarr; {appliedFilters.to_date || "…"}
              </>
            ) : (
              <span>All dates</span>
            )}
          </div>
        </div>
        <div className="card-body p-0 table-responsive">
          {loading ? (
            <div className="p-4 text-center">Loading report data...</div>
          ) : (
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>SL No.</th>
                  <th>{groupKeyLabel}</th>
                  <th>Assigned Work Orders</th>
                  <th>Planned Qty</th>
                  <th>Completed Qty</th>
                  <th>Completion %</th>
                  <th>Wastage %</th>
                  <th className="text-center" style={{ width: 90 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">
                      No records found
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr key={`${row[groupKeyField]}-${index}`}>
                      <td>{index + 1}</td>
                      <td className="fw-semibold">
                        {appliedFilters.type === "shift"
                          ? toTitleCase(row.work_shift) || "—"
                          : row.responsible_staff || "—"}
                      </td>
                      <td>{row.assigned_work_orders ?? 0}</td>
                      <td>{row.planned_qty ?? 0}</td>
                      <td>{row.completed_qty ?? 0}</td>
                      <td style={{ color: "green" }}>
                        {completionPct(row.planned_qty, row.completed_qty)}
                      </td>
                      <td style={{ color: "red" }}>
                        {wastagePct(row.planned_qty, row.completed_qty)}
                      </td>
                      <td className="text-center">
                        {appliedFilters.type === "employee" && row.responsible_staff ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-link p-0"
                            title={`View work orders for ${row.responsible_staff}`}
                            onClick={() => openWorkOrdersModal(row.responsible_staff)}
                          >
                            <i className="fas fa-eye" />
                          </button>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {rows.length > 0 && (
                <tfoot>
                  <tr className="fw-semibold">
                    <td colSpan={2} className="text-end">
                      Totals
                    </td>
                    <td>{totals.assigned_work_orders}</td>
                    <td>{totals.planned_qty}</td>
                    <td>{totals.completed_qty}</td>
                    <td style={{ color: "green" }}>
                      {completionPct(totals.planned_qty, totals.completed_qty)}
                    </td>
                    <td style={{ color: "red" }}>
                      {wastagePct(totals.planned_qty, totals.completed_qty)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div>
      </div>

      {/* ── Work Orders Modal ── */}
      {woModalStaff && (
        <div
          className="modal-backdrop-custom"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1050,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "40px 16px",
            overflowY: "auto",
          }}
          onClick={closeWorkOrdersModal}
        >
          <div
            className="card shadow"
            style={{ width: "100%", maxWidth: 1100 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="card-header bg-primary"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "nowrap",
                gap: 12,
              }}
            >
              <h4
                className="card-title mb-0 text-white"
                style={{ flex: "1 1 auto", minWidth: 0 }}
              >
                Assigned Work Orders — {woModalStaff}
              </h4>
              <button
                type="button"
                onClick={closeWorkOrdersModal}
                aria-label="Close"
                style={{
                  flex: "0 0 auto",
                  width: 32,
                  height: 32,
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  color: "#fff",
                  fontSize: 20,
                  lineHeight: 1,
                  cursor: "pointer",
                }}
              >
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="card-body p-0 table-responsive">
              {woLoading ? (
                <div className="p-4 text-center">Loading work orders...</div>
              ) : (
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: 70 }}>SL No.</th>
                      <th>Work Order No.</th>
                      <th>FG Product</th>
                      <th>Required Qty</th>
                      <th>Planned Qty</th>
                      <th>Completed Qty</th>
                      <th>Plan Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {woRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-4">
                          No work orders found
                        </td>
                      </tr>
                    ) : (
                      woRows.map((row, index) => (
                        <tr key={row.id ?? index}>
                          <td>
                            {(woPagination.current_page - 1) * woPagination.per_page +
                              index +
                              1}
                          </td>
                          <td className="fw-semibold">{row.wo_number || "—"}</td>
                          <td>{renderFgProduct(row)}</td>
                          <td>{Number(row.required_qty) || 0}</td>
                          <td>{Number(row.planned_qty) || 0}</td>
                          <td>{Number(row.total_completed_qty) || 0}</td>
                          <td>{renderPlanDuration(row)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
            {woRows.length > 0 && (
              <div
                className="card-footer"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div className="small text-muted" style={{ flex: "1 1 auto" }}>
                  Page {woPagination.current_page} of {woPagination.total_pages} ·{" "}
                  {woPagination.total_records} record
                  {woPagination.total_records === 1 ? "" : "s"}
                </div>
                <div style={{ display: "flex", gap: 8, flex: "0 0 auto" }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-exp-light"
                    disabled={!woPagination.has_prev_page || woLoading}
                    onClick={() =>
                      fetchStaffWorkOrders(
                        woModalStaff,
                        woPagination.prev_page || woPagination.current_page - 1
                      )
                    }
                  >
                    <i className="fas fa-chevron-left me-1" />
                    Previous
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-exp-light"
                    disabled={!woPagination.has_next_page || woLoading}
                    onClick={() =>
                      fetchStaffWorkOrders(
                        woModalStaff,
                        woPagination.next_page || woPagination.current_page + 1
                      )
                    }
                  >
                    Next
                    <i className="fas fa-chevron-right ms-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductionPlanningVsActualReport;
