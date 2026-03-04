import React, { useState, useEffect } from "react";
import { PrivateAxios } from "../../environment/AxiosInstance";
// import 'bootstrap/dist/css/bootstrap.min.css';
import SettingsPageTopBar from "./SettingsPageTopBar";

import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Input } from "@progress/kendo-react-inputs";
import { Tooltip } from "antd";

const PermissionsManager = ({ roleId }) => {
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [newPermissionName, setNewPermissionName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [editDataItem, setEditDataItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  useEffect(() => {
    fetchRolePermissions(roleId);
  }, [roleId]);

  const fetchRolePermissions = async (roleId) => {
    try {
      const response = await PrivateAxios.get(`/module/all-modules`);
      setModules(response.data.data);
    } catch (error) {
      console.error("Failed to fetch role permissions", error);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const res = await PrivateAxios.get("/permission/all");
      console.log(res.data);

      setPermissions(res.data);
    } catch (err) {
      ErrorMessage("Failed to load permissions");
    }
  };

  const handleEdit = (item) => {
    setEditDataItem({
      ...item,
      module_id: item.module, // Ensure this is set correctly for the backend
    });
  };

  const handleDelete = (item) => {
    setDeleteItem(item);
  };

  const confirmDelete = async () => {
    try {
      await PrivateAxios.delete(`/permission/delete/${deleteItem.id}`);
      SuccessMessage("Permission deleted");
      fetchPermissions();
      setDeleteItem(null);
    } catch (err) {
      ErrorMessage("Failed to delete");
    }
  };

  const saveEdit = async () => {
    try {
      // Send the updated permission with the correct module_id field
      const updatedPermission = {
        name: editDataItem.name,
        module_id: editDataItem.module_id,  // Correct field name for the backend
      };
      await PrivateAxios.put(`/permission/update/${editDataItem.id}`, updatedPermission);
      SuccessMessage("Updated successfully");
      fetchPermissions();
      setEditDataItem(null);
    } catch (err) {
      ErrorMessage("Failed to update");
    }
  };

  const handleAddPermission = async () => {
    try {
      await PrivateAxios.post("/permission/create", {
        module_id: selectedModuleId,
        permission_name: newPermissionName,
      });
      SuccessMessage("Permission added successfully");
      setNewPermissionName("");
      setSelectedModuleId("");
      fetchRolePermissions(roleId); // reload
      fetchPermissions();
    } catch (err) {
      console.error("Failed to add permission", err);
      ErrorMessage("Failed to add permission");
    }
  };

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
                    <label className="col-form-label pb-1">Select Module</label>
                    <select
                      className="form-select"
                      value={selectedModuleId}
                      onChange={(e) => {
                        const selected = Number(e.target.value);
                        console.log("Selected module:", selected);
                        setSelectedModuleId(selected);
                      }}
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
                    <label className="col-form-label pb-1">Permission Name</label>
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
                    disabled={!selectedModuleId || !newPermissionName}
                  >
                    Add Permission
                  </button>
                </div>
              </div>
              <div className="card-body">
                <h5 className="mb-3">Permissions List</h5>
                <Grid data={permissions}>
                  <Column field="id" title="ID" width="60px" />
                  <Column field="name" title="Permission Name" />
                  <Column field="module" title="Module ID" />
                  <Column
                    title="Actions"
                    cell={(props) => (
                      <td>
                        <div className="d-flex gap-2">
                          <Tooltip title="Edit">
                            <button
                              type="button"
                              className="me-1 icon-btn"
                              onClick={() => handleEdit(props.dataItem)}
                            >
                              <i className="fas fa-pen d-flex"></i>
                            </button>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <button
                              type="button"
                              className="me-1 icon-btn"
                              onClick={() => handleDelete(props.dataItem)}
                            >
                              <i className="fas fa-trash-alt text-danger"></i>
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    )}
                  />
                </Grid>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {editDataItem && (
          <Dialog title="Edit Permission" onClose={() => setEditDataItem(null)}>
            <div className="mb-3">
              <label>Name</label>
              <Input
                value={editDataItem.name}
                onChange={(e) =>
                  setEditDataItem({ ...editDataItem, name: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label>Module</label>
              <select
                className="form-select"
                value={editDataItem.module_id} // Ensure this is a number
                onChange={(e) =>
                  setEditDataItem({
                    ...editDataItem,
                    module_id: Number(e.target.value),
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
            <DialogActionsBar>
              <Button onClick={saveEdit} themeColor="primary">
                Save
              </Button>
              <Button onClick={() => setEditDataItem(null)}>Cancel</Button>
            </DialogActionsBar>
          </Dialog>
        )}

        {/* Delete Confirmation */}
        {deleteItem && (
          <Dialog title="Confirm Delete" onClose={() => setDeleteItem(null)}>
            <p>Are you sure you want to delete permission: {deleteItem.name}?</p>
            <DialogActionsBar>
              <Button themeColor="error" onClick={confirmDelete}>
                Delete
              </Button>
              <Button onClick={() => setDeleteItem(null)}>Cancel</Button>
            </DialogActionsBar>
          </Dialog>
        )}
      </div>
    </>
  );
};

export default PermissionsManager;
