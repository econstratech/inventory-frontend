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
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
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
                      <td>{completionPct(row.planned_qty, row.completed_qty)}</td>
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
                    <td>{completionPct(totals.planned_qty, totals.completed_qty)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductionPlanningVsActualReport;
