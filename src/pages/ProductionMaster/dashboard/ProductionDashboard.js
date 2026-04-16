import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DatePicker, Progress, Spin, Table } from "antd";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
} from "recharts";
import { PrivateAxios } from "../../../environment/AxiosInstance";

const { RangePicker } = DatePicker;

// ── Date presets ─────────────────────────────────────────────────
const DATE_PRESETS = [
  { label: "All Time",      value: "all" },
  { label: "This Month",    value: "this_month" },
  { label: "Last Month",    value: "last_month" },
  { label: "Last 3 Months", value: "last_3_months" },
  { label: "This Year",     value: "this_year" },
  { label: "Custom",        value: "custom" },
];

const getDateRange = (preset) => {
  const now = dayjs();
  switch (preset) {
    case "this_month":    return [now.startOf("month"), now.endOf("month")];
    case "last_month":    return [now.subtract(1, "month").startOf("month"), now.subtract(1, "month").endOf("month")];
    case "last_3_months": return [now.subtract(3, "month").startOf("day"), now.endOf("day")];
    case "this_year":     return [now.startOf("year"), now.endOf("year")];
    case "last_year":     return [now.subtract(1, "year").startOf("year"), now.subtract(1, "year").endOf("year")];
    default:              return [null, null];
  }
};

// ── Helpers ──────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-IN").format(Number(n) || 0);
const safePct = (num, den) => (Number(den) > 0 ? Math.min(Math.round((Number(num) / Number(den)) * 100), 100) : 0);

// ── Status config ─────────────────────────────────────────────────
const WO_STATUS = {
  1: { label: "Pending Material Issue", color: "#f59e0b", bg: "#fff7ed" },
  2: { label: "In-Progress",            color: "#3b82f6", bg: "#eff6ff" },
  3: { label: "Material Issued",        color: "#8b5cf6", bg: "#faf5ff" },
  4: { label: "Completed",              color: "#10b981", bg: "#f0fdf4" },
  5: { label: "Cancelled",              color: "#ef4444", bg: "#fef2f2" },
};

const DISPATCH_STATUS = {
  0: { label: "Pending",              color: "#3b82f6", bg: "#eff6ff" },
  1: { label: "Partially Completed",  color: "#f59e0b", bg: "#fffbeb" },
  2: { label: "Fully Completed",      color: "#10b981", bg: "#f0fdf4" },
};

// ── Sub-components ────────────────────────────────────────────────
const WoBadge = ({ status }) => {
  const s = WO_STATUS[Number(status)] || WO_STATUS[1];
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}30`,
      borderRadius: 20, padding: "2px 10px",
      fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
};

const DispatchBadge = ({ status }) => {
  const s = DISPATCH_STATUS[status] || DISPATCH_STATUS[0];
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}30`,
      borderRadius: 20, padding: "2px 10px",
      fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
};

const KpiCard = ({ label, value, color, icon, loading }) => (
  <div
    className="card border-0 shadow-sm h-100"
    style={{ borderRadius: 12, borderLeft: `4px solid ${color}` }}
  >
    <div className="card-body p-3">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, lineHeight: 1.4 }}>
          {label}
        </span>
        <span style={{
          width: 30, height: 30, borderRadius: 8,
          background: `${color}18`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <i className={icon} style={{ color, fontSize: 13 }} />
        </span>
      </div>
      {loading
        ? <div style={{ height: 30 }}><Spin size="small" /></div>
        : <div className="fw-bold" style={{ fontSize: 26, color: "#1e293b", lineHeight: 1 }}>{fmt(value)}</div>
      }
    </div>
  </div>
);

const SectionHeader = ({ title, icon }) => (
  <div className="d-flex align-items-center gap-2 mb-3">
    <i className={icon} style={{ color: "#94a3b8", fontSize: 13 }} />
    <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.8, whiteSpace: "nowrap" }}>
      {title}
    </span>
    <div style={{ flex: 1, height: 1, background: "#e2e8f0", marginLeft: 8 }} />
  </div>
);

