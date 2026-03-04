import React, { useEffect, useState } from "react";
import {
  Form,
  Row,
  Col,
  Table,
  Collapse,
  Modal,
  OverlayTrigger,
  Popover,
  Dropdown,
} from "react-bootstrap";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Tooltip, Typography } from "antd";

import { format } from "date-fns";

import { DropDownButton } from "@progress/kendo-react-buttons";
import RevertCompleteModal from "../../CommonComponent/RevertCompleteModal";
import CancelProcessModal from "../../CommonComponent/CancelProcessModal";
import ProcessHistoryModal from "../../CommonComponent/ProcessHistoryModal";
import BarcodeNumbersViewModal from "../../CommonComponent/BarcodeNumbersViewModal";
import BarcodeNumbersCreateModal from "../../CommonComponent/BarcodeNumbersCreateModal";
import DeleteModal from "../../CommonComponent/DeleteModal";
import EditOtherChargesModal from "../../CommonComponent/EditOtherChargesModal";
import { PrivateAxios } from "../../../environment/AxiosInstance";
import { UserAuth } from "../../auth/Auth";
import ProcessStartModal from "../../CommonComponent/ProcessStartModal";

const ViewProductionProcess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getGeneralSettingssymbol } = UserAuth();
  const [openPopup, setOpenPopup] = useState(false);
  // Revert Complete Modal start
  const [showRevertCompleteModal, setShowRevertCompleteModal] = useState(false);
  const handleCloseRevertCompleteModal = () =>
    setShowRevertCompleteModal(false);

  // Cancel Process Modal start
  const [showCancelProcessModal, setShowCancelProcessModal] = useState(false);
  const handleCloseCancelProcessModal = () => setShowCancelProcessModal(false);
  const handleShowCancelProcessModal = () => setShowCancelProcessModal(true);
  // Barcode Numbers View Modal start
  const [showBarcodeNumbersViewModal, setShowBarcodeNumbersViewModal] =
    useState(false);
  const handleCloseBarcodeNumbersViewModal = () =>
    setShowBarcodeNumbersViewModal(false);
  const handleShowBarcodeNumbersViewModal = () =>
    setShowBarcodeNumbersViewModal(true);
  // Barcode Numbers Create Modal start
  const [showBarcodeNumbersCreateModal, setShowBarcodeNumbersCreateModal] =
    useState(false);
  const handleCloseBarcodeNumbersCreateModal = () =>
    setShowBarcodeNumbersCreateModal(false);
  const handleShowBarcodeNumbersCreateModal = () =>
    setShowBarcodeNumbersCreateModal(true);
  // Process History Modal start
  const [showProcessHistoryModal, setShowProcessHistoryModal] = useState(false);
  const handleCloseProcessHistoryModal = () =>
    setShowProcessHistoryModal(false);
  const handleShowProcessHistoryModal = () => setShowProcessHistoryModal(true);
  useEffect(() => {
    if (
      location.pathname ===
      `/production/all-production-process/view-production/${id}`
    ) {
      document.body.classList.add("sidebar-collapse");
    } else {
      document.body.classList.remove("sidebar-collapse");
    }
    return () => {
      document.body.classList.remove("sidebar-collapse");
    };
  }, [location.pathname]);
  // page redirection side bar collapse end

  const historyData = [
    {
      processNumber: "PID00004",
      link: "#", // Replace with the appropriate route or URL
      actionType: "Process Created",
      comment: "New process created by Cralon.",
      creationDate: "17/12/2024, 1:52 pm",
    },
    {
      processNumber: "PID00005",
      link: "#",
      actionType: "Process Updated",
      comment: "Process updated by John.",
      creationDate: "18/12/2024, 2:15 pm",
    },
  ];

  // Edit Other Charges Modal start
  const [showEditOtherChargesModal, setShowEditOtherChargesModal] =
    useState(false);
  const handleCloseEditOtherChargesModal = () =>
    setShowEditOtherChargesModal(false);

  //delete modal
  const [deleteShow, setDeleteShow] = useState(false);
  const deleteModalClose = () => setDeleteShow(false);
  const deleteModalShow = () => setDeleteShow(true);

  //collapse
  const [openFinishedGoods, setOpenFinishedGoods] = useState(true);
  const [openRelatedProcesses, setOpenRelatedProcesses] = useState(true);
  const [openRawMaterials, setOpenRawMaterials] = useState(true);
  const [openRouting, setOpenRouting] = useState(true);
  const [openScrap, setOpenScrap] = useState(true);
  const [productionData, setProductionData] = useState(null);
  const [open, setOpen] = useState(true);

  // Process Start Modal start
  const [showProcessStartModal, setShowProcessStartModal] = useState(false);
  const handleCloseProcessStartModal = () => setShowProcessStartModal(false);
  const handleShowProcessStartModal = () => setShowProcessStartModal(true);

  // view Process cost toggle
  const [isCheckedProcessCost, setIsCheckedProcessCost] = useState(false);

  const handleCheckboxChangeProcessCost = () => {
    setIsCheckedProcessCost(!isCheckedProcessCost); // Toggle the checkbox state
  };
  //table disable row show
  const [expandedDisableTableRow, setExpandedDisableTableRow] = useState(false);

  const handleToggleDisableTableRow = () => {
    setExpandedDisableTableRow(!expandedDisableTableRow);
  };

  const [show, setShow] = useState(false);
  const [doneshow, donesetShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  const donehandleShow = () => donesetShow(true);
  const donehandleClose = () => donesetShow(false);

  useEffect(() => {
    const fetchProductionDetails = async () => {
      try {
        const response = await PrivateAxios.get(
          `/production/getProductionDetails/${id}`
        ); // ✅ API Call
        setProductionData(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching production details:", error);
      }
    };

    fetchProductionDetails();
  }, [id]);

  const handleConfirmIssue = async () => {
    if (!productionData || !productionData.production) {
      console.error("No production data available!");
      return;
    }

    // Prepare the payload for bulk update
    const payload = {
      action: "bulk_update",
      production: productionData.production, // Main production details
      rawMaterials: productionData.rawMaterials || [], // Raw Materials
      finishedGoods: productionData.finishedGoods || [], // Finished Goods
      scrapItems: productionData.scrapItems || [], // Scrap Items
      routingProcesses: productionData.routingProcesses || [], // Routing Processes (if applicable)
    };

    try {
      const response = await PrivateAxios.post(
        "/production/submitBulkProductionupdate",
        payload
      );

      if (response.status === 200) {
        handleClose();
        console.log("Production updated successfully!");
        window.location.reload();
      } else {
        console.error("Error:", response.data.error);
        alert(`Error: ${response.data.error}`);
      }
    } catch (error) {
      console.error("Error issuing production:", error);
      alert("Error submitting production data.");
    }
  };

  const donehandleConfirmIssue = async () => {
    if (!productionData || !productionData.production) {
      console.error("No production data available!");
      return;
    }

    // Prepare the payload for bulk update
    const payload = {
      action: "complete",
      production: productionData.production, // Main production details
      rawMaterials: productionData.rawMaterials || [], // Raw Materials
      finishedGoods: productionData.finishedGoods || [], // Finished Goods
      scrapItems: productionData.scrapItems || [], // Scrap Items
      routingProcesses: productionData.routingProcesses || [], // Routing Processes (if applicable)
    };

    try {
      const response = await PrivateAxios.post(
        "/production/submitBulkProductionupdate",
        payload
      );
      console.log(payload, "sumit");
      if (response.status === 200) {
        donehandleClose();
        console.log("Production done successfully!");
        window.location.reload();
      } else {
        console.error("Error:", response.data.error);
        alert(`Error: ${response.data.error}`);
      }
    } catch (error) {
      console.error("Error issuing production:", error);
      alert("Error submitting production data.");
    }
  };
  //total calculation 
  const fgTotal = (productionData?.finishedGoods?.[0]?.product_price ?? 0) *
                (productionData?.finishedGoods?.[0]?.targetProduction ?? 0);

const rawMaterialTotal = productionData?.rawMaterials?.reduce((sum, item) => {
  const unitPrice = Number(item.product_price ?? 0);
  const usedRM = Number(item.usedRM ?? 0);
  return sum + unitPrice * usedRM;
}, 0) ?? 0;

const otherChargesTotal = 
  Number(productionData?.production?.labourChargesAA ?? 0) +
  Number(productionData?.production?.machineryChargesAA ?? 0) +
  Number(productionData?.production?.electricityChargesAA ?? 0) +
  Number(productionData?.production?.otherChargesAA ?? 0);

const totalCost = fgTotal + rawMaterialTotal + otherChargesTotal;

  return (
    <>
      <div className="p-4">
        <div className="mb-4">
          <button
            type="button"
            className="link-btn text-dark "
            onClick={() => navigate(-1)} // Navigate back in history
          >
            <i className="fas fa-arrow-left me-1" />
            <span className="ms-2 f-s-16">Back</span>
          </button>
        </div>
        <div className="card">
          <div className="card-body">
            <div className=" d-flex flex-wrap justify-content-between">
              <div className="d-flex align-items-center my-1 flex-wrap gap-2">
                <div className="my-1">
                  <h6 className="mb-0 fw-bold">
                    {productionData?.production.production_number}
                  </h6>
                  <span className="text-black-50 f-s-13">
                    Production Process
                  </span>
                </div>
                {productionData?.production.status == 5 ? (
                  <label className="badge badge-success mb-0">Completed</label>
                ) : productionData?.production.status == 2 ? (
                  <label className="badge badge-info mb-0">WIP </label>
                ) : productionData?.production.status == 1 ? (
                  <label className="badge badge-warning mb-0">Planned</label>
                ) : null}
              </div>

              <div className="ms-auto d-flex align-items-center">
                <span className="text-primary fw-medium f-s-14 pe-2">
                  View Process Cost
                </span>
                <label className="custom-switch">
                  <span className="switch-name"></span>
                  <input
                    type="checkbox"
                    checked={isCheckedProcessCost}
                    onChange={handleCheckboxChangeProcessCost} // Toggle the state on change
                  />
                  <div className="switch-slider switch-round" />
                </label>
              </div>
            </div>
            {isCheckedProcessCost && (
              <div className="view_bom_cost">
                <hr />
                <div className="d-flex flex-wrap justify-content-between align-items-center">
                  <h5 className="my-1 fw-bold">Total Cost: {getGeneralSettingssymbol}{totalCost.toFixed(2)}</h5>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card mb-0">
          <div className="card-header d-flex flex-wrap justify-content-between align-items-center flex-wrap">
            <h5 className="card-title my-1 f-s-16 fw-bold">Process Details</h5>
            {/* <div className="d-flex ms-auto gap-2">
              {!isCheckedProcessCost && (
                <>
                  <Tooltip title="Process Log">
                    <button
                      type="button"
                      className="btn btn-light btn-sm"
                      onClick={handleShowProcessHistoryModal}
                    >
                      <i className="fas fa-history me-2"></i> Process Log
                    </button>
                  </Tooltip>

                  <Tooltip
                    title="Barcode"
                    onClick={handleShowBarcodeNumbersViewModal}
                  >
                    <button type="button" className="icon-btn">
                      <i className="fas fa-barcode"></i>
                    </button>
                  </Tooltip>
                </>
              )}
              <Tooltip title="Print">
                <button type="button" className="icon-btn">
                  <i className="fas fa-print"></i>
                </button>
              </Tooltip>
              {!isCheckedProcessCost && (
                <>
                  <Tooltip title="Delete BOM">
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={handleShowCancelProcessModal}
                    >
                      <i className="fas fa-ban text-danger"></i>
                    </button>
                  </Tooltip>
                </>
              )}
            </div> */}
          </div>
          <div className="card-body pb-1">
            {/* Process Detail Section */}
            <div className="card shadow-none border">
              <div className="card-header border-bottom-0 d-flex justify-content-between align-items-center flex-wrap">
                <h6 className="my-1 me-3">
                  <span className="me-3">Process Details</span>
                </h6>
                <Tooltip title="Expand">
                  <button
                    type="button"
                    className="link-btn ms-auto"
                    onClick={() => setOpen(!open)}
                    aria-expanded={open}
                  >
                    <i className="fas fa-sort ms-2 line-height-1"></i>
                  </button>
                </Tooltip>
              </div>
              <Collapse in={open}>
                <div className="card-body border-top bg-light rounded-bottom-10">
                  <div className="row">
                    <div className="col-lg-4 col-md-6 col-sm-12">
                      <div className="form-group form-group-view">
                        <label className="col-form-label">Order Number</label>
                        <p>{productionData?.production.production_number}</p>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12">
                      <div className="form-group form-group-view">
                        <label className="col-form-label">BOM Name</label>
                        <p>{productionData?.bomDetails.documentName}</p>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12">
                      <div className="form-group form-group-view">
                        <label className="col-form-label">BOM Number</label>
                        <p>
                          <Link
                            to={`/production/bom/view-bom/${productionData?.bomDetails?.id}`}
                          >
                            {productionData?.bomDetails?.bomNumber}
                            <i className="fas fa-external-link-alt ms-2"></i>
                          </Link>
                        </p>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12">
                      <div className="form-group form-group-view">
                        <label className="col-form-label">FG Store</label>
                        <p>{productionData?.storeDetails.fg_store_name}</p>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12">
                      <div className="form-group form-group-view">
                        <label className="col-form-label">RM Store</label>
                        <p>{productionData?.storeDetails.rm_store_name}</p>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12">
                      <div className="form-group form-group-view">
                        <label className="col-form-label">
                          Scrap/Reject Store
                        </label>
                        <p>{productionData?.storeDetails.scrap_store_name}</p>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12">
                      <div className="form-group form-group-view">
                        <label className="col-form-label">
                          Reference Number
                        </label>
                        <p>-</p>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12">
                      <div className="form-group form-group-view">
                        <label className="col-form-label">Created By</label>
                        <p>{productionData?.userDetails.name}</p>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12">
                      <div className="form-group form-group-view">
                        <label className="col-form-label">
                          Last Modified Date
                        </label>
                        <p>
                          {productionData?.production.updated_at
                            ? format(
                                new Date(productionData.production.updated_at),
                                "dd-MM-yyyy HH:mm a"
                              )
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12">
                      <div className="form-group form-group-view">
                        <label className="col-form-label">Creation Date</label>
                        <p>
                          {productionData?.production.created_at
                            ? format(
                                new Date(productionData.production.created_at),
                                "dd-MM-yyyy HH:mm a"
                              )
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-group form-group-view">
                        <label className="col-form-label">
                          BOM Description
                        </label>
                        <p>{productionData?.bomDetails.description}</p>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-group form-group-view">
                        <label className="col-form-label">Comment</label>
                        <p>{productionData?.bomDetails.comment}</p>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-group form-group-view">
                        <label className="col-form-label">ATTACHMENTS</label>
                        <div className="erp_attachment_wrap">
                          {/* loop this item */}
                          {productionData?.bomDetails.attachments ? (
                            (() => {
                              try {
                                const files = JSON.parse(
                                  productionData?.bomDetails.attachments
                                );
                                if (
                                  !Array.isArray(files) ||
                                  files.length === 0
                                ) {
                                  return <p>No attachments available</p>;
                                }

                                return files.map((file, index) => (
                                  <div
                                    className="erp_attachment_item"
                                    key={index}
                                  >
                                    <div className="erp_attachment_icon">
                                      <i className="fas fa-file"></i>
                                    </div>
                                    <div className="erp_attachment_file text-truncate">
                                      <a
                                        href={`http://localhost:5000/api/${file}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {file}
                                      </a>
                                    </div>
                                  </div>
                                ));
                              } catch (error) {
                                console.error(
                                  "Error parsing attachments:",
                                  error
                                );
                                return <p>Error loading attachments</p>;
                              }
                            })()
                          ) : (
                            <p>Loading attachments...</p>
                          )}

                          {/* loop this item end*/}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Collapse>
            </div>

            {/* Related Processes Section */}
            {!isCheckedProcessCost && (
              <div className="card shadow-none border">
                <div className="card-header border-bottom-0 d-flex flex-wrap justify-content-between align-items-center">
                  <h6 className="my-1 me-3">
                    <span className="me-3">Related Processes</span>
                    <Tooltip title="Processes involved to produce the Finished Goods">
                      <i className="fas fa-info-circle text-primary"></i>
                    </Tooltip>
                  </h6>
                  <Tooltip title="Expand">
                    <button
                      className="link-btn ms-auto"
                      type="button"
                      onClick={() =>
                        setOpenRelatedProcesses(!openRelatedProcesses)
                      }
                      aria-expanded={open}
                    >
                      <i className="fas fa-sort ms-2 line-height-1"></i>
                    </button>
                  </Tooltip>
                </div>
                <Collapse in={openRelatedProcesses}>
                  <div className="card-body border-top bg-light rounded-bottom-10 pb-1">
                    <div className="table-responsive">
                      <table className="table table-bordered primary-table-head">
                        <thead>
                          <tr>
                            <th>Process Number</th>
                            <th>Stage</th>
                            <th>Finished Goods</th>
                            <th>Target Qty.</th>
                            <th>Completed Qty.</th>
                            <th>Pending Qty.</th>
                            <th>Approval State</th>
                            <th>Service Order Number</th>
                            <th>BOM</th>
                            <th>Creation Date</th>
                            <th>Last Modified By</th>
                            <th>Last Modified Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className>
                            <td>
                              <div
                                style={{ width: "150px" }}
                                className="fw-medium f-s-14 d-flex justify-content-between align-items-center"
                              >
                                <div className="me-3">
                                  {productionData?.production.production_number}
                                </div>
                                {/* <Tooltip title="View Process">
                                                                <button type='button' className="link-btn">
                                                                    <i className="fas fa-external-link-alt text-purple"></i>
                                                                </button>
                                                            </Tooltip> */}
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "150px" }} className="">
                                {productionData?.production.status == 5
                                  ? "Completed"
                                  : "WIP"}
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "250px" }}>
                                {productionData?.finishedGoods?.[0]
                                  ?.product_name || "N/A"}
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "150px" }}>
                                {productionData?.finishedGoods?.[0]
                                  ?.targetProduction || "N/A"}{" "}
                                {productionData?.finishedGoods?.[0]?.unit ||
                                  "N/A"}
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "150px" }} className="">
                                {productionData?.production?.status == 5 ? (
                                  <>
                                    {productionData?.finishedGoods?.[0]
                                      ?.completed || "N/A"}{" "}
                                    {productionData?.finishedGoods?.[0]?.unit ||
                                      "N/A"}
                                  </>
                                ) : (
                                  <>
                                    0{" "}
                                    {productionData?.finishedGoods?.[0]?.unit ||
                                      "N/A"}
                                  </>
                                )}
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "150px" }}>
                                {productionData?.production?.status == 5 ? (
                                  <>
                                    0{" "}
                                    {productionData?.finishedGoods?.[0]?.unit ||
                                      "N/A"}
                                  </>
                                ) : (
                                  <>
                                    {productionData?.finishedGoods?.[0]
                                      ?.quantity || "N/A"}{" "}
                                    {productionData?.finishedGoods?.[0]?.unit ||
                                      "N/A"}
                                  </>
                                )}
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "150px" }} className="">
                                Approved
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "200px" }}>-</div>
                            </td>
                            <td>
                              <div style={{ width: "200px" }}>
                                <Link
                                  to={`/production/bom/view-bom/${productionData?.bomDetails?.id}`}
                                >
                                  {productionData?.bomDetails?.bomNumber}
                                  <i className="fas fa-external-link-alt ms-2"></i>
                                </Link>
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "200px" }}>
                                {productionData?.production.created_at
                                  ? format(
                                      new Date(
                                        productionData.production.created_at
                                      ),
                                      "dd-MM-yyyy HH:mm a"
                                    )
                                  : "N/A"}
                              </div>
                            </td>
                            <td>
                              <div
                                style={{ width: "200px" }}
                                className="text-truncate"
                              >
                                {productionData?.userDetails.name}
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "200px" }}>
                                {productionData?.production.created_at
                                  ? format(
                                      new Date(
                                        productionData.production.updated_at
                                      ),
                                      "dd-MM-yyyy HH:mm a"
                                    )
                                  : "N/A"}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Collapse>
              </div>
            )}

            {/* Finished Goods Section */}
            <div className="card shadow-none border">
              <div className="card-header border-bottom-0 d-flex flex-wrap justify-content-between align-items-center">
                <h6 className="my-1 me-3">
                  <span className="me-3">Finished Goods</span>
                  <Tooltip title="Goods that are produced after completion of process">
                    <i className="fas fa-info-circle text-primary"></i>
                  </Tooltip>
                </h6>
              </div>
              <Collapse in={openFinishedGoods}>
                <div className="card-body border-top bg-light rounded-bottom-10 pb-1">
                  <div className="table-responsive">
                    {!isCheckedProcessCost && (
                      <table className="table table-bordered primary-table-head">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Item ID</th>
                            <th>Item Name</th>
                            <th>Item Category</th>
                            <th>Unit</th>
                            <th>Cost Allocation (%)</th>
                            <th>Target Production</th>
                            <th>Completed</th>
                            <th>Tested</th>
                            <th>Passed</th>
                            <th>Rejected</th>
                            <th>For Repair</th>
                            <th>Repaired</th>
                            <th>Comment</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className>
                            <td>1</td>
                            <td>
                              <div style={{ width: "150px" }} className="">
                                <div className="me-3">
                                  {
                                    productionData?.finishedGoods[0]
                                      .product_code
                                  }
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "200px" }}>
                                {productionData?.finishedGoods[0].product_name}
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "200px" }}>
                                {productionData?.productDetails.categoryName}
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "150px" }}>
                                {productionData?.finishedGoods[0].unit}
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "140px" }} className="fs-5">
                                {
                                  productionData?.finishedGoods[0]
                                    .costAllocation
                                }
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "130px" }} className="fs-5">
                                {
                                  productionData?.finishedGoods[0]
                                    .targetProduction
                                }
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "130px" }} className="fs-5">
                                {productionData?.finishedGoods[0].completed}
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "130px" }} className="fs-5">
                                {productionData?.finishedGoods[0].tested}
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "130px" }} className="fs-5">
                                {productionData?.finishedGoods[0].passed}
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "130px" }} className="fs-5">
                                {productionData?.finishedGoods[0].rejected}
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "130px" }} className="fs-5">
                                {productionData?.finishedGoods[0].forRepair}
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "130px" }} className="fs-5">
                                {productionData?.finishedGoods[0].repaired}
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "200px" }}>
                                {productionData?.finishedGoods[0].comment}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                    {isCheckedProcessCost && (
                      <table className="table table-bordered primary-table-head">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Item Id</th>
                            <th>Item Name</th>
                            <th>Item Category</th>
                            <th>Unit</th>
                            <th>Target Production</th>
                            <th>Completed</th>

                            <th>Cost Allocation (%)</th>
                            <th class="highlighted">Price Unit</th>
                            <th class="highlighted">Total Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>#1</td>
                            <td>
                              <div style={{ width: "150px" }} className="">
                                <div className="me-3">
                                  {
                                    productionData?.finishedGoods[0]
                                      .product_code
                                  }
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "200px" }}>
                                {productionData?.finishedGoods[0].product_name}
                              </div>
                            </td>

                            <td>
                              <div style={{ width: "200px" }}>
                                {productionData?.productDetails.categoryName}
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "150px" }}>
                                {productionData?.finishedGoods[0].unit}
                              </div>
                            </td>
                            <td>
                              {" "}
                              <div style={{ width: "130px" }} className="fs-5">
                                {
                                  productionData?.finishedGoods[0]
                                    .targetProduction
                                }
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "130px" }} className="fs-5">
                                {productionData?.finishedGoods[0].completed}
                              </div>
                            </td>
                            <td>
                              <div style={{ width: "140px" }}>
                                {
                                  productionData?.finishedGoods[0]
                                    .costAllocation
                                }
                              </div>
                            </td>
                            <td><div style={{ width: "140px" }}>
                              {getGeneralSettingssymbol}
                              {Number(productionData?.finishedGoods[0]?.product_price ?? 0).toFixed(2)}

</div>
                            </td>
                            <td>
                           <div  style={{ width: "140px" }} className="fs-5">
                              {getGeneralSettingssymbol}
                              {(
                                (productionData?.finishedGoods[0]
                                  ?.product_price ?? 0) *
                                (productionData?.finishedGoods[0]
                                  ?.targetProduction ?? 0)
                              ).toFixed(2)}
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </Collapse>
            </div>

            {/* Raw Materials Section */}

            <div className="card shadow-none border">
              <div className="card-header border-bottom-0 d-flex flex-wrap justify-content-between align-items-center">
                <h6 className="my-1 me-3">
                  <span className="me-3">Raw Materials</span>
                  <Tooltip title="Raw Materials required to produce Finished Goods">
                    <i className="fas fa-info-circle text-primary"></i>
                  </Tooltip>
                </h6>
              </div>
              <Collapse in={openRawMaterials}>
                <div className="card-body border-top bg-light rounded-bottom-10 pb-1">
                  <div className="table-responsive">
                    {!isCheckedProcessCost && (
                      <table className="table table-bordered primary-table-head raw_material_table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Item ID</th>
                            <th>Item Name</th>
                            <th>Item Category</th>
                            <th>Current Stock</th>
                            <th>Estimated RM</th>
                            <th>Used RM</th>
                            <th>Estimated Production</th>
                            <th>Produced</th>
                            <th>Unit</th>
                            <th>Comment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productionData?.rawMaterials?.length > 0 ? (
                            productionData.rawMaterials
                              .filter((rm) => !rm.parent_raw_material_id) // Get only main raw materials
                              .map((rawMaterial, index) => {
                                const children =
                                  productionData.rawMaterials.filter(
                                    (child) =>
                                      child.parent_raw_material_id ===
                                        rawMaterial.id &&
                                      child.alternative_flag === 0
                                  );
                                const alternatives =
                                  productionData.rawMaterials.filter(
                                    (alt) =>
                                      alt.parent_raw_material_id ===
                                        rawMaterial.id &&
                                      alt.alternative_flag === 1
                                  );

                                return (
                                  <React.Fragment key={rawMaterial.id}>
                                    {/* Parent Raw Material Row */}
                                    <tr className="active_tr">
                                      <td className="active_td">
                                        <div style={{ whiteSpace: "nowrap" }}>
                                          {index + 1}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "200px" }}>
                                          {rawMaterial.product_code}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "150px" }}>
                                          {rawMaterial.product_name || "N/A"}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "200px" }}>
                                          {rawMaterial.categoryName || "N/A"}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "150px" }}>
                                          {rawMaterial.currentStock ?? "N/A"}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "140px" }}>
                                          {rawMaterial.quantity || 0}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "130px" }}>
                                          {rawMaterial.usedRM || 0}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "130px" }}>
                                          {rawMaterial.EstimatedProduction || 0}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "130px" }}>
                                          {rawMaterial.produced || 0}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "130px" }}>
                                          {rawMaterial.unit || "N/A"}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "130px" }}>
                                          {rawMaterial.comment || "-"}
                                        </div>
                                      </td>
                                    </tr>

                                    {/* Child Raw Materials (C Icon) */}
                                    {children.map((child, childIndex) => (
                                      <tr key={child.id} className="child_tr">
                                        <td
                                          className="active_td"
                                          style={{
                                            backgroundColor:
                                              "rgb(186,91,245,.29)",
                                          }}
                                        >
                                          <div style={{ whiteSpace: "nowrap" }}>
                                            {" "}
                                            {index + 1}.{childIndex + 1}{" "}
                                            <svg
                                              className="ms-2"
                                              xmlns="http://www.w3.org/2000/svg"
                                              id="Layer_1"
                                              data-name="Layer 1"
                                              viewBox="0 0 24 24"
                                              width="12"
                                              height="12"
                                            >
                                              <path d="m12,0C5.383,0,0,5.383,0,12s5.383,12,12,12,12-5.383,12-12S18.617,0,12,0Zm4.009,16.652c-.835.971-2.309,1.598-3.756,1.598h-.455c-2.783,0-5.048-2.284-5.048-5.091v-2.318c0-2.807,2.265-5.091,5.048-5.091h.455c1.485,0,2.904.71,3.797,1.9.332.442.242,1.069-.2,1.4-.442.332-1.068.241-1.399-.2-.509-.679-1.351-1.1-2.197-1.1h-.455c-1.709,0-3.048,1.357-3.048,3.091v2.318c0,1.733,1.339,3.091,3.048,3.091h.455c.861,0,1.782-.371,2.238-.902.362-.419.993-.465,1.41-.106.419.36.467.991.107,1.41Z" />
                                            </svg>
                                          </div>
                                        </td>
                                        <td>
                                          {" "}
                                          <div style={{ minWidth: "200px" }}>
                                          {child.product_code}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "150px" }}>
                                            {child.product_name || "N/A"}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "200px" }}>
                                            {child.categoryName || "N/A"}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "150px" }}>
                                            {child.currentStock ?? "N/A"}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "140px" }}>
                                            {child.quantity || 0}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "130px" }}>
                                            {child.usedRM || 0}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "130px" }}>
                                            {child.EstimatedProduction || 0}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "130px" }}>
                                            {child.produced || 0}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "130px" }}>
                                            {child.unit || "N/A"}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "130px" }}>
                                            {child.comment || "-"}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}

                                    {/* Alternative Raw Materials (A Icon) */}
                                    {alternatives.map((alt, altIndex) => (
                                      <tr
                                        key={alt.id}
                                        className="alternative_tr"
                                      >
                                        <td
                                          className="active_td"
                                          style={{
                                            backgroundColor: "rgb(250,234,207)",
                                          }}
                                        >
                                          <div style={{ whiteSpace: "nowrap" }}>
                                            {index + 1}.{altIndex + 1}{" "}
                                            <svg
                                              className="ms-2"
                                              xmlns="http://www.w3.org/2000/svg"
                                              id="Layer_1"
                                              data-name="Layer 1"
                                              viewBox="0 0 24 24"
                                              width="12"
                                              height="12"
                                            >
                                              <path d="m12,0C5.383,0,0,5.383,0,12s5.383,12,12,12,12-5.383,12-12S18.617,0,12,0Zm3.789,17.25l-.945-3h-5.691l-.943,3h-2.126l3.374-10.049c.621-1.411,1.465-1.701,2.542-1.701,1.077,0,1.922.29,2.526,1.658l3.39,10.092h-2.127Zm-6.007-5l1.295-4.119c.194-.408.542-.625.917-.631.388.005.736.223.9.555l1.321,4.195h-4.433Z" />
                                            </svg>{" "}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "200px" }}>
                                            {alt.product_code}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "150px" }}>
                                            {alt.product_name || "N/A"}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "200px" }}>
                                            {alt.categoryName || "N/A"}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "150px" }}>
                                            {alt.currentStock ?? "N/A"}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "140px" }}>
                                            {alt.quantity || 0}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "130px" }}>
                                            {alt.usedRM || 0}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "130px" }}>
                                            {alt.EstimatedProduction || 0}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "130px" }}>
                                            {alt.produced || 0}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "130px" }}>
                                            {alt.unit || "N/A"}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "130px" }}>
                                            {alt.comment || "-"}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </React.Fragment>
                                );
                              })
                          ) : (
                            <tr>
                              <td colSpan="11" className="text-center">
                                No raw materials found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}
                    {isCheckedProcessCost && (
                      <table className="table table-bordered primary-table-head raw_material_table">
                        <thead>
                          <tr>
                          <th>#</th>
                            <th>Item ID</th>
                            <th>Item Name</th>
                            <th>Item Category</th>
                            <th>Current Stock</th>
                            <th>Estimated RM</th>
                            <th>Used RM</th>
                            <th>Estimated Production</th>
                            <th>Produced</th>
                            <th>Unit</th>
                        
                            <th class="highlighted">Price Unit</th>
                            <th class="highlighted">Total Price</th>
                          </tr>
                        </thead>
                        <tbody>
                        {productionData?.rawMaterials?.length > 0 ? (
                            productionData.rawMaterials
                              .filter((rm) => !rm.parent_raw_material_id) // Get only main raw materials
                              .map((rawMaterial, index) => {
                                const children =
                                  productionData.rawMaterials.filter(
                                    (child) =>
                                      child.parent_raw_material_id ===
                                        rawMaterial.id &&
                                      child.alternative_flag === 0
                                  );
                                const alternatives =
                                  productionData.rawMaterials.filter(
                                    (alt) =>
                                      alt.parent_raw_material_id ===
                                        rawMaterial.id &&
                                      alt.alternative_flag === 1
                                  );

                                return (
                                  <React.Fragment key={rawMaterial.id}>
                                    {/* Parent Raw Material Row */}
                                    <tr className="">
                                      <td className="">
                                        <div style={{ whiteSpace: "nowrap" }}>
                                          {index + 1}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "200px" }}>
                                          {rawMaterial.product_code}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "150px" }}>
                                          {rawMaterial.product_name || "N/A"}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "200px" }}>
                                          {rawMaterial.categoryName || "N/A"}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "150px" }}>
                                          {rawMaterial.currentStock ?? "N/A"}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "140px" }}>
                                          {rawMaterial.quantity || 0}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "130px" }}>
                                          {rawMaterial.usedRM || 0}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "130px" }}>
                                          {rawMaterial.EstimatedProduction || 0}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "130px" }}>
                                          {rawMaterial.produced || 0}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "130px" }}>
                                          {rawMaterial.unit || "N/A"}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "130px" }} >
                                        {getGeneralSettingssymbol}{Number(rawMaterial.product_price).toFixed(2) || 0}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ minWidth: "130px" }}>
                                        {getGeneralSettingssymbol}{(rawMaterial.usedRM * rawMaterial.product_price).toFixed(2) || "-"}
                                        </div>
                                      </td>
                                    </tr>

                                    {/* Child Raw Materials (C Icon) */}
                                    {children.map((child, childIndex) => (
                                      <tr key={child.id} className="child_tr">
                                        <td
                                          className="active_td"
                                          style={{
                                            backgroundColor:
                                              "rgb(186,91,245,.29)",
                                          }}
                                        >
                                          <div style={{ whiteSpace: "nowrap" }}>
                                            {" "}
                                            {index + 1}.{childIndex + 1}{" "}
                                            <svg
                                              className="ms-2"
                                              xmlns="http://www.w3.org/2000/svg"
                                              id="Layer_1"
                                              data-name="Layer 1"
                                              viewBox="0 0 24 24"
                                              width="12"
                                              height="12"
                                            >
                                              <path d="m12,0C5.383,0,0,5.383,0,12s5.383,12,12,12,12-5.383,12-12S18.617,0,12,0Zm4.009,16.652c-.835.971-2.309,1.598-3.756,1.598h-.455c-2.783,0-5.048-2.284-5.048-5.091v-2.318c0-2.807,2.265-5.091,5.048-5.091h.455c1.485,0,2.904.71,3.797,1.9.332.442.242,1.069-.2,1.4-.442.332-1.068.241-1.399-.2-.509-.679-1.351-1.1-2.197-1.1h-.455c-1.709,0-3.048,1.357-3.048,3.091v2.318c0,1.733,1.339,3.091,3.048,3.091h.455c.861,0,1.782-.371,2.238-.902.362-.419.993-.465,1.41-.106.419.36.467.991.107,1.41Z" />
                                            </svg>
                                          </div>
                                        </td>
                                        <td>
                                          {" "}
                                          <div style={{ minWidth: "200px" }}>
                                          {child.product_code}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "150px" }}>
                                             {child.product_name || "N/A"}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "200px" }}>
                                            {child.categoryName || "N/A"}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "150px" }}>
                                            {child.currentStock ?? "N/A"}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "140px" }}>
                                            {child.quantity || 0}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "130px" }}>
                                            {child.usedRM || 0}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "130px" }}>
                                            {child.EstimatedProduction || 0}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "130px" }}>
                                            {child.produced || 0}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "130px" }}>
                                            {child.unit || "N/A"}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "130px" }}>
                                            {child.comment || "-"}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}

                                    {/* Alternative Raw Materials (A Icon) */}
                                    {alternatives.map((alt, altIndex) => (
                                      <tr
                                        key={alt.id}
                                        className="alternative_tr"
                                      >
                                        <td
                                          className="active_td"
                                          style={{
                                            backgroundColor: "rgb(250,234,207)",
                                          }}
                                        >
                                          <div style={{ whiteSpace: "nowrap" }}>
                                            {index + 1}.{altIndex + 1}{" "}
                                            <svg
                                              className="ms-2"
                                              xmlns="http://www.w3.org/2000/svg"
                                              id="Layer_1"
                                              data-name="Layer 1"
                                              viewBox="0 0 24 24"
                                              width="12"
                                              height="12"
                                            >
                                              <path d="m12,0C5.383,0,0,5.383,0,12s5.383,12,12,12,12-5.383,12-12S18.617,0,12,0Zm3.789,17.25l-.945-3h-5.691l-.943,3h-2.126l3.374-10.049c.621-1.411,1.465-1.701,2.542-1.701,1.077,0,1.922.29,2.526,1.658l3.39,10.092h-2.127Zm-6.007-5l1.295-4.119c.194-.408.542-.625.917-.631.388.005.736.223.9.555l1.321,4.195h-4.433Z" />
                                            </svg>{" "}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "200px" }}>
                                            {alt.product_code}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "150px" }}>
                                            {alt.product_name || "N/A"}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "200px" }}>
                                            {alt.categoryName || "N/A"}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "150px" }}>
                                            {alt.currentStock ?? "N/A"}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "140px" }}>
                                            {alt.quantity || 0}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "130px" }}>
                                            {alt.usedRM || 0}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "130px" }}>
                                            {alt.EstimatedProduction || 0}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "130px" }}>
                                            {alt.produced || 0}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "130px" }}>
                                            {alt.unit || "N/A"}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ minWidth: "130px" }}>
                                            {alt.comment || "-"}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </React.Fragment>
                                );
                              })
                          ) : (
                            <tr>
                              <td colSpan="11" className="text-center">
                                No raw materials found.
                              </td>
                            </tr>
                          )}
                          </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </Collapse>
            </div>

            {/* Routing Section */}
            <div className="card shadow-none border">
              <div className="card-header border-bottom-0 d-flex flex-wrap justify-content-between align-items-center flex-wrap">
                <h6 className="my-1 me-3">
                  <span className="me-3">Routing</span>
                  <Tooltip title="Routing to produce the Finished Goods">
                    <i className="fas fa-info-circle text-primary"></i>
                  </Tooltip>
                </h6>
              </div>
              <Collapse in={openRouting}>
                <div className="card-body border-top bg-light rounded-bottom-10 pb-1">
                  <div className="route_wrap">
                    {productionData?.routing?.length > 0 ? (
                      productionData.routing.map((route, index) => (
                        <div className="route_item" key={route.sequence}>
                          <div className="route_header">
                            <div
                              className={
                                route.mark_done === 1
                                  ? "route_number completed__route"
                                  : "route_number"
                              }
                            >
                              {route.mark_done === 1 ? (
                                <i class="fas fa-check"></i>
                              ) : (
                                route.sequence
                              )}
                            </div>
                            <hr />
                          </div>
                          <div className="route_body">
                            <h6 className="route_name">
                              {route.route_id}:{route.route_name}
                            </h6>
                            <div className="route_comment">
                              <div className="route_p">
                                {route.change_fg_qty}{" "}
                                {productionData?.finishedGoods[0].unit} /{" "}
                                {productionData?.finishedGoods[0].quantity}{" "}
                                {productionData?.finishedGoods[0].unit} (
                                {route.completion}%)
                                <br />
                                {route.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="12" className="text-center">
                          No Routing Found.
                        </td>
                      </tr>
                    )}
                  </div>
                </div>
              </Collapse>
            </div>

            {/* Scrap Section */}
            <div className="card shadow-none border">
              <div className="card-header border-bottom-0 d-flex flex-wrap justify-content-between align-items-center">
                <h6 className="my-1 me-3">
                  <span className="me-3">Scrap</span>
                  <Tooltip title="Scrap Generated from producing the Finished Goods">
                    <i className="fas fa-info-circle text-primary"></i>
                  </Tooltip>
                </h6>
              </div>
              <Collapse in={openScrap}>
                <div className="card-body border-top bg-light rounded-bottom-10 pb-1">
                  <div className="table-responsive">
                    <table className="table table-bordered primary-table-head">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Item ID</th>
                          <th>Item Name</th>
                          <th>Item Category</th>
                          <th>Estimated Quantity</th>
                          <th>Actual Quantity</th>
                          <th>Unit</th>
                          <th>Cost Allocation (%)</th>
                          <th>Comment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productionData?.rawMaterials?.length > 0 ? (
                          productionData.scrapItems.map((scrap, index) => (
                            <tr>
                              <td>{index + 1}</td>
                              <td>
                                <div style={{ minWidth: "200px" }}>
                                  {scrap.product_code || "N/A"}
                                </div>
                              </td>
                              <td>
                                <div style={{ minWidth: "200px" }}>
                                  {scrap.product_name || "N/A"}
                                </div>
                              </td>
                              <td>
                                <div style={{ minWidth: "200px" }}>
                                  {scrap.category_name || "N/A"}
                                </div>
                              </td>
                              <td>
                                <div
                                  style={{ minWidth: "150px" }}
                                  className="fs-5"
                                >
                                  {scrap.estimatedquantity || "N/A"}
                                </div>
                              </td>
                              <td>
                                <div
                                  style={{ minWidth: "150px" }}
                                  className="fs-5"
                                >
                                  {scrap.actualquantity || "N/A"}
                                </div>
                              </td>
                              <td>
                                <div style={{ minWidth: "100px" }}>
                                  {scrap.scrap_unit || "N/A"}
                                </div>
                              </td>
                              <td>
                                <div
                                  style={{ minWidth: "150px" }}
                                  className="fs-5"
                                >
                                  {scrap.costAllocation}
                                </div>
                              </td>
                              <td>
                                <div style={{ minWidth: "200px" }}>
                                  {scrap.comment || "N/A"}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="12" className="text-center">
                              No Scrap Found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* if no data in table then this div appear */}
                </div>
              </Collapse>
            </div>

            {/* Other Section */}
            <div className="card shadow-none border">
              <div className="card-header border-bottom-0 d-flex flex-wrap justify-content-between align-items-center">
                <h6 className="my-1 me-3">
                  <span className="me-3">Other Charges</span>
                  <Tooltip title="Other Charges incurred">
                    <i className="fas fa-info-circle text-primary"></i>
                  </Tooltip>
                </h6>
              </div>
              <Collapse in={openScrap}>
                <div className="card-body border-top bg-light rounded-bottom-10 pb-1">
                  <div className="table-responsive">
                    <table className="table table-bordered primary-table-head mb-0">
                      <thead>
                        <tr>
                          <th>
                            <div>#</div>
                          </th>
                          <th>
                            <div>Classification</div>
                          </th>
                          <th>
                            <div className="text-end">Estimated Amount</div>
                          </th>
                          <th>
                            <div className="text-end">Actual Amount</div>
                          </th>
                          <th>
                            <div>Comment</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <div>1</div>
                          </td>
                          <td>
                            <div style={{ minWidth: "250px" }}>
                              Labour Charges
                            </div>
                          </td>
                          <td>
                            <div
                              style={{ minWidth: "200px" }}
                              className="text-end f-s-16 fw-medium"
                            >
                              {getGeneralSettingssymbol}
                              {productionData?.production.labour_charges.toFixed(
                                2
                              )}
                            </div>
                          </td>
                          <td>
                            <div
                              style={{ minWidth: "200px" }}
                              className="text-end f-s-16 fw-medium"
                            >
                              {getGeneralSettingssymbol}
                              {productionData?.production.labourChargesAA.toFixed(
                                2
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ minWidth: "250px" }}>
                              {productionData?.production
                                .labourCharges_comment ||
                                productionData?.bomDetails
                                  .labour_charges_comment}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div>2</div>
                          </td>
                          <td>
                            <div style={{ minWidth: "250px" }}>
                              Machinery Charges
                            </div>
                          </td>
                          <td>
                            <div
                              style={{ minWidth: "200px" }}
                              className="text-end f-s-16 fw-medium"
                            >
                              {getGeneralSettingssymbol}
                              {productionData?.production.machinery_charges.toFixed(
                                2
                              )}
                            </div>
                          </td>
                          <td>
                            <div
                              style={{ minWidth: "200px" }}
                              className="text-end f-s-16 fw-medium"
                            >
                              {getGeneralSettingssymbol}
                              {productionData?.production.machineryChargesAA.toFixed(
                                2
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ minWidth: "250px" }}>
                              {productionData?.production
                                .machineryCharges_comment ||
                                productionData?.bomDetails
                                  .machinery_charges_comment}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div>3</div>
                          </td>
                          <td>
                            <div style={{ minWidth: "250px" }}>
                              Electricity Charges
                            </div>
                          </td>
                          <td>
                            <div
                              style={{ minWidth: "200px" }}
                              className="text-end f-s-16 fw-medium"
                            >
                              {getGeneralSettingssymbol}
                              {productionData?.production.electricity_charges.toFixed(
                                2
                              )}
                            </div>
                          </td>
                          <td>
                            <div
                              style={{ minWidth: "200px" }}
                              className="text-end f-s-16 fw-medium"
                            >
                              {getGeneralSettingssymbol}
                              {productionData?.production.electricityChargesAA.toFixed(
                                2
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ minWidth: "250px" }}>
                              {productionData?.production
                                .electricityCharges_comment ||
                                productionData?.bomDetails
                                  .electricity_charges_comment}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div>4</div>
                          </td>
                          <td>
                            <div style={{ minWidth: "250px" }}>
                              Other Charges
                            </div>
                          </td>
                          <td>
                            <div
                              style={{ minWidth: "200px" }}
                              className="text-end f-s-16 fw-medium"
                            >
                              {getGeneralSettingssymbol}
                              {productionData?.production.other_charges.toFixed(
                                2
                              )}
                            </div>
                          </td>
                          <td>
                            <div
                              style={{ minWidth: "200px" }}
                              className="text-end f-s-16 fw-medium"
                            >
                              {getGeneralSettingssymbol}
                              {productionData?.production.otherChargesAA.toFixed(
                                2
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ minWidth: "250px" }}>
                              {productionData?.production
                                .otherCharges_comment ||
                                productionData?.bomDetails
                                  .other_charges_comment}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </Collapse>
            </div>
            {productionData?.production.status != 5 ? (
              <>
                {!isCheckedProcessCost && (
                  <div className="d-flex justify-content-end flex-wrap gap-3 position-sticy bottom-0 py-2 bg-white border-top">
                    <Dropdown align="end">
                      <Dropdown.Toggle
                        variant="success"
                        className="btn btn-success"
                      >
                        Take Action
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="">
                        <button
                          type="button"
                          className="dropdown-item d-flex align-items-center f-s-14"
                          onClick={() => {
                            handleShowProcessStartModal();
                           
                          }}
                        >
                          <i className="fas fa-redo text-success me-2"></i>
                          <span className="text-nowrap">Start Process</span>
                        </button>
                        {productionData?.production?.is_action !==
                          "bulk_update" &&
                          productionData?.production?.is_action !==
                            "process" && (
                            <button
                              type="button"
                              className="dropdown-item d-flex align-items-center f-s-14"
                              onClick={handleShow}
                            >
                              <i className="fas fa-tasks text-success me-2"></i>
                              <span className="text-nowrap">
                                Bulk Issue/Produce
                              </span>
                            </button>
                          )}
                        <button
                          type="button"
                          className="dropdown-item d-flex align-items-center f-s-14"
                          onClick={donehandleShow}
                        >
                          <i className="fas fa-check text-success me-2"></i>
                          <span className="text-nowrap">Complete Process</span>
                        </button>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>

      <Modal
        id="bulk-issue-modal"
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            Are you sure you want to issue material in bulk for this process and
            all sub processes?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="delete-confirm-wrap d-flex align-items-start">
            <div className="delete-confirm-icon mb-3 text-center me-3 mt-1">
              <i className="fas fa-exclamation-triangle text-danger fs-1"></i>
            </div>
            <div>
              <p className="text-muted f-s-14 mb-1">
                1. All RM's will be issued. <br /> 2. All FG's / SFG's will be
                produced and passed.
              </p>
              <p className="text-muted f-s-14 mb-1 fw-bold">
                Do you want to continue?
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-content-center bg-light">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
          >
            <i className="far fa-times-circle me-2"></i>No
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirmIssue}
            disabled={loading}
          >
            <i className="far fa-check-circle me-2"></i>Yes
          </button>
        </Modal.Footer>
      </Modal>

      <Modal
        id="done-issue-modal"
        show={doneshow}
        onHide={donehandleClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            Are you sure you want to complete the Production process?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="delete-confirm-wrap d-flex align-items-start">
            <div className="delete-confirm-icon mb-3 text-center me-3 mt-1">
              <i className="fas fa-exclamation-triangle text-danger fs-1"></i>
            </div>
            <div>
              <p className="text-muted f-s-14 mb-1">
                Note: All sub-processes will be marked as complete. Total FG
                Produced Finished Good
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-content-center bg-light">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={donehandleClose}
          >
            <i className="far fa-times-circle me-2"></i>Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={donehandleConfirmIssue}
            disabled={loading}
          >
            <i className="far fa-check-circle me-2"></i>Complete
          </button>
        </Modal.Footer>
      </Modal>

      {/* Revert Complete Modal */}
      <RevertCompleteModal
        show={showRevertCompleteModal}
        onClose={handleCloseRevertCompleteModal}
      />
      {/* Cancel Process Modal */}
      <CancelProcessModal
        show={showCancelProcessModal}
        onClose={handleCloseCancelProcessModal}
      />
      {/* Process History Modal */}
      <ProcessHistoryModal
        show={showProcessHistoryModal}
        onClose={handleCloseProcessHistoryModal}
        historyData={historyData}
      />

      {/* Barcode Numbers View Modal Start*/}
      <BarcodeNumbersViewModal
        show={showBarcodeNumbersViewModal}
        handleClose={handleCloseBarcodeNumbersViewModal}
        createBarcodeModal={handleShowBarcodeNumbersCreateModal}
      />
      {/* Barcode Numbers View Modal end*/}
      {/* Barcode Numbers Add Modal Start*/}
      <BarcodeNumbersCreateModal
        show={showBarcodeNumbersCreateModal}
        handleClose={handleCloseBarcodeNumbersCreateModal}
      />
      {/* Barcode Numbers Add Modal end*/}

      {/* Edit Other Chanrges Modal Start*/}
      <EditOtherChargesModal
        show={showEditOtherChargesModal}
        handleClose={handleCloseEditOtherChargesModal}
      />
      {/* Edit Other Chanrges Modal end*/}
      {/* Delete Modal */}
      <DeleteModal show={deleteShow} handleClose={deleteModalClose} />

      {/* Process Start Modal Start*/}
      <ProcessStartModal
        show={showProcessStartModal}
        productionData={productionData}
        setProductionData={setProductionData}
        handleClose={handleCloseProcessStartModal}
      />
      {/* Process Start Modal end*/}
    </>
  );
};

export default ViewProductionProcess;
