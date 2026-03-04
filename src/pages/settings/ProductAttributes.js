import React, { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { PrivateAxios } from "../../environment/AxiosInstance";
import Loader from "../landing/loder/Loader";
import { SuccessMessage, ErrorMessage } from "../../environment/ToastMessage";
import { UserAuth } from "../auth/Auth";

const initialRow = () => ({ attributeName: "", isRequired: false });

function ProductAttributes() {
  const { user } = UserAuth();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [newRows, setNewRows] = useState([initialRow()]);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", isRequired: false });
  const [savingId, setSavingId] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const params = user?.company_id ? { company_id: user.company_id } : {};
      const res = await PrivateAxios.get("master/product-attribute/list", { params });
      const data = res.data?.data;
      setList(Array.isArray(data) ? data : data ? [data] : []);
    } catch (err) {
      console.error(err);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [user?.company_id]);

  const addMore = () => {
    setNewRows((prev) => [...prev, initialRow()]);
  };

  const updateNewRow = (index, field, value) => {
    setNewRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const removeNewRow = (index) => {
    if (newRows.length <= 1) return;
    setNewRows((prev) => prev.filter((_, i) => i !== index));
  };

  const getPayloadRows = () =>
    newRows
      .map((r) => ({
        name: (r.attributeName || "").trim(),
        is_required: r.isRequired ? 1 : 0,
      }))
      .filter((r) => r.name !== "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toSend = getPayloadRows();
    if (toSend.length === 0) {
      ErrorMessage("Please enter at least one attribute name.");
      return;
    }
    setSubmitting(true);
    try {
      for (const row of toSend) {
        const payload = {
          ...row,
          field_type: "text",
        };
        await PrivateAxios.post("master/product-attribute", payload);
      }
      SuccessMessage("Product attribute(s) added successfully.");
      setNewRows([initialRow()]);
      fetchList();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to save.";
      ErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewRows([initialRow()]);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      name: item.name ?? "",
      isRequired: !!item.is_required,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", isRequired: false });
  };

  const handleSaveEdit = async () => {
    const name = (editForm.name || "").trim();
    if (!name) {
      ErrorMessage("Attribute name is required.");
      return;
    }
    setSavingId(editingId);
    try {
      await PrivateAxios.put(`master/product-attribute/${editingId}`, {
        name,
        is_required: editForm.isRequired ? 1 : 0,
        field_type: "text",
      });
      SuccessMessage("Attribute updated successfully.");
      cancelEdit();
      fetchList();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to update.";
      ErrorMessage(msg);
    } finally {
      setSavingId(null);
    }
  };

  if (loading && list.length === 0) {
    return <Loader />;
  }

  return (
    <div className="p-4">
      <div className="mb-3">
        <Button variant="link" className="p-0 text-dark" onClick={() => window.history.back()}>
          <i className="fas fa-long-arrow-alt-left me-1" />
          Back
        </Button>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h4 className="card-title mb-0">Product Attributes</h4>
          <p className="mb-0 small text-muted">Attributes that can be used for products (e.g. Brand, Material Type).</p>
        </div>
        <div className="card-body p-0">
          <Table responsive className="table-bordered primary-table-head mb-0">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>#</th>
                <th>Attribute Name</th>
                <th style={{ width: "120px" }}>Is Required</th>
                <th style={{ width: "120px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {list.length > 0 ? (
                list.map((item, i) => (
                  <tr key={item.id || i}>
                    <td className="align-middle">{i + 1}</td>
                    {editingId === item.id ? (
                      <>
                        <td className="align-middle">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={editForm.name}
                            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="Attribute name"
                          />
                        </td>
                        <td className="align-middle">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`edit-req-${item.id}`}
                              checked={editForm.isRequired}
                              onChange={(e) => setEditForm((f) => ({ ...f, isRequired: e.target.checked }))}
                            />
                            <label className="form-check-label" htmlFor={`edit-req-${item.id}`}>
                              Required
                            </label>
                          </div>
                        </td>
                        <td className="align-middle">
                          <div className="d-flex gap-1">
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={handleSaveEdit}
                              disabled={savingId === item.id}
                            >
                              {savingId === item.id ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                              ) : (
                                <>
                                  <i className="fas fa-check me-1" />
                                  Save
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={cancelEdit}
                              disabled={savingId === item.id}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="align-middle">{item.name ?? "—"}</td>
                        <td className="align-middle">{item.is_required ? "Yes" : "No"}</td>
                        <td className="align-middle">
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-primary p-0"
                            title="Edit"
                            onClick={() => startEdit(item)}
                          >
                            <i className="fas fa-pen" />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted">No attributes added yet.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Add new attribute(s)</h5>
          <p className="mb-0 small text-muted">Add one or more attributes. Leave name empty to skip that row.</p>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <Table responsive className="table-bordered mb-3">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>#</th>
                  <th>Attribute Name</th>
                  <th style={{ width: "120px" }}>Is Required</th>
                  <th style={{ width: "80px" }}></th>
                </tr>
              </thead>
              <tbody>
                {newRows.map((row, index) => (
                  <tr key={index}>
                    <td className="align-middle">{index + 1}</td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Brand, Material Type"
                        value={row.attributeName}
                        onChange={(e) => updateNewRow(index, "attributeName", e.target.value)}
                      />
                    </td>
                    <td className="align-middle">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`req-${index}`}
                          checked={row.isRequired}
                          onChange={(e) => updateNewRow(index, "isRequired", e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor={`req-${index}`}>
                          Required
                        </label>
                      </div>
                    </td>
                    <td className="align-middle">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeNewRow(index)}
                        disabled={newRows.length <= 1}
                        title="Remove row"
                      >
                        <i className="fas fa-times" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="d-flex flex-wrap gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={addMore}>
                <i className="fas fa-plus me-1" />
                Add more
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  "Save attribute(s)"
                )}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProductAttributes;
