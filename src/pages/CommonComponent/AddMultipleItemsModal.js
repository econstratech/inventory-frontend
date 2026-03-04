import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { PrivateAxiosFile } from "../../environment/AxiosInstance";
import { SuccessMessage } from "../../environment/ToastMessage";

const AddMultipleItemsModal = ({ show, onClose ,FetchProduct}) => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    setIsLoading(true);

    if (!file) {
      alert("Please select a file first!");
      setIsLoading(false);
      return;
    }

    const validFileTypes = [
      "text/csv",
      "application/csv",
      "text/plain",
    ];
    const isCsvExtension = /\.csv$/i.test(file.name);
    if (!validFileTypes.includes(file.type) && !isCsvExtension) {
      alert("Please upload a valid CSV file.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await PrivateAxiosFile.post("/product/bulk-upload", formData);
      SuccessMessage("Products uploaded successfully.");
      FetchProduct();
      onClose();
      
      //navigate("/products"); // Redirect to products page
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Upload failed. Please try again.";
      alert(errorMessage);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Modal
      show={show}
      onHide={onClose}
      backdrop="static"
      keyboard={false}
      centered
      size="xl"
      id="AddMultipleItemsModal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Add Items (Multiple)</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <div className="col-12">
            <div className="form-group pt-0">
              <p>The first row of your excel will be considered as headers</p>
              <div className="position-relative">
                <div className="sample_data_badge">Sample Data</div>
                <div className="table-responsive">

                  <table className="table table-bordered primary-table-head">
                    <thead>
                      <tr>
                        <th>Item Code</th>
                        <th>Item Name</th>
                        <th>Item Type</th>
                        <th>Category</th>
                        <th>UOM</th>
                        <th>Weight</th>
                        <th>Batch Applicable</th>
                        <th>Markup Percent</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>FG0003</td>
                        <td>Satto</td>
                        <td>FG MTS</td>
                        <td>RM</td>
                        <td>kg</td>
                        <td>1</td>
                        <td>Yes</td>
                        <td>10</td>
                      </tr>
                      <tr>
                        <td>FG0003</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>g</td>
                        <td>500</td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>RM001</td>
                        <td>Maida</td>
                        <td>Raw Material (RM)</td>
                        <td>Spare parts</td>
                        <td>kg</td>
                        <td>10</td>
                        <td>No</td>
                        <td>8</td>
                      </tr>
                      <tr>
                        <td>RM001</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>kg</td>
                        <td>15</td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>RM001</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>kg</td>
                        <td>20</td>
                        <td></td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <p>
                Note: This is a sample table with columns Item Code, Item Name, Item Type, Category, UOM, Weight, Batch Applicable, Markup Percent. For products with multiple variants, add additional rows with the same Item Code but different UOM and Weight values. You can add more rows in your file!
              </p>
            </div>
            <hr />
          </div>
          <div className="col-lg-6">
            <div className="form-group">
              <label className="form-label">Upload CSV</label>
              <div className="custom-select-wrap">
                <input
                  type="file"
                  required
                  className="form-control"
                  accept=".csv"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            {/* <div className="form-group mb-0 pt-0">
              <div className="d-flex align-items-center gap-3 uploadView mb-3">
                <div className="file">
                  <i className="far fa-file-excel e_file"></i>
                </div>
                <div className="d-flex align-items-center gap-3 w-100">
                  <p className="mb-0 f-s-16 fw-bold">Export (22).xlsx</p>
                  <button className="btn ms-auto fit-btn p-1" type="button">
                    <i className="fas fa-times f-s-16"></i>
                  </button>
                </div>
              </div>
            </div> */}
          </div>
          <div className="col-lg-6">
            <h5>
              Upload your own excel file in{" "}
              <span className="text-success">easy steps!</span>
            </h5>
            <p className="mb-0 f-s-15 text-muted">Points to remember:</p>
            <ol className="f-s-15 text-muted">
              <li>No merged cells or conditional formatting</li>
              <li>Maximum number of rows allowed: 500</li>
              <li>File format should be .csv (max size: 10 MB)</li>
            </ol>
            <div className="gth-bg-warning-light p-3 rounded f-s-15">
              <i className="fas fa-info-circle me-2"></i>Need a reference?{" "}
              <a
                href="/sample-csv-files/sample_bulk_product_add.csv"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download our excel template
              </a>{" "}
              for a seamless
              experience.
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onClose} type="button">
          Cancel
        </button>

        <button
          className="btn btn-success"
          onClick={handleUpload}
          disabled={!file || isLoading}
        >
          {isLoading ? "Uploading..." : "Upload"}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddMultipleItemsModal;
