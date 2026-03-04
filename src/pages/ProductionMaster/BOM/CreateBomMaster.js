import React, { useState, useRef } from "react";
import { Form, Input, Button, Card } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, DownloadOutlined, UploadOutlined } from "@ant-design/icons";

import { SuccessMessage, ErrorMessage } from "../../../environment/ToastMessage";
import { PrivateAxios, PrivateAxiosFile } from "../../../environment/AxiosInstance";
import ProductSelect from "../../filterComponents/ProductSelect";
import "../../global.css";

const SAMPLE_CSV_URL = "/sample-csv-files/sample_bom_upload.csv";

const initialRow = () => ({
  key: Date.now() + Math.random(),
  fgProductId: null,
  rmProductId: null,
  quantity: "",
});

function CreateBomMaster() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rows, setRows] = useState([initialRow()]);
  const [rowErrors, setRowErrors] = useState({});
  const fileInputRef = useRef(null);

  const validateRow = (row) => {
    const err = {};
    if (!row.fgProductId) err.fgProduct = "FG Product is required";
    if (!row.rmProductId) err.rmProduct = "RM Product is required";
    const q = row.quantity;
    if (q === undefined || q === null || String(q).trim() === "") {
      err.quantity = "Quantity is required";
    } else {
      const num = Number(q);
      if (Number.isNaN(num) || num <= 0) {
        err.quantity = "Quantity must be a positive number";
      }
    }
    return err;
  };

  const validateForm = () => {
    const newErrors = {};
    let valid = true;
    rows.forEach((row) => {
      const err = validateRow(row);
      if (Object.keys(err).length > 0) {
        newErrors[row.key] = err;
        valid = false;
      }
    });
    setRowErrors(newErrors);
    return valid;
  };

  const addRow = () => {
    setRows((prev) => [...prev, initialRow()]);
    setRowErrors((prev) => {
      const next = { ...prev };
      return next;
    });
  };

  const removeRow = (key) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.key !== key));
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const updateRow = (key, field, value) => {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, [field]: value } : r))
    );
    const err = rowErrors[key];
    if (err && err[field]) {
      setRowErrors((prev) => {
        const next = { ...prev };
        if (next[key]) {
          next[key] = { ...next[key] };
          delete next[key][field];
          if (Object.keys(next[key]).length === 0) delete next[key];
        }
        return next;
      });
    }
  };

  const handleDownloadSample = () => {
    const link = document.createElement("a");
    link.href = SAMPLE_CSV_URL;
    link.download = "sample_bom_upload.csv";
    link.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await PrivateAxiosFile.post("/bom/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200 || response.status === 201) {
        SuccessMessage(response.data?.message || "BOM bulk upload completed successfully.");
        navigate("/inventory/bom-master");
      }
    } catch (error) {
      console.error("BOM bulk upload error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Bulk upload failed. Please try again.";
      ErrorMessage(errorMessage);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      ErrorMessage("Please fix errors in the form before submitting.");
      return;
    }

    setSubmitting(true);
    const createBOMPayload = rows.map((row) => ({
      final_product_id: row.fgProductId,
      raw_material_product_id: row.rmProductId,
      quantity: Number(row.quantity),
    }));

    try {
      const response = await PrivateAxios.post("/bom/add", createBOMPayload);
      if (response.status === 201) {
        SuccessMessage(
          response.data?.message || "BOM created successfully."
        );
      }
      navigate("/inventory/bom-master");
    } catch (error) {
      console.error("Error creating BOM:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create BOM. Please try again.";
      ErrorMessage(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <div className="row">
        <div className="col-12 mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Link to="/inventory/bom-master" className="me-2" style={{ color: "#666" }}>
                <ArrowLeftOutlined /> Back
              </Link>
              <h3 className="mb-0 mt-2">Create BOM</h3>
              <p className="text-muted mb-0">Add one or more BOM records</p>
            </div>
          </div>
        </div>

        <div className="col-12">
          <Card>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3 pb-3 border-bottom">
              <Button
                type="default"
                icon={<DownloadOutlined />}
                onClick={handleDownloadSample}
              >
                Download sample CSV
              </Button>
              <Button
                type="default"
                icon={<UploadOutlined />}
                loading={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload CSV to bulk add
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              {/* <span className="text-muted small">
                CSV must have columns: final_product_id, raw_material_product_id, quantity
              </span> */}
            </div>
            <Form form={form} layout="vertical">
              {rows.map((row, index) => {
                const err = rowErrors[row.key] || {};
                return (
                  <div
                    key={row.key}
                    className="border rounded p-3 mb-3 bg-light"
                    style={{ position: "relative" }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted fw-medium">
                        Record {index + 1}
                      </span>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeRow(row.key)}
                        disabled={rows.length <= 1}
                        title={rows.length <= 1 ? "At least one row is required" : "Remove row"}
                      />
                    </div>
                    <div className="row g-2">
                      <div className="col-12 col-md-4">
                        <Form.Item
                          label="FG Product"
                          required
                          validateStatus={err.fgProduct ? "error" : ""}
                          help={err.fgProduct}
                          className="mb-2"
                        >
                          <ProductSelect
                            placeholder="Search and select FG Product..."
                            value={row.fgProductId}
                            onChange={(option) => {
                              updateRow(row.key, "fgProductId", option ? option.value : null);
                            }}
                            error={err.fgProduct}
                            onErrorClear={() => {
                              setRowErrors((prev) => {
                                const next = { ...prev };
                                if (next[row.key]) {
                                  next[row.key] = { ...next[row.key] };
                                  delete next[row.key].fgProduct;
                                }
                                return next;
                              });
                            }}
                          />
                        </Form.Item>
                      </div>
                      <div className="col-12 col-md-4">
                        <Form.Item
                          label="RM Product"
                          required
                          validateStatus={err.rmProduct ? "error" : ""}
                          help={err.rmProduct}
                          className="mb-2"
                        >
                          <ProductSelect
                            placeholder="Search and select RM Product..."
                            value={row.rmProductId}
                            onChange={(option) => {
                              updateRow(row.key, "rmProductId", option ? option.value : null);
                            }}
                            error={err.rmProduct}
                            onErrorClear={() => {
                              setRowErrors((prev) => {
                                const next = { ...prev };
                                if (next[row.key]) {
                                  next[row.key] = { ...next[row.key] };
                                  delete next[row.key].rmProduct;
                                }
                                return next;
                              });
                            }}
                          />
                        </Form.Item>
                      </div>
                      <div className="col-12 col-md-3">
                        <Form.Item
                          label="Quantity"
                          required
                          validateStatus={err.quantity ? "error" : ""}
                          help={err.quantity}
                          className="mb-2"
                        >
                          <Input
                            type="number"
                            placeholder="Enter quantity"
                            min={0}
                            step="any"
                            value={row.quantity}
                            onChange={(e) =>
                              updateRow(row.key, "quantity", e.target.value)
                            }
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={addRow}
                  style={{ marginBottom: 0 }}
                >
                  Add another row
                </Button>
                <Form.Item className="mb-0 ms-2">
                  <Button
                    type="primary"
                    htmlType="button"
                    loading={submitting}
                    onClick={handleSubmit}
                  >
                    Create BOM{rows.length > 1 ? ` (${rows.length} records)` : ""}
                  </Button>
                  <Link to="/inventory/bom-master" className="ms-2">
                    <Button>Cancel</Button>
                  </Link>
                </Form.Item>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CreateBomMaster;
