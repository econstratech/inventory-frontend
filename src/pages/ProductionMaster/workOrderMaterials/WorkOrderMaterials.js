import React, { useEffect, useState } from "react";
import { Button, Input, Modal, Select, Table } from "antd";
import {
  DeleteOutlined,
  DownloadOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { PrivateAxios, PrivateAxiosFile } from "../../../environment/AxiosInstance";
import { ErrorMessage, SuccessMessage } from "../../../environment/ToastMessage";
import { UserAuth } from "../../auth/Auth";
import ProductSelect from "../../filterComponents/ProductSelect";
import DeleteModal from "../../CommonComponent/DeleteModal";

let ROW_KEY_SEQ = 0;
const makeEmptyRow = () => ({
  key: `row-${Date.now()}-${++ROW_KEY_SEQ}`,
  fgProductId: null,
  fgProductData: null,
  fgVariantId: null,
  fgVariants: [],
  fgVariantsLoading: false,
  rmProductId: null,
  rmProductData: null,
});

function WorkOrderMaterials() {
  const { isVariantBased } = UserAuth();
  const [rows, setRows] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [pageState, setPageState] = useState({ skip: 0, take: 10 });
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formRows, setFormRows] = useState([makeEmptyRow()]);
  const [saving, setSaving] = useState(false);

  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);

  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const patchRow = (key, patch) =>
    setFormRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r))
    );

  const fetchFgVariantsForRow = async (rowKey, productId) => {
    if (!productId || !isVariantBased) {
      patchRow(rowKey, { fgVariants: [], fgVariantsLoading: false });
      return;
    }
    patchRow(rowKey, { fgVariantsLoading: true });
    try {
      const res = await PrivateAxios.get(`/product/variants/${productId}`);
      const variants = Array.isArray(res.data?.data?.variants)
        ? res.data.data.variants
        : [];
      const options = variants.map((v) => {
        const uomLabel = v?.masterUOM?.label || v?.masterUOM?.name || "";
        const label = `${v?.weight_per_unit ?? ""} ${uomLabel}`.trim();
        return { value: v.id, label: label || `Variant #${v.id}` };
      });
      patchRow(rowKey, { fgVariants: options, fgVariantsLoading: false });
    } catch (error) {
      patchRow(rowKey, { fgVariants: [], fgVariantsLoading: false });
      ErrorMessage(
        error?.response?.data?.message ||
          "Failed to fetch finished good variants."
      );
    }
  };

  const addFormRow = () => setFormRows((prev) => [...prev, makeEmptyRow()]);
  const removeFormRow = (key) =>
    setFormRows((prev) =>
      prev.length > 1 ? prev.filter((r) => r.key !== key) : prev
    );

  const openCreateModal = () => {
    setFormRows([makeEmptyRow()]);
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    if (saving) return;
    setIsCreateOpen(false);
    setFormRows([makeEmptyRow()]);
  };

  const handleCreate = async () => {
    for (let i = 0; i < formRows.length; i++) {
      const row = formRows[i];
      const label = `Row ${i + 1}`;
      if (!row.fgProductId) {
        ErrorMessage(`${label}: Finished Good is required.`);
        return;
      }
      if (isVariantBased && !row.fgVariantId) {
        ErrorMessage(`${label}: Finished Good Variant is required.`);
        return;
      }
      if (!row.rmProductId) {
        ErrorMessage(`${label}: Raw Material is required.`);
        return;
      }
    }

    // Client-side duplicate guard within the submitted rows.
    const seen = new Set();
    for (let i = 0; i < formRows.length; i++) {
      const row = formRows[i];
      const variantKey = isVariantBased ? row.fgVariantId ?? "null" : "null";
      const key = `${row.fgProductId}|${variantKey}|${row.rmProductId}`;
      if (seen.has(key)) {
        ErrorMessage(`Row ${i + 1}: Duplicate mapping within this form.`);
        return;
      }
      seen.add(key);
    }

    setSaving(true);
    try {
      const payload = formRows.map((row) => ({
        fg_product_id: row.fgProductId,
        fg_product_variant_id: isVariantBased ? row.fgVariantId : null,
        rm_product_id: row.rmProductId,
      }));
      const res = await PrivateAxios.post(
        "/production/work-order/material-mapping/create",
        payload
      );
      SuccessMessage(
        res?.data?.message || "Material mappings created successfully."
      );
      setIsCreateOpen(false);
      setFormRows([makeEmptyRow()]);
      const next = { skip: 0, take: pageState.take };
      setPageState(next);
      fetchMappings(next);
    } catch (error) {
      ErrorMessage(
        error?.response?.data?.message || "Failed to create material mapping."
      );
    } finally {
      setSaving(false);
    }
  };

  const openBulkModal = () => {
    setBulkFile(null);
    setIsBulkOpen(true);
  };

  const closeBulkModal = () => {
    if (bulkUploading) return;
    setIsBulkOpen(false);
    setBulkFile(null);
  };

  const downloadSampleCsv = () => {
    const headers = "FG Product,FG Variant,RM Product";
    const sampleRows = [
      "Finished Steel Rod,12mm,Iron Ore",
      "Finished Steel Rod,,Carbon",
      "Aluminium Sheet,5mm,Aluminium Ingot",
    ].join("\n");
    const csvContent = `${headers}\n${sampleRows}\n`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "work-order-material-mapping-sample.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      ErrorMessage("Please select a CSV file first.");
      return;
    }
    setBulkUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", bulkFile);
      const res = await PrivateAxiosFile.post(
        "/production/work-order/material-mapping/bulk-upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      SuccessMessage(res?.data?.message || "Bulk upload completed.");
      const skipped = Array.isArray(res?.data?.errors) ? res.data.errors.length : 0;
      if (skipped > 0) {
        ErrorMessage(
          `${skipped} row${skipped > 1 ? "s" : ""} skipped (missing/duplicate/unknown product). Check your file.`
        );
      }
      setIsBulkOpen(false);
      setBulkFile(null);
      const next = { skip: 0, take: pageState.take };
      setPageState(next);
      fetchMappings(next);
    } catch (error) {
      ErrorMessage(
        error?.response?.data?.message || "Failed to upload material mappings."
      );
    } finally {
      setBulkUploading(false);
    }
  };

  const openDeleteModal = (record) => {
    setDeleteTarget(record || null);
    setDeleteModalShow(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteModalShow(false);
    setDeleteTarget(null);
  };

  const handleDeleteMapping = async () => {
    const id = deleteTarget?.id;
    if (!id) return;
    setDeleting(true);
    try {
      const res = await PrivateAxios.delete(
        `/production/work-order/material-mapping/delete/${id}`
      );
      SuccessMessage(
        res?.data?.message || "Material mapping deleted successfully."
      );
      setDeleteModalShow(false);
      setDeleteTarget(null);
      fetchMappings();
    } catch (error) {
      ErrorMessage(
        error?.response?.data?.message || "Failed to delete material mapping."
      );
    } finally {
      setDeleting(false);
    }
  };

  const fetchMappings = async (customPageState = null, customSearch = null) => {
    const currentPageState = customPageState || pageState;
    const currentSearch = customSearch !== null ? customSearch : appliedSearch;

    setListLoading(true);
    try {
      const page = currentPageState.skip / currentPageState.take + 1;
      const query = new URLSearchParams({
        page: String(page),
        limit: String(currentPageState.take),
      });
      if (currentSearch.trim()) query.append("search", currentSearch.trim());

      const res = await PrivateAxios.get(
        `/production/work-order/material-mapping/list?${query.toString()}`
      );
      const data = res.data?.data || {};
      setRows(Array.isArray(data.rows) ? data.rows : []);
      setTotalCount(Number(data?.pagination?.total_records) || 0);
    } catch (error) {
      setRows([]);
      setTotalCount(0);
      ErrorMessage(
        error?.response?.data?.message || "Failed to fetch raw materials."
      );
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTableChange = (pagination) => {
    const next = {
      skip: (pagination.current - 1) * pagination.pageSize,
      take: pagination.pageSize,
    };
    setPageState(next);
    fetchMappings(next);
  };

  const handleApplySearch = () => {
    const next = { skip: 0, take: pageState.take };
    setPageState(next);
    setAppliedSearch(searchInput);
    fetchMappings(next, searchInput);
  };

  const handleResetSearch = () => {
    const next = { skip: 0, take: pageState.take };
    setSearchInput("");
    setAppliedSearch("");
    setPageState(next);
    fetchMappings(next, "");
  };

  const renderProduct = (product) => {
    if (!product) return <span className="text-muted">—</span>;
    return (
      <div>
        <div className="fw-semibold">{product.product_name || "N/A"}</div>
        {product.product_code && (
          <div className="text-muted" style={{ fontSize: 12 }}>
            {product.product_code}
          </div>
        )}
      </div>
    );
  };

  const renderVariant = (variant) => {
    if (!variant) return <span className="text-muted">—</span>;
    const label = variant?.masterUOM?.label || "";
    return (
      <span>
        {variant.weight_per_unit ?? ""} {label}
      </span>
    );
  };

  const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      render: (_, __, i) => pageState.skip + i + 1,
    },
    {
      title: "Finished Good",
      dataIndex: "fgProduct",
      key: "fgProduct",
      render: renderProduct,
    },
    {
      title: "Variant",
      dataIndex: "fgProductVariant",
      key: "fgProductVariant",
      width: 140,
      render: renderVariant,
    },
    {
      title: "Raw Material",
      dataIndex: "rmProduct",
      key: "rmProduct",
      render: renderProduct,
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: 160,
      render: (value) => (value ? dayjs(value).format("DD/MM/YYYY") : "—"),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record) => (
        <button
          type="button"
          className="border-0"
          title="Delete"
          onClick={() => openDeleteModal(record)}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#fff1f2",
            color: "#ef4444",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i className="far fa-trash-alt" style={{ fontSize: 13 }} />
        </button>
      ),
    },
  ];

  const currentPage = pageState.skip / pageState.take + 1;

  return (
    <div className="p-4">
      <style>{`
        .filter-pill-input.ant-input-affix-wrapper,
        .filter-pill-input.ant-input {
          border-radius: 22px !important;
          padding: 6px 14px !important;
          min-height: 38px !important;
        }
        .filter-pill-input.ant-input-affix-wrapper > .ant-input {
          border-radius: 0 !important;
          padding: 0 !important;
          min-height: unset !important;
        }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h3 className="mb-0">Raw Materials</h3>
          <p className="text-muted mb-0">{totalCount} total records</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button icon={<UploadOutlined />} onClick={openBulkModal}>
            Bulk Upload
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Add Material
          </Button>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-6">
              <label
                className="form-label mb-1"
                style={{ fontSize: 12, fontWeight: 500 }}
              >
                Search
              </label>
              <Input
                className="filter-pill-input"
                placeholder="Search by finished good or raw material name / code"
                prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                allowClear
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onPressEnter={handleApplySearch}
              />
            </div>
            <div className="col-md-3 d-flex gap-2">
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleApplySearch}
                style={{ flex: 1 }}
              >
                Apply
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleResetSearch}
                title="Reset"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <Table
            rowKey="id"
            loading={listLoading}
            dataSource={rows}
            columns={columns}
            pagination={{
              current: currentPage,
              pageSize: pageState.take,
              total: totalCount,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            onChange={handleTableChange}
            locale={{ emptyText: "No raw materials found." }}
          />
        </div>
      </div>

      <Modal
        title={<span className="fw-semibold">Add Raw Material</span>}
        open={isCreateOpen}
        onCancel={closeCreateModal}
        footer={[
          <Button key="cancel" onClick={closeCreateModal} disabled={saving}>
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={saving}
            onClick={handleCreate}
          >
            Save
          </Button>,
        ]}
        width={820}
        destroyOnClose
      >
        <div className="pt-2">
          {formRows.map((row, index) => (
            <div
              key={row.key}
              className="p-3 mb-3"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                background: "#fafafa",
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold text-muted">
                  Row {index + 1}
                </span>
                {formRows.length > 1 && (
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeFormRow(row.key)}
                    disabled={saving}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Finished Good <span className="text-danger">*</span>
                  </label>
                  <ProductSelect
                    value={row.fgProductId}
                    selectedProductData={row.fgProductData}
                    onChange={(option) => {
                      const nextId = option ? option.value : null;
                      patchRow(row.key, {
                        fgProductId: nextId,
                        fgProductData: option?.productData || null,
                        fgVariantId: null,
                        fgVariants: [],
                      });
                      if (nextId) fetchFgVariantsForRow(row.key, nextId);
                    }}
                    placeholder="Select Finished Good"
                  />
                </div>
                {isVariantBased && (
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Finished Good Variant{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <Select
                      value={row.fgVariantId}
                      onChange={(value) =>
                        patchRow(row.key, { fgVariantId: value })
                      }
                      options={row.fgVariants}
                      placeholder={
                        row.fgProductId
                          ? "Select Finished Good Variant"
                          : "Select Finished Good first"
                      }
                      loading={row.fgVariantsLoading}
                      disabled={!row.fgProductId}
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      size="large"
                      style={{ width: "100%" }}
                    />
                  </div>
                )}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Raw Material <span className="text-danger">*</span>
                  </label>
                  <ProductSelect
                    value={row.rmProductId}
                    selectedProductData={row.rmProductData}
                    onChange={(option) =>
                      patchRow(row.key, {
                        rmProductId: option ? option.value : null,
                        rmProductData: option?.productData || null,
                      })
                    }
                    placeholder="Select Raw Material"
                  />
                </div>
              </div>
            </div>
          ))}
          <div>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addFormRow}
              disabled={saving}
              block
            >
              Add More
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        title={<span className="fw-semibold">Bulk Upload Raw Materials</span>}
        open={isBulkOpen}
        onCancel={closeBulkModal}
        footer={[
          <Button
            key="cancel"
            onClick={closeBulkModal}
            disabled={bulkUploading}
          >
            Cancel
          </Button>,
          <Button
            key="upload"
            type="primary"
            icon={<UploadOutlined />}
            loading={bulkUploading}
            onClick={handleBulkUpload}
            disabled={!bulkFile}
          >
            Upload
          </Button>,
        ]}
        width={560}
        destroyOnClose
      >
        <div className="pt-2">
          <p className="text-muted mb-2">
            Upload a CSV file with the columns:{" "}
            <code>FG Product</code>, <code>FG Variant</code> (optional), and{" "}
            <code>RM Product</code>. Products are matched by name within your
            company.
          </p>
          <div className="mb-3">
            <Button
              type="link"
              icon={<DownloadOutlined />}
              onClick={downloadSampleCsv}
              style={{ paddingLeft: 0 }}
            >
              Download sample CSV
            </Button>
          </div>
          <label className="form-label fw-semibold">
            CSV File <span className="text-danger">*</span>
          </label>
          <input
            type="file"
            accept=".csv"
            className="form-control"
            onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
            disabled={bulkUploading}
          />
          {bulkFile && (
            <div className="text-muted mt-2" style={{ fontSize: 12 }}>
              Selected: <strong>{bulkFile.name}</strong>
            </div>
          )}
        </div>
      </Modal>

      <DeleteModal
        show={deleteModalShow}
        handleClose={closeDeleteModal}
        onDelete={handleDeleteMapping}
        title="Delete Material Mapping"
        message={
          deleteTarget
            ? `Are you sure you want to delete the mapping for "${
                deleteTarget?.fgProduct?.product_name || "finished good"
              }" → "${
                deleteTarget?.rmProduct?.product_name || "raw material"
              }"? Once deleted, it cannot be recovered.`
            : "Are you sure you want to delete this mapping? Once deleted, it cannot be recovered."
        }
      />
    </div>
  );
}

export default WorkOrderMaterials;
