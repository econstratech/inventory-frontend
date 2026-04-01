import React, { useEffect, useMemo, useState } from "react";
import { Button, DatePicker, Input, Modal, Progress, Table, Tooltip } from "antd";
import dayjs from "dayjs";
import CustomerSelect from "../../filterComponents/CustomerSelect";
import ProductSelect from "../../filterComponents/ProductSelect";
import { UserAuth } from "../../auth/Auth";
import { PrivateAxios } from "../../../environment/AxiosInstance";
import { ErrorMessage, SuccessMessage } from "../../../environment/ToastMessage";

function WorkOrders() {
  const { user } = UserAuth();
  const companyId = user?.company_id ?? user?.company?.id ?? null;

  const [rows, setRows] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [pageState, setPageState] = useState({ skip: 0, take: 15 });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [flowSteps, setFlowSteps] = useState([]);
  const [loadingFlow, setLoadingFlow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    customer: null,
    finishedGoodId: null,
    finishedGoodData: null,
    quantity: "",
    workOrderStepIds: [],
    dueDate: null,
  });

  const selectedWorkOrderSteps = useMemo(() => {
    const flowMap = new Map(
      flowSteps.map((f) => [String(f.step_id), f?.step?.name || `Step ${f.step_id}`])
    );
    return (formData.workOrderStepIds || []).map((id) => ({
      id,
      name: flowMap.get(String(id)) || `Step ${id}`,
    }));
  }, [flowSteps, formData.workOrderStepIds]);

  const fetchCompanyFlow = async () => {
    if (!companyId) return;
    setLoadingFlow(true);
    try {
      const res = await PrivateAxios.get(`/company/get-company-production-flow/${companyId}`);
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      const ordered = data.slice().sort((a, b) => Number(a.sequence) - Number(b.sequence));
      setFlowSteps(ordered);
    } catch (error) {
      setFlowSteps([]);
      ErrorMessage(error?.response?.data?.message || "Failed to fetch company production flow.");
    } finally {
      setLoadingFlow(false);
    }
  };

  useEffect(() => {
    fetchCompanyFlow();
  }, [companyId]);

  const mapWorkOrderRows = (list = []) =>
    (Array.isArray(list) ? list : []).map((item) => {
      const finishedGoodName =
        item?.finishedGood?.product_name ||
        item?.product?.product_name ||
        item?.finished_good_name ||
        "N/A";
      const finishedGoodCode =
        item?.finishedGood?.product_code ||
        item?.product?.product_code ||
        item?.finished_good_code ||
        "";

      return {
        id: item?.id,
        orderId: item?.wo_number ?? "N/A",
        createdAt: item?.created_at ? dayjs(item.created_at).format("DD MMM YYYY hh:mm a") : "N/A",
        customer:
          item?.customer?.name ||
          item?.customer_name ||
          item?.customer?.label ||
          "N/A",
        finishedGood: `${finishedGoodName}${finishedGoodCode ? ` (${finishedGoodCode})` : ""}`,
        qty: Number(item?.planned_qty) || 0,
        statusLabel:
          item?.productionStep?.name ||
          "Pending",
        progress: Number(item?.progress_percentage) || 0,
        processFlow: Array.isArray(item?.process_flow)
          ? item.process_flow.map((p) => p?.name || p).filter(Boolean)
          : [],
        materialProgress: Number(item?.material_progress_percentage) || 0,
        dueDate: item?.due_date ? dayjs(item.due_date).format("DD/MM/YYYY") : "N/A",
      };
    });

  const fetchWorkOrders = async (customPageState = null) => {
    const currentPageState = customPageState || pageState;
    setListLoading(true);
    try {
      const page = currentPageState.skip / currentPageState.take + 1;
      const res = await PrivateAxios.get(
        `/production/work-order/list?page=${page}&limit=${currentPageState.take}`
      );
      const payload = res.data?.data ?? res.data ?? {};
      const list = Array.isArray(payload?.rows)
        ? payload.rows
        : Array.isArray(payload)
          ? payload
          : [];
      const pagination = payload?.pagination || {};
      setRows(mapWorkOrderRows(list));
      setTotalCount(Number(pagination?.total_records) || list.length || 0);
    } catch (error) {
      setRows([]);
      setTotalCount(0);
      ErrorMessage(error?.response?.data?.message || "Failed to fetch work orders.");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders(pageState);
  }, [pageState.skip, pageState.take]);

  const openAddModal = () => {
    setFormData({
      customer: null,
      finishedGoodId: null,
      finishedGoodData: null,
      quantity: "",
      workOrderStepIds: flowSteps.map((item) => item.step_id),
      dueDate: null,
    });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleStepToggle = (stepId) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.workOrderStepIds) ? prev.workOrderStepIds : [];
      const exists = current.some((id) => String(id) === String(stepId));
      const nextIds = exists
        ? current.filter((id) => String(id) !== String(stepId))
        : [...current, stepId];

      return {
        ...prev,
        workOrderStepIds: nextIds,
      };
    });
  };

  const handleSave = async () => {
    if (!formData.customer) {
      ErrorMessage("Customer is required.");
      return;
    }
    if (!formData.finishedGoodId) {
      ErrorMessage("Finished Good is required.");
      return;
    }
    const qty = Number(formData.quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      ErrorMessage("Quantity must be a positive number.");
      return;
    }
    if (!formData.workOrderStepIds || formData.workOrderStepIds.length === 0) {
      ErrorMessage("Please select work order steps in sequence.");
      return;
    }
    if (!formData.dueDate) {
      ErrorMessage("Due Date is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        customer_id: formData.customer?.id ?? formData.customer?.value,
        product_id: formData.finishedGoodId,
        planned_qty: qty,
        due_date: dayjs(formData.dueDate).format("YYYY-MM-DD"),
        production_step_id: formData.workOrderStepIds[0],
        work_order_steps: formData.workOrderStepIds.map((id, index) => ({
          step_id: id,
          sequence: index + 1,
        })),
      };

      const res = await PrivateAxios.post("/production/work-order/create", payload);
      SuccessMessage(res?.data?.message || "Work order created successfully.");
      const resetPageState = { skip: 0, take: pageState.take || 15 };
      setPageState(resetPageState);
      fetchWorkOrders(resetPageState);
      closeAddModal();
    } catch (error) {
      ErrorMessage(error?.response?.data?.message || "Failed to create work order.");
    } finally {
      setSaving(false);
    }
  };

  const handlePageChange = (page, pageSize) => {
    setPageState({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  };

  const renderStatus = (status) => {
    const key = String(status || "").toLowerCase().trim();
    const statusStyles = {
      pending: "badge-outline-warning",
      printing: "badge-outline-accent",
      lamination: "badge-outline-active",
      cutting: "badge-outline-quotation",
      packing: "badge-outline-green",
      "quality testing": "badge-outline-meantGreen",
      "in production": "badge-outline-yellowGreen",
      completed: "badge-outline-success",
      cancelled: "badge-outline-danger",
      canceled: "badge-outline-danger",
    };
    const badgeClass = statusStyles[key] || "badge-outline-accent";

    return (
      <label className={`badge ${badgeClass} mb-0`}>
        <i className="fas fa-circle f-s-8 d-flex me-1"></i>
        {status}
      </label>
    );
  };

  const columns = [
    { title: "Order ID", dataIndex: "orderId", key: "orderId", width: 130 },
    { title: "Created", dataIndex: "createdAt", key: "createdAt", width: 150 },
    { title: "Customer", dataIndex: "customer", key: "customer", width: 190 },
    { title: "Finished Good", dataIndex: "finishedGood", key: "finishedGood", width: 220 },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
      width: 110,
      render: (v) => new Intl.NumberFormat("en-IN").format(Number(v) || 0),
    },
    {
      title: "Status",
      dataIndex: "statusLabel",
      key: "statusLabel",
      width: 120,
      render: renderStatus,
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      width: 150,
      render: (value) => (
        <div className="d-flex align-items-center gap-2">
          <Progress percent={Number(value) || 0} showInfo={false} style={{ width: 80 }} />
          <span className="small text-muted">{Number(value) || 0}%</span>
        </div>
      ),
    },
    {
      title: "Process Flow",
      dataIndex: "processFlow",
      key: "processFlow",
      width: 250,
      render: (flow = []) => (
        <div className="d-flex flex-wrap gap-1">
          {flow.map((name, idx) => (
            <span key={`${name}-${idx}`} className="badge bg-primary-subtle text-primary-emphasis">
              {name}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: "Material",
      dataIndex: "materialProgress",
      key: "materialProgress",
      width: 120,
      render: (value) => (
        <div className="d-flex align-items-center gap-2">
          <Progress percent={Number(value) || 0} showInfo={false} style={{ width: 70 }} />
          <span className="small text-muted">{Number(value) || 0}%</span>
        </div>
      ),
    },
    { title: "Due Date", dataIndex: "dueDate", key: "dueDate", width: 120 },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: () => (
        <div className="d-flex gap-2">
          <Tooltip title="View"><i className="far fa-eye text-primary"></i></Tooltip>
          <Tooltip title="Edit"><i className="far fa-edit text-success"></i></Tooltip>
          <Tooltip title="Delete"><i className="far fa-trash-alt text-danger"></i></Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">Work Orders</h3>
          <p className="text-muted mb-0">Production work order management with material tracking</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openAddModal}>
          <i className="fas fa-plus me-2"></i>
          Add Work Order
        </button>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="p-3 d-flex justify-content-between align-items-center border-bottom">
            <h6 className="mb-0">Work Orders</h6>
            <small className="text-muted">{totalCount} items</small>
          </div>
          <div className="bg_succes_table_head rounded_table">
            <Table
              rowKey="id"
              columns={columns}
              dataSource={rows}
              loading={listLoading}
              pagination={{
                current: pageState.skip / pageState.take + 1,
                pageSize: pageState.take,
                total: totalCount,
                showSizeChanger: true,
                pageSizeOptions: ["10", "15", "25", "50"],
                onChange: handlePageChange,
                onShowSizeChange: handlePageChange,
              }}
              scroll={{ x: 1600 }}
            />
          </div>
        </div>
      </div>

      <Modal
        title={<span className="fw-semibold">Add Work Order</span>}
        open={isAddModalOpen}
        onCancel={closeAddModal}
        footer={[
          <Button key="cancel" onClick={closeAddModal}>
            Cancel
          </Button>,
          <Button key="save" type="primary" loading={saving} onClick={handleSave}>
            Save
          </Button>,
        ]}
        width={980}
      >
        <div className="row g-3 pt-2">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Customer <span className="text-danger">*</span></label>
            <CustomerSelect
              value={formData.customer}
              onChange={(option) => setFormData((prev) => ({ ...prev, customer: option || null }))}
              placeholder="Select Customer"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Finished Good <span className="text-danger">*</span></label>
            <ProductSelect
              value={formData.finishedGoodId}
              selectedProductData={formData.finishedGoodData}
              onChange={(option) =>
                setFormData((prev) => ({
                  ...prev,
                  finishedGoodId: option ? option.value : null,
                  finishedGoodData: option?.productData || null,
                }))
              }
              placeholder="Select Finished Good"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Quantity <span className="text-danger">*</span></label>
            <Input
              type="number"
              min={0}
              value={formData.quantity}
              onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
              placeholder="Enter quantity"
              style={{ height: "42px" }}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Due Date <span className="text-danger">*</span></label>
            <DatePicker
              value={formData.dueDate}
              onChange={(date) => setFormData((prev) => ({ ...prev, dueDate: date }))}
              format="DD/MM/YYYY"
              placeholder="dd/mm/yyyy"
              style={{ width: "100%", height: "42px" }}
            />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold">Work Order Steps (in sequence) <span className="text-danger">*</span></label>
            <div className="row g-2">
              {flowSteps.map((flowItem) => {
                const stepId = flowItem.step_id;
                const stepName = flowItem?.step?.name || `Step ${stepId}`;
                const selectedIndex = (formData.workOrderStepIds || []).findIndex(
                  (id) => String(id) === String(stepId)
                );
                const isSelected = selectedIndex >= 0;
                return (
                  <div className="col-12 col-md-4" key={flowItem.id || stepId}>
                    <button
                      type="button"
                      className="w-100 text-start"
                      onClick={() => handleStepToggle(stepId)}
                      style={{
                        border: isSelected ? "2px solid #2577ff" : "1px solid #d9dee7",
                        background: isSelected ? "#eef4ff" : "#f8f9fb",
                        borderRadius: 10,
                        padding: "10px 12px",
                      }}
                    >
                      <span
                        className="d-inline-flex align-items-center justify-content-center me-2"
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "999px",
                          background: isSelected ? "#2f76e9" : "#eceff4",
                          color: isSelected ? "#fff" : "#7f8a9a",
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        {isSelected ? selectedIndex + 1 : "—"}
                      </span>
                      <span className="fw-semibold">{stepName}</span>
                    </button>
                  </div>
                );
              })}
            </div>
            {selectedWorkOrderSteps.length > 0 && (
              <div className="mt-2 small text-muted">
                Sequence:{" "}
                {selectedWorkOrderSteps.map((s, idx) => `${idx + 1}. ${s.name}`).join(" > ")}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default WorkOrders;