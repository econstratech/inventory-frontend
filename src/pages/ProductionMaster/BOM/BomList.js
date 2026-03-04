import React, { useEffect, useState } from "react";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { Link } from "react-router-dom";
// import axios from "axios";
import BomPageTopBar from "./BomPageTopBar";
import BomStatusBar from "./BomStatusBar";
import { PrivateAxios } from "../../../environment/AxiosInstance";
import { ErrorMessage, SuccessMessage } from "../../../environment/ToastMessage";
import { Modal, Button } from "react-bootstrap";

function BomList() {
  const [data, setData] = useState([]);
  const [selectedBOMs, setSelectedBOMs] = useState([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [skip, setSkip] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);

  // Fetch BOM List from Backend
  useEffect(() => {
    const fetchBOMList = async () => {
      try {
        const response = await PrivateAxios.get("/production/get-bom-list");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching BOM list:", error);
      }
    };
    fetchBOMList();
  }, []);

  // Show Delete Confirmation Modal
  const handleDeleteClick = () => {
    if (selectedBOMs.length === 0) {
      ErrorMessage("No BOMs selected!");
      return;
    }
    setShowModal(true);
  };

  // Soft Delete Selected BOMs
  const softDeleteSelectedBOMs = async () => {
    if (selectedBOMs.length === 0) {
      ErrorMessage("No BOMs selected!");
      return;
    }

    try {
      await PrivateAxios.post("/production/soft-delete-boms", { bomIds: selectedBOMs });

      // Update the state to remove the deleted BOMs
      setData((prevData) => prevData.filter((bom) => !selectedBOMs.includes(bom.bomId)));

      SuccessMessage("BOM deleted successfully.");
      setSelectedBOMs([]);
      setSelectedAll(false);
      setShowModal(false); // Close modal
    } catch (error) {
      console.error("Error soft deleting BOMs:", error);
    }
  };

  // Handle Checkbox Selection
  const handleCheckboxChange = (bomId, isChecked) => {
    if (isChecked) {
      setSelectedBOMs((prev) => [...prev, bomId]);
    } else {
      setSelectedBOMs((prev) => prev.filter((id) => id !== bomId));
    }
  };

  // Handle Select All
  const handleSelectAll = (isChecked) => {
    setSelectedAll(isChecked);
    setSelectedBOMs(isChecked ? data.map((bom) => bom.bomId) : []);
  };

  // Status Options
  const statuses = [
    { text: "All", value: "all" },
    { text: "Draft", value: "draft" },
    { text: "Published", value: "published" },
    { text: "Deleted", value: "deleted" },
  ];

  const statusStyles = {
    all: "badge-outline-active",
    draft: "badge-outline-warning",
    published: "badge-outline-meantGreen",
    deleted: "badge-outline-quotation",
  };

  const getStatusBadge = (status) => {
    const style = statusStyles[status] || "badge-outline-secondary";
    return (
      <label className={`mb-0 badge ${style}`}>
        <i className="fas fa-circle f-s-8 d-flex me-1"></i>
        {statuses.find((s) => s.value === status)?.text || status}
      </label>
    );
  };

  const CustomCell = (props) => {
    const { dataItem, field } = props;
    return <td>{getStatusBadge(dataItem[field])}</td>;
  };

  return (
    <>
      <BomPageTopBar />
      <BomStatusBar />
      <div className="p-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body p-0">
                <div className="d-flex justify-content-between align-items-center flex-wrap p-3">
                  {/* <Link to="/production/all-production-process/create-production" className="btn btn-outline-primary btn-sm">
                    <i className="fas fa-plus"></i><span className="ms-2">Start Process</span>
                  </Link> */}
                  <div className="d-flex gap-2">
                    <p className="my-1 me-3 fw-medium text-muted">{selectedBOMs.length} BOMs selected</p>
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleDeleteClick}>
                      <i className="fas fa-trash-alt"></i>
                      <span className="ms-2">Delete</span>
                    </button>
                  </div>
                </div>
                <div className="bg_succes_table_head rounded_table">
                  <Grid
                    data={data.slice(skip, skip + pageSize)}
                    skip={skip}
                    take={pageSize}
                    total={data.length}
                    pageable={{ pageSizes: [5, 10, 20, 50, 100, 200, 500], buttonCount: 3 }}
                    onPageChange={(e) => {
                      setSkip(e.page.skip);
                      setPageSize(e.page.take);
                    }}
                    sortable
                  >
                    {/* Select All Checkbox */}
                    <GridColumn
                      field="selected"
                      title=""
                      width="55px"
                      headerCell={() => (
                        <td>
                          <label className="custom-checkbox me-0 mb-0">
                            <input
                              type="checkbox"
                              onChange={(e) => handleSelectAll(e.target.checked)}
                              checked={selectedAll}
                            />
                            <span className="checkmark" />
                          </label>
                        </td>
                      )}
                      cell={(props) => (
                        <td>
                          <label className="custom-checkbox me-0 mb-0">
                            <input
                              type="checkbox"
                              checked={selectedBOMs.includes(props.dataItem.bomId)}
                              onChange={(e) => handleCheckboxChange(props.dataItem.bomId, e.target.checked)}
                            />
                            <span className="checkmark" />
                          </label>
                        </td>
                      )}
                    />

                    <GridColumn field="bomId" title="BOM ID" width="200px"
                      cell={(props) => (
                        <td>
                          <Link to={`/production/bom/view-bom/${props.dataItem.bomId}`}>
                            {props.dataItem.bomNumber} <span className="ms-2 text-primary">
                              <i className="fas fa-external-link-alt"></i>
                            </span>
                          </Link>
                        </td>
                      )}
                    />
                    <GridColumn field="bomName" title="BOM Name" width="270px" />
                    <GridColumn field="status" title="Status" width="200px" cell={CustomCell} />
                    <GridColumn field="fgName" title="FG Name" width="270px" />
                    <GridColumn field="numberOfRm" title="Number of RM" width="230px" />
                    <GridColumn field="lastModifiedBy" title="Last Modified By" width="270px" />
                    <GridColumn field="lastModifiedDate" title="Last Modified Date" width="270px" />
                  </Grid>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete the selected BOMs?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={softDeleteSelectedBOMs}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default BomList;
