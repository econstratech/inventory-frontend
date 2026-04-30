import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Table as AntTable } from "antd";
import { PrivateAxios } from "../../environment/AxiosInstance";
import SettingsPageTopBar from "./SettingsPageTopBar";
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import { Tooltip } from "antd";

const PermissionsManager = ({ roleId }) => {
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [newPermissionName, setNewPermissionName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editDataItem, setEditDataItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [pageState, setPageState] = useState({ page: 1, limit: 10 });
  const [totalRecords, setTotalRecords] = useState(0);
  const [moduleFilterId, setModuleFilterId] = useState("");

  const fetchRolePermissions = async () => {
    try {
      const response = await PrivateAxios.get("/module/all-modules");
      setModules(response.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch modules", error);
    }
  };

  useEffect(() => {
    fetchRolePermissions();
  }, []);

  useEffect(() => {
    fetchPermissions(pageState, moduleFilterId);
  }, [pageState.page, pageState.limit, moduleFilterId]);

  const fetchPermissions = async (customPageState, customModuleFilter) => {
    setLoading(true);
    try {
      const { page, limit } = customPageState || pageState;
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const filterModule = customModuleFilter !== undefined ? customModuleFilter : moduleFilterId;
      if (filterModule) params.set("module_id", String(filterModule));
      const res = await PrivateAxios.get(`/get-all-permissions?${params.toString()}`);
      const apiData = res.data?.data;
      const rows = apiData?.rows ?? [];
      const pagination = apiData?.pagination ?? {};
      if (Array.isArray(rows)) {
        const startingIndex = (page - 1) * limit;
        const list = rows.map((permission, index) => ({
          ...permission,
          serial: startingIndex + index + 1,
        }));
        setPermissions(list);
        setTotalRecords(pagination.total_records ?? rows.length);
      } else {
        setPermissions([]);
        setTotalRecords(0);
      }
    } catch (err) {
      console.error("Failed to fetch permissions", err);
      setPermissions([]);
      setTotalRecords(0);  
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page, limit) => {
    setPageState((prev) => ({ ...prev, page, limit: limit || prev.limit }));
  };

  const handleModuleFilterChange = (e) => {
    const value = e.target.value ? Number(e.target.value) : "";
    setModuleFilterId(value);
    setPageState((prev) => ({ ...prev, page: 1 }));
  };

  const handleEdit = (item) => {
    setEditDataItem({
      ...item,
      module_id: item.module_id ?? item.permission_module?.id,
    });
  };

  const handleDelete = (item) => {
    setDeleteItem(item);
  };

  const refreshPermissions = () => fetchPermissions(pageState, moduleFilterId);

  const confirmDelete = async () => {
    if (!deleteItem) return;
    try {
      await PrivateAxios.delete(`/permission/delete/${deleteItem.id}`);
      SuccessMessage("Permission deleted");
      refreshPermissions();
      setDeleteItem(null);
    } catch (err) {
      ErrorMessage("Failed to delete");
    }
  };

  const saveEdit = async () => {
    if (!editDataItem) return;
    try {
      const updatedPermission = {
        name: editDataItem.name,
        module_id: editDataItem.module_id,
      };
      // console.log("editDataItem", editDataItem);
      await PrivateAxios.put(`/permission/update/${editDataItem.id}`, updatedPermission);
      SuccessMessage("Updated successfully");
      refreshPermissions();
      setEditDataItem(null);
    } catch (err) {
      ErrorMessage("Failed to update");
    }
  };

  const handleAddPermission = async () => {
    try {
      await PrivateAxios.post("/create-permission", {
        module_id: selectedModuleId,
        name: newPermissionName,
        guard_name: "web",
      });
      SuccessMessage("Permission added successfully");
      setNewPermissionName("");
      setSelectedModuleId("");
      fetchRolePermissions();
      refreshPermissions();
    } catch (err) {
      console.error("Failed to add permission", err);
      ErrorMessage("Failed to add permission");
    }
  };

  const tableColumns = [
    { title: "Sl. No.", dataIndex: "serial", key: "serial", width: 80 },
    { title: "Permission Name", dataIndex: "name", key: "name", width: 200 },
    {
      title: "Module",
      key: "module",
      width: 200,
      render: (_, record) =>
        record.permission_module?.name ?? record.module_id ?? "—",
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <div className="d-flex gap-2">
          <Tooltip title="Edit">
            <button
              type="button"
              className="me-1 icon-btn"
              onClick={() => handleEdit(record)}
            >
              <i className="fas fa-pen d-flex"></i>
            </button>
          </Tooltip>
          <Tooltip title="Delete">
            <button
              type="button"
              className="me-1 icon-btn"
              onClick={() => handleDelete(record)}
            >
              <i className="fas fa-trash-alt text-danger"></i>
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      <SettingsPageTopBar />
      <div className="p-4">
        <div className="card">
          <div className="card-body p-0">
            <div className="card mb-0">
              <div className="card-body">
                <h5 className="mb-3">Add New Permission</h5>
                <div className="row g-2">
                  <div className="col-md-6">
                    <label className="col-form-label pb-1">
                      Select Module <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={selectedModuleId}
                      onChange={(e) =>
                        setSelectedModuleId(e.target.value ? Number(e.target.value) : "")
                      }
                    >
                      <option value="">-- Select Module --</option>
                      {modules.map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="col-form-label pb-1">
                      Permission Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Insert"
                      value={newPermissionName}
                      onChange={(e) => setNewPermissionName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-end mt-3">
                  <button
                    className="btn btn-primary"
                    onClick={handleAddPermission}
                    disabled={!selectedModuleId || !newPermissionName.trim()}
                  >
                    Add Permission
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                  <h5 className="mb-0">Permissions List</h5>
                  <div className="d-flex align-items-center gap-2">
                    <label className="col-form-label mb-0">Filter by Module:</label>
                    <select
                      className="form-select form-select-sm"
                      value={moduleFilterId}
                      onChange={handleModuleFilterChange}
                      style={{ width: "180px" }}
                    >
                      <option value="">All Modules</option>
                      {modules.map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <AntTable
                  rowKey="id"
                  dataSource={permissions}
                  columns={tableColumns}
                  loading={loading}
                  pagination={{
                    current: pageState.page,
                    pageSize: pageState.limit,
                    total: totalRecords,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "15", "25", "50"],
                    onChange: handlePageChange,
                    showTotal: (total) => `Total ${total} permissions`,
                  }}
                  size="small"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <Modal
          show={!!editDataItem}
          onHide={() => setEditDataItem(null)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Permission</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                value={editDataItem?.name ?? ""}
                onChange={(e) =>
                  setEditDataItem({ ...editDataItem, name: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Module</label>
              <select
                className="form-select"
                value={editDataItem?.module_id ?? ""}
                onChange={(e) =>
                  setEditDataItem({
                    ...editDataItem,
                    module_id: e.target.value ? Number(e.target.value) : "",
                  })
                }
              >
                <option value="">-- Select Module --</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.name}
                  </option>
                ))}
              </select>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-secondary" onClick={() => setEditDataItem(null)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={saveEdit}>
              Save
            </button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation */}
        <Modal
          show={!!deleteItem}
          onHide={() => setDeleteItem(null)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Are you sure you want to delete permission:{" "}
              <strong>{deleteItem?.name}</strong>?
            </p>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-secondary" onClick={() => setDeleteItem(null)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={confirmDelete}>
              Delete
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default PermissionsManager;
