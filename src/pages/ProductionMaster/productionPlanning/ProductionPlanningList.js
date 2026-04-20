import React, { useEffect, useState } from "react";
import { Button, Input, Modal, Select, Table, Tooltip } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import DeleteModal from "../../CommonComponent/DeleteModal";
import { PrivateAxios } from "../../../environment/AxiosInstance";
import { ErrorMessage, SuccessMessage } from "../../../environment/ToastMessage";

function ProductionPlanningList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [pageState, setPageState] = useState({ skip: 0, take: 10 });
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [entriesTarget, setEntriesTarget] = useState(null);
  const [entries, setEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [entryForm, setEntryForm] = useState({
    completed_qty: null,
    work_shift: undefined,
    responsible_staff: "",
  });
  const [entryErrors, setEntryErrors] = useState({});
  const [savingEntry, setSavingEntry] = useState(false);

  const fetchPlannings = async (customPageState = null, customSearch = null) => {
    const currentPageState = customPageState || pageState;
    const currentSearch = customSearch !== null ? customSearch : search;

    setListLoading(true);
    try {
      const page = currentPageState.skip / currentPageState.take + 1;
      const query = new URLSearchParams({
        page: String(page),
        limit: String(currentPageState.take),
        ...(currentSearch ? { wo_number: currentSearch } : {}),
      });

      const res = await PrivateAxios.get(`/production/planning/list?${query.toString()}`);
      const data = res.data?.data || {};
      setRows(Array.isArray(data.rows) ? data.rows : []);
      setTotalCount(Number(data?.pagination?.total_records) || 0);
    } catch (error) {
      setRows([]);
      setTotalCount(0);
      ErrorMessage(error?.response?.data?.message || "Failed to fetch production plannings.");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTableChange = (pagination) => {
    const next = {
      skip: (pagination.current - 1) * pagination.pageSize,
      take: pagination.pageSize,
    };
    setPageState(next);
    fetchPlannings(next);
  };

  const handleSearch = (value) => {
    const trimmed = (value || "").trim();
    const next = { skip: 0, take: pageState.take };
    setPageState(next);
    setSearch(trimmed);
    fetchPlannings(next, trimmed);
  };

  const fetchEntries = async (planningId) => {
    if (!planningId) return;
    setEntriesLoading(true);
    try {
      const res = await PrivateAxios.get(`/production/planning/${planningId}/entry-records`);
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setEntries(list);
    } catch (error) {
      setEntries([]);
      ErrorMessage(error?.response?.data?.message || "Failed to fetch production entries.");
    } finally {
      setEntriesLoading(false);
    }
  };

  const openEntriesModal = (record) => {
    setEntriesTarget(record);
    setEntries([]);
    setEntryForm({
      completed_qty: null,
      work_shift: undefined,
      responsible_staff: record?.responsible_staff || "",
    });
    setEntryErrors({});
    fetchEntries(record.id);
  };

  const closeEntriesModal = () => {
    if (savingEntry) return;
    setEntriesTarget(null);
    setEntries([]);
    setEntryForm({ completed_qty: null, work_shift: undefined, responsible_staff: "" });
    setEntryErrors({});
  };

  const updateEntryField = (key, value) => {
    setEntryForm((prev) => ({ ...prev, [key]: value }));
    setEntryErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const submitEntry = async () => {
    if (!entriesTarget?.id) return;
    const nextErrors = {};
    if (entryForm.completed_qty == null || Number(entryForm.completed_qty) <= 0) {
      nextErrors.completed_qty = "Enter a quantity greater than 0";
    }
    if (!entryForm.work_shift) nextErrors.work_shift = "Select a shift";
    if (!entryForm.responsible_staff?.trim()) {
      nextErrors.responsible_staff = "Responsible person is required";
    }
    setEntryErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSavingEntry(true);
    try {
      const payload = {
        completed_qty: Number(entryForm.completed_qty),
        work_shift: entryForm.work_shift,
        responsible_staff: entryForm.responsible_staff.trim(),
      };
      const res = await PrivateAxios.post(
        `/production/planning/${entriesTarget.id}/entry-record`,
        payload
      );
      SuccessMessage(res?.data?.message || "Production entry added successfully");
      setEntryForm({
        completed_qty: null,
        work_shift: undefined,
        responsible_staff: entriesTarget?.responsible_staff || "",
      });
      setEntryErrors({});
      fetchEntries(entriesTarget.id);
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to add production entry.");
    } finally {
      setSavingEntry(false);
    }
  };

  const parseShiftLabel = (value) => {
    if (!value) return "—";
    if (typeof value !== "string") return String(value);
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.join(", ") || "—";
      return String(parsed);
    } catch {
      return value;
    }
  };

  const entryColumns = [
    {
      title: "SL No.",
      key: "sl",
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Completed Qty",
      dataIndex: "completed_qty",
      key: "completed_qty",
      width: 140,
      render: (value) => (Number(value) || 0).toLocaleString("en-IN"),
    },
    {
      title: "Shift",
      dataIndex: "work_shift",
      key: "work_shift",
      width: 120,
      render: (value) => {
        const label = parseShiftLabel(value);
        if (label === "—") return label;
        return <span className="text-capitalize">{label}</span>;
      },
    },
    {
      title: "Responsible Person",
      dataIndex: "responsible_staff",
      key: "responsible_staff",
      ellipsis: true,
      render: (value) => value || "—",
    },
    {
      title: "Logged By",
      key: "logged_by",
      width: 160,
      ellipsis: true,
      render: (_, record) => record?.user?.name || "—",
    },
    {
      title: "Logged At",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (value) => (value ? dayjs(value).format("DD/MM/YYYY hh:mm A") : "—"),
    },
  ];

  const confirmDelete = async () => {
    if (!deleteTarget?.id || deleting) return;
    setDeleting(true);
    try {
      const res = await PrivateAxios.delete(`/production/planning/delete/${deleteTarget.id}`);
      SuccessMessage(res?.data?.message || "Production planning deleted successfully");
      setDeleteTarget(null);

      // If the deleted row was the last one on this page, step back a page
      const remaining = totalCount - 1;
      const lastPageStart = Math.max(0, (Math.ceil(remaining / pageState.take) - 1) * pageState.take);
      const nextPage = pageState.skip > lastPageStart ? { ...pageState, skip: lastPageStart } : pageState;
      setPageState(nextPage);
      fetchPlannings(nextPage);
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to delete production planning.");
    } finally {
      setDeleting(false);
    }
  };

  const renderProduct = (_, record) => {
    const name = record?.product?.product_name || "N/A";
    const code = record?.product?.product_code;
    const variant = record?.finalProductVariant;
    const variantLabel = variant?.weight_per_unit
      ? `${variant.weight_per_unit} ${variant?.masterUOM?.label || ""}`.trim()
      : "";

    return (
      <div>
        <div className="fw-semibold">{name}{code ? ` (${code})` : ""}</div>
        {variantLabel && (
          <div className="text-muted" style={{ fontSize: 12 }}>Variant: {variantLabel}</div>
        )}
      </div>
    );
  };

  const columns = [
    {
      title: "SL No.",
      key: "sl",
      width: 80,
      render: (_, __, index) => pageState.skip + index + 1,
    },
    {
      title: "Work Order No.",
      dataIndex: "wo_number",
      key: "wo_number",
      width: 180,
      render: (value) => <span className="fw-semibold">{value || "N/A"}</span>,
    },
    {
      title: "Product",
      key: "product",
      width: 240,
      render: renderProduct,
    },
    {
      title: "Required Quantity",
      dataIndex: "required_qty",
      key: "required_qty",
      width: 160,
      // align: "right",
      render: (value) => (Number(value) || 0).toLocaleString("en-IN"),
    },
    {
      title: "Planned Quantity",
      dataIndex: "planned_qty",
      key: "planned_qty",
      width: 160,
      // align: "right",
      render: (value) => (Number(value) || 0).toLocaleString("en-IN"),
    },
    {
      title: "Process Step",
      dataIndex: "process_step",
      key: "process_step",
      width: 180,
      ellipsis: true,
      render: (value) => value || "—",
    },
    {
      title: "Responsible Person",
      key: "responsible_staff",
      width: 180,
      ellipsis: true,
      render: (_, record) => {
        const value = record?.responsible_staff;
        if (!value) return "—";
        if (typeof value === "string") return value;
        if (Array.isArray(value)) {
          return value.map((v) => v?.name || v).filter(Boolean).join(", ") || "—";
        }
        return value?.name || "—";
      },
    },
    {
      title: "Plan Duration",
      key: "plan_duration",
      width: 220,
      ellipsis: true,
      render: (_, record) => {
        const start = record?.planned_start_date
          ? dayjs(record.planned_start_date).format("DD/MM/YYYY")
          : null;
        const end = record?.planned_end_date
          ? dayjs(record.planned_end_date).format("DD/MM/YYYY")
          : null;
        if (!start && !end) return "—";
        return `${start || "—"} → ${end || "—"}`;
      },
    },
    {
      title: "Created By",
      key: "created_by",
      width: 160,
      ellipsis: true,
      render: (_, record) => record?.createdBy?.name || "—",
    },
    {
      title: "Action",
      key: "action",
      width: 160,
      fixed: "right",
      align: "center",
      onCell: () => ({ style: { background: "#fff" } }),
      onHeaderCell: () => ({ style: { background: "#fafafa" } }),
      render: (_, record) => (
        <div className="d-flex justify-content-center gap-1">
          <Tooltip title="View Entries">
            <Button
              type="text"
              icon={<UnorderedListOutlined />}
              onClick={() => openEntriesModal(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/production/planning-edit/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => setDeleteTarget(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <style>{`
        .entry-form-select.ant-select .ant-select-selector {
          height: 38px !important;
          min-height: 38px !important;
          padding: 0 11px !important;
          display: flex !important;
          align-items: center !important;
        }
        .entry-form-select.ant-select .ant-select-selection-item,
        .entry-form-select.ant-select .ant-select-selection-placeholder {
          line-height: 30px !important;
          display: flex !important;
          align-items: center !important;
        }
        .entry-form-select.ant-select .ant-select-selection-search,
        .entry-form-select.ant-select .ant-select-selection-search-input {
          height: 30px !important;
          line-height: 30px !important;
        }
      `}</style>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h3 className="mb-0">Production Planning</h3>
          <p className="text-muted mb-0">{totalCount} total records</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Input
            placeholder="Search by Work Order No."
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            allowClear
            value={search}
            onChange={(e) => {
              const next = e.target.value;
              setSearch(next);
              if (next === "" && search !== "") {
                handleSearch("");
              }
            }}
            onPressEnter={(e) => handleSearch(e.target.value)}
            onBlur={(e) => handleSearch(e.target.value)}
            style={{ width: 280 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/production/planning-create")}
          >
            Create Planning
          </Button>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <Table
            rowKey="id"
            loading={listLoading}
            dataSource={rows}
            columns={columns}
            onChange={handleTableChange}
            pagination={{
              current: pageState.skip / pageState.take + 1,
              pageSize: pageState.take,
              total: totalCount,
              showSizeChanger: true,
              pageSizeOptions: ["10", "15", "25", "50"],
            }}
            scroll={{ x: 1800 }}
            locale={{ emptyText: "No production plannings found." }}
          />
        </div>
      </div>

      <DeleteModal
        show={Boolean(deleteTarget)}
        handleClose={() => (deleting ? null : setDeleteTarget(null))}
        onDelete={confirmDelete}
        title="Delete Production Planning"
        message={
          deleteTarget
            ? `Are you sure you want to delete production planning "${deleteTarget.wo_number || ""}"?`
            : "Are you sure you want to delete this production planning?"
        }
      />

      <Modal
        open={Boolean(entriesTarget)}
        onCancel={closeEntriesModal}
        title={
          entriesTarget
            ? `Production Entries — ${entriesTarget.wo_number || ""}`
            : "Production Entries"
        }
        footer={[
          <Button key="close" onClick={closeEntriesModal} disabled={savingEntry}>
            Close
          </Button>,
        ]}
        width={900}
        destroyOnHidden
      >
        <div
          className="p-3 mb-3"
          style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8 }}
        >
          <div className="fw-semibold mb-2">Add New Entry</div>
          <div className="row g-2">
            <div className="col-md-3">
              <label className="form-label mb-1" style={{ fontSize: 12 }}>
                Completed Qty <span className="text-danger">*</span>
              </label>
              <Input
                size="middle"
                type="number"
                min={0}
                value={entryForm.completed_qty ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  updateEntryField("completed_qty", raw === "" ? null : Number(raw));
                }}
                placeholder="0"
              />
              {entryErrors.completed_qty && (
                <div className="text-danger" style={{ fontSize: 12, marginTop: 2 }}>
                  {entryErrors.completed_qty}
                </div>
              )}
            </div>
            <div className="col-md-3">
              <label className="form-label mb-1" style={{ fontSize: 12 }}>
                Shift <span className="text-danger">*</span>
              </label>
              <Select
                size="middle"
                value={entryForm.work_shift}
                onChange={(value) => updateEntryField("work_shift", value)}
                options={[
                  { value: "day", label: "Day" },
                  { value: "evening", label: "Evening" },
                  { value: "night", label: "Night" },
                ]}
                placeholder="Select shift"
                className="entry-form-select"
                style={{ width: "100%" }}
                allowClear
              />
              {entryErrors.work_shift && (
                <div className="text-danger" style={{ fontSize: 12, marginTop: 2 }}>
                  {entryErrors.work_shift}
                </div>
              )}
            </div>
            <div className="col-md-4">
              <label className="form-label mb-1" style={{ fontSize: 12 }}>
                Responsible Person <span className="text-danger">*</span>
              </label>
              <Input
                size="middle"
                value={entryForm.responsible_staff}
                onChange={(e) => updateEntryField("responsible_staff", e.target.value)}
                placeholder="e.g. Sri Prasant Roy"
              />
              {entryErrors.responsible_staff && (
                <div className="text-danger" style={{ fontSize: 12, marginTop: 2 }}>
                  {entryErrors.responsible_staff}
                </div>
              )}
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <Button
                type="primary"
                loading={savingEntry}
                onClick={submitEntry}
                style={{ width: "100%" }}
              >
                Add Entry
              </Button>
            </div>
          </div>
        </div>

        <Table
          rowKey="id"
          size="small"
          loading={entriesLoading}
          dataSource={entries}
          columns={entryColumns}
          pagination={false}
          scroll={{ x: 760, y: 400 }}
          locale={{ emptyText: "No production entries logged yet." }}
        />
      </Modal>
    </div>
  );
}

export default ProductionPlanningList;