const ChartEmpty = ({ icon = "fas fa-chart-bar", label = "No data for this period" }) => (
  <div className="d-flex flex-column align-items-center justify-content-center h-100" style={{ color: "#cbd5e1", gap: 8, padding: 24 }}>
    <i className={icon} style={{ fontSize: 34 }} />
    <span style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", maxWidth: 220 }}>{label}</span>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0",
      borderRadius: 8, padding: "8px 14px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    }}>
      {label && <p style={{ margin: 0, fontWeight: 600, color: "#374151", fontSize: 12 }}>{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ margin: "2px 0", fontSize: 12, color: entry.color }}>
          {entry.name}: <strong>{fmt(entry.value)}</strong>
        </p>
      ))}
    </div>
  );
};

// ── Rate bar row helper ───────────────────────────────────────────
const RateBar = ({ label, num, den, color, unit = "" }) => {
  const p = safePct(num, den);
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between mb-1">
        <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{p}%</span>
      </div>
      <Progress percent={p} showInfo={false} strokeColor={color} trailColor="#e2e8f0" size={["100%", 8]} />
      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
        {fmt(num)} {unit} out of {fmt(den)}{unit ? "" : " total"}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────
function ProductionDashboard() {
  // ── date filter ───────────────────────────────────────────────
  const [datePreset, setDatePreset]   = useState("this_month");
  const [customRange, setCustomRange] = useState([null, null]);

  // ── work order stats ──────────────────────────────────────────
  const [woStats, setWoStats] = useState({
    total: 0, pending_material_issue: 0, in_progress: 0,
    material_issued: 0, completed: 0, cancelled: 0, avg_progress: 0,
  });
  const [woStatsLoading, setWoStatsLoading] = useState(false);

  // ── dispatch stats ─────────────────────────────────────────────
  const [dispatchStats, setDispatchStats] = useState({
    total: 0, pending: 0, in_transit: 0, completed: 0,
    qty_out: 0, qty_delivered: 0, work_orders: 0, customers: 0,
  });
  const [dispatchStatsLoading, setDispatchStatsLoading] = useState(false);

  // ── monthly trend chart ────────────────────────────────────────
  const [monthlyTrend, setMonthlyTrend]     = useState([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  // ── recent activity tables ─────────────────────────────────────
  const [recentWOs,              setRecentWOs]              = useState([]);
  const [recentWOsLoading,       setRecentWOsLoading]       = useState(false);
  const [recentDispatches,       setRecentDispatches]       = useState([]);
  const [recentDispatchesLoading,setRecentDispatchesLoading]= useState(false);

  // ── date params ────────────────────────────────────────────────
  const activeDateRange = useMemo(() => {
    if (datePreset === "custom") return customRange;
    return getDateRange(datePreset);
  }, [datePreset, customRange]);

  const dateParams = useMemo(() => {
    const [from, to] = activeDateRange;
    return {
      ...(from ? { date_from: from.format("YYYY-MM-DD") } : {}),
      ...(to   ? { date_to:   to.format("YYYY-MM-DD")   } : {}),
    };
  }, [activeDateRange]);

  const qs = useCallback(
    (extra = {}) => {
      const p = new URLSearchParams({ ...dateParams, ...extra }).toString();
      return p ? `?${p}` : "";
    },
    [dateParams]
  );

  // ── fetchers ───────────────────────────────────────────────────
  const fetchWoStats = useCallback(async () => {
    setWoStatsLoading(true);
    try {
      const res = await PrivateAxios.get(`/production/work-order/stats${qs()}`);
      const d = res.data?.data || {};
      setWoStats({
        total:                  Number(d.total)                  || 0,
        pending_material_issue: Number(d.pending_material_issue) || 0,
        in_progress:            Number(d.in_progress)            || 0,
        material_issued:        Number(d.material_issued)        || 0,
        completed:              Number(d.completed)              || 0,
        cancelled:              Number(d.cancelled)              || 0,
        avg_progress:           Number(d.avg_progress)           || 0,
      });
    } catch { /* silent — backend API may not exist yet */ }
    finally { setWoStatsLoading(false); }
  }, [qs]);

  const fetchDispatchStats = useCallback(async () => {
    setDispatchStatsLoading(true);
    try {
      const res = await PrivateAxios.get(`/production/dispatch/stats${qs()}`);
      const d = res.data?.data || {};
      setDispatchStats({
        total:         Number(d.total)         || 0,
        pending:       Number(d.pending)       || 0,
        in_transit:    Number(d.in_transit)    || 0,
        completed:     Number(d.completed)     || 0,
        qty_out:       Number(d.qty_out)       || 0,
        qty_delivered: Number(d.qty_delivered) || 0,
        work_orders:   Number(d.work_orders)   || 0,
        customers:     Number(d.customers)     || 0,
      });
    } catch { /* silent */ }
    finally { setDispatchStatsLoading(false); }
  }, [qs]);

  const fetchMonthlyTrend = useCallback(async () => {
    setMonthlyLoading(true);
    try {
      const res = await PrivateAxios.get(`/production/dashboard/monthly-trend${qs()}`);
      setMonthlyTrend(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { setMonthlyTrend([]); }
    finally { setMonthlyLoading(false); }
  }, [qs]);

  const fetchRecentWOs = useCallback(async () => {
    setRecentWOsLoading(true);
    try {
      const res = await PrivateAxios.get(
        "/production/work-order/list?page=1&limit=6&status=active&sort=created_at&order=desc"
      );
      const payload = res.data?.data ?? {};
      const list = Array.isArray(payload?.rows) ? payload.rows
        : Array.isArray(payload) ? payload : [];
      setRecentWOs(
        list.map((item) => ({
          id:         item.id,
          wo_number:  item.wo_number || "N/A",
          customer:   item.customer?.name || item.customer_name || "N/A",
          product:    item.product?.product_name ? item.product.product_name : "N/A",
          store:      item.warehouse?.name || item.store_name || "N/A",
          qty:        Number(item.planned_qty) || 0,
          status:     Number(item.status) || 1,
          progress:   Number(item.progress_percent) || 0,
          due_date:   item.due_date ? dayjs(item.due_date).format("DD/MM/YY") : "N/A",
        }))
      );
    } catch { setRecentWOs([]); }
    finally { setRecentWOsLoading(false); }
  }, []);

  const fetchRecentDispatches = useCallback(async () => {
    setRecentDispatchesLoading(true);
    try {
      const res = await PrivateAxios.get(
        "/production/dispatch?page=1&limit=6&sort_by=created_at&order=DESC"
      );
      const payload = res.data?.data ?? {};
      const list = Array.isArray(payload?.rows) ? payload.rows
        : Array.isArray(payload) ? payload : [];
      setRecentDispatches(
        list.map((item) => ({
          id:              item.id,
          wo_number:       item.wo_number || "N/A",
          customer_name:   item.customer?.name || "N/A",
          product_name:    item.product?.product_name || "N/A",
          final_qty:       Number(item.final_qty) || 0,
          dispatch_status: item.dispatch_status ?? 0,
          due_date:        item.due_date ? dayjs(item.due_date).format("DD/MM/YY") : "N/A",
          total_dispatched_qty: Number(item.total_dispatched_qty) || 0,
        }))
      );
    } catch { setRecentDispatches([]); }
    finally { setRecentDispatchesLoading(false); }
  }, []);

  // refresh date-sensitive data when filter changes
  const refresh = useCallback(() => {
    fetchWoStats();
    fetchDispatchStats();
    fetchMonthlyTrend();
  }, [fetchWoStats, fetchDispatchStats, fetchMonthlyTrend]);

  useEffect(() => { refresh(); }, [refresh]);

  // recent activity is always "latest N", not date-filtered
  useEffect(() => {
    fetchRecentWOs();
    fetchRecentDispatches();
  }, [fetchRecentWOs, fetchRecentDispatches]);

  // ── chart data ─────────────────────────────────────────────────
  const woStatusPieData = useMemo(() => [
    { name: "Pending Material Issue", value: woStats.pending_material_issue, color: "#f59e0b" },
    { name: "In-Progress",            value: woStats.in_progress,            color: "#3b82f6" },
    { name: "Material Issued",        value: woStats.material_issued,        color: "#8b5cf6" },
    { name: "Completed",              value: woStats.completed,              color: "#10b981" },
    { name: "Cancelled",              value: woStats.cancelled,              color: "#ef4444" },
  ].filter((d) => d.value > 0), [woStats]);

  const dispatchPieData = useMemo(() => [
    { name: "Pending",              value: dispatchStats.pending,    color: "#3b82f6" },
    { name: "Partially Completed",  value: dispatchStats.in_transit, color: "#f59e0b" },
    { name: "Fully Completed",      value: dispatchStats.completed,  color: "#10b981" },
  ].filter((d) => d.value > 0), [dispatchStats]);

  // ── table columns ──────────────────────────────────────────────
  const woColumns = [
    {
      title: "WO #", dataIndex: "wo_number", key: "wo_number", width: 125,
      render: (v) => <span className="fw-semibold" style={{ fontSize: 12 }}>{v}</span>,
    },
    {
      title: "Customer", dataIndex: "customer", key: "customer", ellipsis: true, width: 120,
      render: (v) => <span style={{ fontSize: 12, color: "#0f6fb4" }}>{v}</span>,
    },
    {
      title: "Product", dataIndex: "product", key: "product", ellipsis: true, width: 120,
      render: (v) => <span style={{ fontSize: 12 }}>{v}</span>,
    },
    {
      title: "Store", dataIndex: "store", key: "store", width: 130,
      render: (v) => <span style={{ fontSize: 12 }}>{v || "N/A"}</span>,
    },
    {
      title: "Planned Qty", dataIndex: "qty", key: "qty", width: 100,
      render: (v) => <span style={{ fontSize: 12 }}>{fmt(v)}</span>,
    },
    {
      title: "Status", dataIndex: "status", key: "status", width: 170,
      render: (v) => <WoBadge status={v} />,
    },
    // {
    //   title: "Progress", dataIndex: "progress", key: "progress", width: 130,
    //   render: (v) => (
    //     <div className="d-flex align-items-center gap-1">
    //       <Progress percent={v} showInfo={false} size="small" strokeColor="#10b981" style={{ flex: 1 }} />
    //       <span style={{ fontSize: 11, color: "#64748b", minWidth: 28 }}>{v}%</span>
    //     </div>
    //   ),
    // },
    {
      title: "Due Date", dataIndex: "due_date", key: "due_date", width: 100,
      render: (v) => <span style={{ fontSize: 11, color: "#94a3b8" }}>{v}</span>,
    },
  ];

  const dispatchColumns = [
    {
      title: "WO #", dataIndex: "wo_number", key: "wo_number", width: 120,
      render: (v) => <span className="fw-semibold" style={{ fontSize: 12 }}>{v}</span>,
    },
    {
      title: "Customer", dataIndex: "customer_name", key: "customer_name", ellipsis: true, width: 120,
      render: (v) => <span style={{ fontSize: 12, color: "#0f6fb4" }}>{v}</span>,
    },
    {
      title: "Product", dataIndex: "product_name", key: "product_name", ellipsis: true, width: 120,
      render: (v) => <span style={{ fontSize: 12 }}>{v}</span>,
    },
    {
      title: "Final Qty", dataIndex: "final_qty", key: "final_qty", width: 100,
      render: (v) => <span style={{ fontSize: 12 }}>{fmt(v)}</span>,
    },
    {
      title: "Dispatched Qty", dataIndex: "total_dispatched_qty", key: "total_dispatched_qty", width: 100,
      render: (v) => <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>{fmt(v)}</span>,
    },
    {
      title: "Status", dataIndex: "dispatch_status", key: "dispatch_status", width: 140,
      render: (v) => <DispatchBadge status={v} />,
    },
    {
      title: "Due Date", dataIndex: "due_date", key: "due_date", width: 100,
      render: (v) => <span style={{ fontSize: 11, color: "#94a3b8" }}>{v}</span>,
    },
  ];

  // ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <div className="p-4">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
          <div>
            <h3 className="fw-bold mb-0" style={{ color: "#1e293b" }}>
              <i className="fas fa-chart-line me-2" style={{ color: "#6366f1" }} />
              Production Dashboard
            </h3>
            <p className="text-muted mb-0 mt-1" style={{ fontSize: 13 }}>
              Overview of work orders, production progress &amp; dispatch activity
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
            style={{ borderRadius: 8, fontSize: 13, height: 36 }}
          >
            <i className="fas fa-sync-alt" style={{ fontSize: 11 }} />
            Refresh
          </button>
        </div>

        {/* ── Date Preset Tabs ────────────────────────────────────── */}
        <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
          <i className="far fa-calendar-alt" style={{ color: "#94a3b8", fontSize: 13 }} />
          {DATE_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => {
                setDatePreset(p.value);
                if (p.value !== "custom") setCustomRange([null, null]);
              }}
              style={{
                border: "none", borderRadius: 20, padding: "5px 16px",
                fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .15s",
                background: datePreset === p.value ? "#6366f1" : "#fff",
                color: datePreset === p.value ? "#fff" : "#64748b",
                boxShadow: datePreset === p.value
                  ? "0 2px 8px rgba(99,102,241,0.25)"
                  : "0 1px 3px rgba(0,0,0,0.07)",
              }}
            >
              {p.label}
            </button>
          ))}
          {datePreset === "custom" && (
            <RangePicker
              value={customRange}
              onChange={(d) => setCustomRange(d || [null, null])}
              format="DD/MM/YYYY"
              style={{ height: 34 }}
              allowClear
            />
          )}
        </div>

        {/* ── Work Order KPIs ─────────────────────────────────────── */}
        <SectionHeader title="Work Orders" icon="fas fa-clipboard-list" />
        <div className="row g-3 mb-3">
          {[
            { label: "Total Work Orders",       value: woStats.total,                  color: "#6366f1", icon: "fas fa-layer-group" },
            { label: "Pending Material Issue",  value: woStats.pending_material_issue, color: "#f59e0b", icon: "fas fa-box-open" },
            { label: "Production In-Progress",  value: woStats.in_progress,            color: "#3b82f6", icon: "fas fa-cogs" },
            { label: "Material Issued",         value: woStats.material_issued,        color: "#8b5cf6", icon: "fas fa-check-circle" },
            { label: "Production Completed",    value: woStats.completed,              color: "#10b981", icon: "fas fa-flag-checkered" },
            { label: "Cancelled",               value: woStats.cancelled,              color: "#ef4444", icon: "fas fa-times-circle" },
          ].map((card) => (
            <div className="col-6 col-md-4 col-xl-2" key={card.label}>
              <KpiCard {...card} loading={woStatsLoading} />
            </div>
          ))}
        </div>

        {/* avg production progress banner */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 10 }}>
          <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
              <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
                <i className="fas fa-tasks me-2" style={{ color: "#6366f1", fontSize: 11 }} />
                Average Production Progress
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#6366f1" }}>
                {woStatsLoading ? "—" : `${woStats.avg_progress}%`}
              </span>
            </div>
            <Progress
              percent={woStats.avg_progress}
              showInfo={false}
              strokeColor={{ "0%": "#6366f1", "100%": "#10b981" }}
              trailColor="#e2e8f0"
              style={{ marginBottom: 0 }}
            />
            <div className="d-flex flex-wrap gap-3 mt-2">
              {[
                { label: "Pending",         value: woStats.pending_material_issue, color: "#f59e0b" },
                { label: "In-Progress",     value: woStats.in_progress,            color: "#3b82f6" },
                { label: "Material Issued", value: woStats.material_issued,        color: "#8b5cf6" },
                { label: "Completed",       value: woStats.completed,              color: "#10b981" },
                { label: "Cancelled",       value: woStats.cancelled,              color: "#ef4444" },
              ].map((s) => (
                <div key={s.label} className="d-flex align-items-center gap-1">
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "#64748b" }}>{s.label}:</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{fmt(s.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Dispatch & Delivery KPIs ────────────────────────────── */}
        <SectionHeader title="Dispatch & Delivery" icon="fas fa-truck" />
        <div className="row g-3 mb-4">
          {[
            { label: "Total Dispatches",  value: dispatchStats.total,         color: "#0891b2", icon: "fas fa-boxes" },
            { label: "Pending Dispatch",  value: dispatchStats.pending,       color: "#f97316", icon: "fas fa-hourglass-half" },
            { label: "In Transit",        value: dispatchStats.in_transit,    color: "#3b82f6", icon: "fas fa-shipping-fast" },
            { label: "Delivered",         value: dispatchStats.completed,     color: "#10b981", icon: "fas fa-check-double" },
            { label: "Total Qty Out",     value: dispatchStats.qty_out,       color: "#8b5cf6", icon: "fas fa-dolly-flatbed" },
            { label: "Qty Delivered",     value: dispatchStats.qty_delivered, color: "#16a34a", icon: "fas fa-thumbs-up" },
            { label: "WOs Dispatched",    value: dispatchStats.work_orders,   color: "#d97706", icon: "fas fa-clipboard" },
            { label: "Customers Served",  value: dispatchStats.customers,     color: "#7c3aed", icon: "fas fa-users" },
          ].map((card) => (
            <div className="col-6 col-md-4 col-lg-3" key={card.label}>
              <KpiCard {...card} loading={dispatchStatsLoading} />
            </div>
          ))}
        </div>

        {/* ── Visual Analytics ─────────────────────────────────────── */}
        <SectionHeader title="Visual Analytics" icon="fas fa-chart-pie" />
        <div className="row g-3 mb-4">

          {/* WO Status Donut */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
              <div className="card-body p-3">
                <div className="fw-semibold mb-1" style={{ fontSize: 13, color: "#374151" }}>
                  <i className="fas fa-circle-notch me-2" style={{ color: "#94a3b8", fontSize: 11 }} />
                  Work Order Status
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 12 }}>
                  {fmt(woStats.total)} total work orders
                </div>
                <div style={{ height: 240 }}>
                  {woStatsLoading
                    ? <div className="d-flex align-items-center justify-content-center h-100"><Spin /></div>
                    : woStatusPieData.length > 0
                      ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={woStatusPieData}
                              cx="50%" cy="44%"
                              innerRadius={54} outerRadius={88}
                              paddingAngle={3} dataKey="value"
                            >
                              {woStatusPieData.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                              ))}
                            </Pie>
                            <RTooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      )
                      : <ChartEmpty icon="fas fa-clipboard-list" label="No work order data for this period" />
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Dispatch Status Donut */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
              <div className="card-body p-3">
                <div className="fw-semibold mb-1" style={{ fontSize: 13, color: "#374151" }}>
                  <i className="fas fa-truck me-2" style={{ color: "#94a3b8", fontSize: 11 }} />
                  Dispatch Status
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 12 }}>
                  {fmt(dispatchStats.total)} total dispatches
                </div>
                <div style={{ height: 240 }}>
                  {dispatchStatsLoading
                    ? <div className="d-flex align-items-center justify-content-center h-100"><Spin /></div>
                    : dispatchPieData.length > 0
                      ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={dispatchPieData}
                              cx="50%" cy="44%"
                              innerRadius={54} outerRadius={88}
                              paddingAngle={3} dataKey="value"
                            >
                              {dispatchPieData.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                              ))}
                            </Pie>
                            <RTooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      )
                      : <ChartEmpty icon="fas fa-truck" label="No dispatch data for this period" />
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Key Performance Rates */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
              <div className="card-body p-3">
                <div className="fw-semibold mb-3" style={{ fontSize: 13, color: "#374151" }}>
                  <i className="fas fa-tachometer-alt me-2" style={{ color: "#94a3b8", fontSize: 11 }} />
                  Key Performance Rates
                </div>

                <RateBar
                  label="WO Completion Rate"
                  num={woStats.completed} den={woStats.total}
                  color="#6366f1"
                  unit=" WOs"
                />
                <RateBar
                  label="Dispatch Fulfillment"
                  num={dispatchStats.qty_delivered} den={dispatchStats.qty_out}
                  color="#10b981"
                  unit=" units"
                />
                <RateBar
                  label="In-Transit Rate"
                  num={dispatchStats.in_transit} den={dispatchStats.total}
                  color="#3b82f6"
                  unit=" dispatches"
                />
                <RateBar
                  label="Cancellation Rate"
                  num={woStats.cancelled} den={woStats.total}
                  color="#ef4444"
                  unit=" WOs"
                />

                {/* bottom strip */}
                <div className="d-flex gap-2 mt-2">
                  <div
                    className="flex-fill text-center p-2 rounded"
                    style={{ background: "#fef9ec", border: "1px solid #fde68a" }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#d97706" }}>
                      {fmt(dispatchStats.work_orders)}
                    </div>
                    <div style={{ fontSize: 10, color: "#92400e" }}>WOs Dispatched</div>
                  </div>
                  <div
                    className="flex-fill text-center p-2 rounded"
                    style={{ background: "#f5f3ff", border: "1px solid #ddd6fe" }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#7c3aed" }}>
                      {fmt(dispatchStats.customers)}
                    </div>
                    <div style={{ fontSize: 10, color: "#5b21b6" }}>Customers Served</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Monthly Production & Dispatch Trend ─────────────────── */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
          <div className="card-body p-3">
            <div className="mb-3">
              <div className="fw-semibold" style={{ fontSize: 13, color: "#374151" }}>
                <i className="fas fa-chart-bar me-2" style={{ color: "#94a3b8", fontSize: 11 }} />
                Monthly Production &amp; Dispatch Trend
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>
                Work orders created, completed &amp; dispatches per month
              </div>
            </div>
            <div style={{ height: 280 }}>
              {monthlyLoading
                ? <div className="d-flex align-items-center justify-content-center h-100"><Spin /></div>
                : monthlyTrend.length > 0
                  ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyTrend}
                        margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                        barCategoryGap="28%"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <RTooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="created"    name="WOs Created"   fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={32} />
                        <Bar dataKey="completed"  name="WOs Completed" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                        <Bar dataKey="dispatches" name="Dispatches"    fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  )
                  : (
                    <ChartEmpty
                      icon="fas fa-chart-bar"
                      label="Monthly trend data will appear here once the /production/dashboard/monthly-trend endpoint is implemented on the backend"
                    />
                  )
              }
            </div>
          </div>
        </div>

        {/* ── Recent Activity ──────────────────────────────────────── */}
        <SectionHeader title="Recent Activity" icon="fas fa-history" />
        <div className="row g-3">

          {/* Latest Work Orders */}
          <div className="col-12 col-xl-7">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
              <div className="card-body p-0">
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                  <span className="fw-semibold" style={{ fontSize: 13, color: "#374151" }}>
                    <i className="fas fa-clipboard-list me-2" style={{ color: "#94a3b8", fontSize: 11 }} />
                    Latest Work Orders
                  </span>
                  <Link
                    to="/production/work-orders"
                    style={{ fontSize: 12, color: "#6366f1", fontWeight: 600, textDecoration: "none" }}
                  >
                    View All <i className="fas fa-arrow-right ms-1" style={{ fontSize: 10 }} />
                  </Link>
                </div>
                <div className="bg_succes_table_head rounded_table">
                  <Table
                    rowKey="id"
                    columns={woColumns}
                    dataSource={recentWOs}
                    loading={recentWOsLoading}
                    pagination={false}
                    scroll={{ x: 720 }}
                    size="small"
                    locale={{ emptyText: "No work orders found." }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Latest Dispatches */}
          <div className="col-12 col-xl-5">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
              <div className="card-body p-0">
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                  <span className="fw-semibold" style={{ fontSize: 13, color: "#374151" }}>
                    <i className="fas fa-truck me-2" style={{ color: "#94a3b8", fontSize: 11 }} />
                    Latest Dispatches
                  </span>
                  <Link
                    to="/production/dispatch"
                    style={{ fontSize: 12, color: "#6366f1", fontWeight: 600, textDecoration: "none" }}
                  >
                    View All <i className="fas fa-arrow-right ms-1" style={{ fontSize: 10 }} />
                  </Link>
                </div>
                <div className="bg_succes_table_head rounded_table">
                  <Table
                    rowKey="id"
                    columns={dispatchColumns}
                    dataSource={recentDispatches}
                    loading={recentDispatchesLoading}
                    pagination={false}
                    scroll={{ x: 640 }}
                    size="small"
                    locale={{ emptyText: "No dispatches found." }}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProductionDashboard;
