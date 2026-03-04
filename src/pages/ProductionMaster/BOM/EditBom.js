import React, { useEffect, useState } from "react";
import { Form, Row, Col, Table, Collapse, Modal } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./BOMPage.css";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Tooltip } from "antd";
import Select from "react-select";

import DeleteModal from "../../CommonComponent/DeleteModal";
import ManageRouting from "./ManageRouting";
import SelectRoutingModal from "./SelectRoutingModal";
import {
  PrivateAxios,
  PrivateAxiosFile,
} from "../../../environment/AxiosInstance";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileImage,
  faFileAlt,
  faFile,
} from "@fortawesome/free-solid-svg-icons";
import {
  ErrorMessage,
  SuccessMessage,
} from "../../../environment/ToastMessage";
import { UserAuth } from "../../auth/Auth";

const EditBom = () => {
  const navigate = useNavigate();
  // page redirection side bar collapse
  const location = useLocation();
  const { userDetails } = UserAuth();

  const { data } = location.state || {};
  console.log(data);
  //collapse
  const [open, setOpen] = useState(true);
  const [openSnapshot, setOpenSnapshot] = useState(true);
  const [openFinishedGoods, setOpenFinishedGoods] = useState(true);
  const [openRawMaterials, setOpenRawMaterials] = useState(true);
  const [openRouting, setOpenRouting] = useState(true);

  const [stores, setStores] = useState([]);
  const [FGStore, setFGStore] = useState(null);
  const [RMStore, setRMStore] = useState(null);

  const [finishItems, setFinishItems] = useState([]);
  const [selectedFinishId, setSelectedFinishId] = useState("");
  const [selectedFinishName, setSelectedFinishName] = useState("");
  const [currentFinishItem, setCurrentFinishItem] = useState({
    id: "",
    name: "",
    category: "",
    unit: "",
    quantity: "",
    costAllocation: "",
    comment: "",
  });

  const { id } = useParams();
  const [rowsRawMaterial, setRowsRawMaterial] = useState([]);
  const [routingComments, setRoutingComments] = useState({});
  useEffect(() => {
    if (data) {
      setRowsRawMaterial(
        data.rawMaterials.map((item) => ({
          ...item,
          product_name: item.name,
          Categories: { title: item.category },
          Masteruom: { unit_name: item.unit },
        }))
      );
      setSequenceData(data.routing);
      data.routing?.map((item) => {
        setRoutingComments((prev) => ({
          ...prev,
          [item.id]: item.comment,
        }));
      });
    }
  }, []);
  const formatDate = (isoDate) => {
    return new Date(isoDate).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };
  
  useEffect(() => {
    if (data && data.finishedGoods && data.finishedGoods.length > 0) {
      setCurrentFinishItem({
        id: data.finishedGoods[0].id || "",
        product_code: data.finishedGoods[0].product_code || "",
        product_name: data.finishedGoods[0].name || "",
        category: data.finishedGoods[0].category || "",
        unit: data.finishedGoods[0].unit || "",
        quantity: data.finishedGoods[0].quantity || "",
        costAllocation: data.finishedGoods[0].costAllocation || "",
        comment: data.finishedGoods[0].comment || "", 
      });
    }
  }, [data]);
  useEffect(() => {
    if (stores.length > 0) {
      // Set FG Store
      const selectedFG = stores.find(
        (store) => store.id === Number(data?.FGStore)
      );
      if (selectedFG) {
        setFGStore({ value: selectedFG.id, label: selectedFG.name });
      }

      // Set RM Store
      const selectedRM = stores.find(
        (store) => store.id === Number(data?.RMStore)
      );
      if (selectedRM) {
        setRMStore({ value: selectedRM.id, label: selectedRM.name });
      }
    }
  }, [stores]); // Only run when `stores` are available

  const [formData, setFormData] = useState({
    bomNumber: data?.bomNumber || "",
    documentName: data?.documentName || "",
    //FGStore: data?.FGStore || "",
    //RMStore: data?.RMStore || "",
    description: data?.description || "",
  });

  const [finishedGoods, setFinishedGoods] = useState(data?.finishedGoods || []);
  const [rawMaterials, setRawMaterials] = useState(data?.rawMaterials || []);
  const [routing, setRouting] = useState(data?.routing || []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    // Fetch stores
    const fetchStores = async () => {
      const result = await PrivateAxios.get("/warehousesselect");
      const filteredStores = result.data.data.filter(
        (store) => store.store_type === "In-Stock Stores"
      );
      setStores(filteredStores);
    };
    fetchStores();
  }, []);

  // Manage Routing Modal start
  const [showManageRoutingModal, setShowManageRoutingModal] = useState(false);
  const handleCloseManageRoutingModal = () => setShowManageRoutingModal(false);
  const handleShowManageRoutingModal = () => setShowManageRoutingModal(true);
  // Select Routing Modal start
  const [showSelectRoutingModal, setShowSelectRoutingModal] = useState(false);
  const handleCloseSelectRoutingModal = () => setShowSelectRoutingModal(false);
  const handleShowSelectRoutingModal = () => setShowSelectRoutingModal(true);
  //delete modal
  const [deleteShow, setDeleteShow] = useState(false);
  const deleteModalClose = () => setDeleteShow(false);
  const deleteModalShow = () => setDeleteShow(true);
  const [bomNumber, setBOM] = useState("");
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  // Load existing attachments when `data` is available
  console.log(existingFiles, "ssss");

  useEffect(() => {
    if (data?.attachments) {
      try {
        let cleanedString = data.attachments;

        // Step 1: Remove outer quotes if they exist (fixes double-encoding issue)
        if (cleanedString.startsWith('"') && cleanedString.endsWith('"')) {
          cleanedString = cleanedString.slice(1, -1);
        }

        // Step 2: Parse JSON safely
        const parsedAttachments = JSON.parse(cleanedString);

        // Step 3: Ensure it is an array before setting state
        setExistingFiles(
          Array.isArray(parsedAttachments) ? parsedAttachments : []
        );
      } catch (error) {
        console.error("Error parsing attachments:", error);
        setExistingFiles([]); // Default to an empty array on error
      }
    }
  }, [data]);

  // Handle file selection (new uploads)
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]); // Merge with previous
  };

  // Handle delete existing attachment
  const deleteExistingFile = (index) => {
    setExistingFiles((prev) => prev.filter((_, i) => i !== index)); // Remove selected file
  };

  // Handle delete newly uploaded file
  const deleteNewFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index)); // Remove selected file
  };

  const getTaskData = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleRoutingCommentChange = (routeId, value) => {
    setRoutingComments((prev) => ({
      ...prev,
      [routeId]: value,
    }));
  };

  const handleDeleteFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };
  //end files selected on change

  // Create an array of 5 items
  const routes = Array.from({ length: 5 }, (_, index) => ({
    number: index + 1,
    name: `Routing #${index + 1} : R${index + 1}`,
  }));

  //======================Get Router=======================//

  const [routesAll, setRoutes] = useState([]);
  const GetRoute = () => {
    PrivateAxios.get("production/get-production-route")
      .then((res) => {
        setRoutes(res.data.data);
      })
      .catch((err) => {});
  };
  useEffect(() => {
    GetRoute();
  }, []);

  //=================Sequence Router==================//
  const [sequenceData, setSequenceData] = useState([]);
  const GetSequenceProductComment = () => {
    PrivateAxios.get("production/get-sequence-production-route")
      .then((res) => {
        setSequenceData(res.data.data);
        // setAllRoute(prevent => prevent.filter(item => !res.data.data.includes(item.id)))
      })
      .catch((err) => {});
  };
  // useEffect(() => {
  //   GetSequenceProductComment();
  // }, []);
  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const queryParam = selectedFinishId
          ? `product_code=${selectedFinishId}`
          : selectedFinishName
          ? `product_name=${selectedFinishName}`
          : "";
        if (!queryParam) return; // Prevent unnecessary API calls
        const response = await PrivateAxios.get(
          `/production/finishedgoods-select?${queryParam}`
        );
        if (response.data?.data) {
          setCurrentFinishItem((prev) => ({
            ...prev,
            ...response.data.data,
            quantity: 1,
            costAllocation: 100,
          }));
        }
      } catch (error) {
        console.error("Error fetching item details:", error);
      }
    };

    fetchItemDetails();
  }, [selectedFinishId, selectedFinishName]);
  //====================Finished Goods===============
  //Fetch all items for dropdown options (ID and Name)
  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        const response = await PrivateAxios.get(`/product/list`);
        setFinishItems(response.data.data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    fetchAllItems();
  }, []);
  //====================end Finished Goods===============
  // ============================= start RAW Matiarials ====================

  const [rawMaterialItems, setRawMaterialItems] = useState([]);

  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        const response = await PrivateAxios.get(`/product/list`);
        setRawMaterialItems(response.data.data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchAllItems();
  }, []);

  const fetchItemDetailsRawMat = async (queryParam, index) => {
    try {
      if (!queryParam) return;
      const response = await PrivateAxios.get(
        `/production/finishedgoods-select?${queryParam}`
      );
      if (response.data?.data) {
        setRowsRawMaterial((prevRows) =>
          prevRows.map((row, rowIndex) =>
            rowIndex === index
              ? {
                  ...row,
                  ...response.data.data,
                  quantity: row.quantity || 1,
                  comment: "",
                }
              : row
          )
        );
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  };

  const addRowRawMaterial = () => {
    if (rowsRawMaterial.length === 0) {
      setRowsRawMaterial([
        {
          id: "",
          name: "",
          category: "",
          unit: "",
          quantity: "",
          costAllocation: "",
          comment: "",
        },
      ]);
    } else {
      const lastRow = rowsRawMaterial[rowsRawMaterial.length - 1];
      if (lastRow?.product_code || lastRow?.product_name) {
        setRowsRawMaterial((prevRows) => [
          ...prevRows,
          {
            id: "",
            name: "",
            category: "",
            unit: "",
            quantity: "",
            costAllocation: "",
            comment: "",
          },
        ]);
      } else {
        ErrorMessage(
          "Please select either ID or Name before adding a new row."
        );
      }
    }
  };

  const removeRowRawMaterial = (index) => {
    setRowsRawMaterial((prevRows) =>
      prevRows.filter((_, rowIndex) => rowIndex !== index)
    );
  };

  const handleRowChangeRawMaterial = (index, field, value) => {
    setRowsRawMaterial((prevRows) =>
      prevRows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    );

    if (field === "id") {
      fetchItemDetailsRawMat(`product_code=${value}`, index);
    } else if (field === "name") {
      fetchItemDetailsRawMat(`product_name=${value}`, index);
    }
  };

  // EditBom.js
  const updateBOM = async () => {
    try {
      let newFileUrls = [];

      // Upload only if new files are selected
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });

        const response = await PrivateAxiosFile.post(
          "/production/upload-files",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        newFileUrls = response.data.fileUrls;
      }

      // If no new files are uploaded, keep only existing files
      const updatedAttachments =
        newFileUrls.length > 0
          ? [...existingFiles, ...newFileUrls]
          : existingFiles;

      const payload = {
        bomNumber: formData.bomNumber,
        documentName: formData.documentName,
        FGStore: FGStore?.value,
        RMStore: RMStore?.value,
        ...(files.length > 0 && { attachments: updatedAttachments }),
        description: formData.description,
        modif_user_id: userDetails.id,
        finishedGoods: [currentFinishItem].map((item) => ({
          product_id: item.id,
          product_code: item.product_code,
          name: item.product_name,
          category: item.Categories?.title || "Unknown",
          unit: item.Masteruom?.unit_name || "N/A",
          quantity: item.quantity,
          costAllocation: item.costAllocation,
          comment: item.comment || "",
        })),
        rawMaterials: rowsRawMaterial.map((item) => ({
          product_id: item.id,
          product_code: item.product_code,
          name: item.product_name,
          category: item.Categories?.title || "Unknown",
          unit: item.Masteruom?.unit_name || "N/A",
          quantity: item.quantity,
          comment: item.comment || "",
        })),
        routing: sequenceData.map((route) => ({
          route_id: route.route_id,
          route_name: route.route_name,
          sequence: route.sequence,
          comment: routingComments[route.id] || "",
        })),
        company_id: userDetails.company_id,
       
      };

      console.log("Final Payload Before Sending:", payload);

      // Uncomment to update BOM
      const response = await PrivateAxios.put(`/production/update-bom/${id}`, payload);
      const lastCreatedBOMId = id;
      if (response) {
        navigate(`/production/bom/view-bom/${lastCreatedBOMId}`);
     }
      SuccessMessage("BOM updated successfully!");
    } catch (error) {
      console.error("Error updating BOM:", error);
    }
  };

  return (
    <>
      <div className="p-4">
        <div className="mb-4">
          <Link to="/production/bom" className="text-dark">
            <i className="fas fa-arrow-left"></i>
            <span className="ms-2 f-s-16">Back</span>
          </Link>
        </div>

        <div className="card mb-0">
          <div className="card-header">
            <h5 className="card-title mb-1">Update Bill of Material (BOM)</h5>
            <div className="d-flex flex-wrap align-items-center justify-content-between w-100">
              <p className="my-1 fw-medium text-muted f-s-14">
                Create new bill of material by adding raw material and routing
                required to get the finished product.
              </p>
              <p className="my-1 fw-medium text-muted f-s-14">
                Last Modified Date : {formatDate(data?.updated_at)}
              </p>
            </div>
          </div>
          <div className="card-body">
            {/* Document Detail Section */}
            <div className="card shadow-none border">
              <div className="card-header border-bottom-0 d-flex justify-content-between align-items-center">
                <h6 className="my-1 me-3">
                  <span className="me-3">Document Detail</span>
                  <Tooltip title="You can add basic details of the Bill of Material here and also attach files">
                    <i className="fas fa-info-circle text-primary"></i>
                  </Tooltip>
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
                  <Form>
                    <div className="row">
                      <Col lg={4} md={6} sm={12}>
                        <div className="form-group" controlId="docDate">
                          <label className="form-label">Document Number</label>
                          <div className="custom-select-wrap">
                            <input
                              type="text"
                              name="document_number"
                              value={formData.bomNumber}
                              className="form-control"
                              readOnly
                            />
                          </div>
                        </div>
                      </Col>
                      <Col lg={4} md={6} sm={12}>
                        <div className="form-group" controlId="docNo">
                          <label className="form-label">Document Name</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Document Name"
                            value={formData.documentName}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                documentName: e.target.value, // Properly update documentName
                              }))
                            }
                            name="document_name"
                          />
                        </div>
                      </Col>

                      <Col lg={4} md={6} sm={12}>
                        <div className="form-group" controlId="docDate">
                          <label className="form-label">FG Store</label>
                          <div className="custom-select-wrap">
                            <Select
                              options={stores.map((store) => ({
                                value: store.id,
                                label: store.name,
                              }))}
                              value={FGStore}
                              onChange={(item) => setFGStore(item)}
                              placeholder="Select Store"
                            />
                          </div>
                        </div>
                      </Col>
                      <Col lg={4} md={6} sm={12}>
                        <div className="form-group" controlId="docDate">
                          <label className="form-label">RM Store</label>
                          <div className="custom-select-wrap">
                            <Select
                              options={stores.map((store) => ({
                                value: store.id,
                                label: store.name,
                              }))}
                              value={RMStore}
                              onChange={(item) => setRMStore(item)}
                              placeholder="Select Store"
                            />
                          </div>
                        </div>
                      </Col>

                      <Col lg={12} md={12} sm={12}>
                        <div className="form-group" controlId="docDate">
                          <label className="form-label">Description</label>
                          <textarea
                            className="form-control"
                            rows={3}
                            value={formData.description}
                            onChange={getTaskData}
                            name="description"
                            placeholder="Enter Description"
                          ></textarea>
                        </div>
                      </Col>

                      <Col lg={6} md={12} sm={12}>
                        <div className="form-group" controlId="docDate">
                          <label className="form-label">Add Attachments</label>
                          <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="form-control"
                          />
                        </div>
                        {/* Show existing attachments with delete option */}
                        {existingFiles.length > 0 && (
                          <div className="form-group">
                            <label className="col-form-label">
                              Existing Attachments
                            </label>
                            <div className="erp_attachment_wrap">
                              {existingFiles.map((file, index) => (
                                <div
                                  className="erp_attachment_item"
                                  key={index}
                                >
                                  <div className="erp_attachment_icon">
                                    <i className="fas fa-file"></i>
                                  </div>
                                  <div className="erp_attachment_file text-truncate">
                                    <a
                                      href={`YOUR_FILE_BASE_URL/${file}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {file}
                                    </a>
                                  </div> <div className="erp_attachment_button">
                                                                      <Tooltip title="Remove">
                                                                        <button
                                                                          type="button"
                                                                          className="link-btn"
                                                                          onClick={() => deleteExistingFile(index)}
                                                                        >
                                                                          <i class="fas fa-trash-alt text-danger"></i>
                                                                        </button>
                                                                      </Tooltip>
                                                                    </div>
                                  
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Show newly uploaded files with delete option */}
                        {files.length > 0 && (
                          <div className="form-group">
                            <label className="col-form-label">
                              Newly Uploaded Files
                            </label>
                            <div className="erp_attachment_wrap">
                              {files.map((file, index) => (
                                <div
                                  className="erp_attachment_item"
                                  key={index}
                                >
                                  <div className="erp_attachment_icon">
                                    <i className="fas fa-file"></i>
                                  </div>
                                  <div className="erp_attachment_file text-truncate">
                                    {file.name}
                                  </div>
                                  <div className="erp_attachment_button">
                                                                      <Tooltip title="Remove">
                                                                        <button
                                                                          type="button"
                                                                          className="link-btn"
                                                                          onClick={() => deleteNewFile(index)}
                                                                        >
                                                                          <i class="fas fa-trash-alt text-danger"></i>
                                                                        </button>
                                                                      </Tooltip>
                                                                    </div>
                                  
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Col>
                    </div>
                  </Form>
                </div>
              </Collapse>
            </div>
            {/* BOM Snapshot */}
            <div className="card shadow-none border">
              <div className="card-header border-bottom-0 d-flex justify-content-between align-items-center">
                <h6 className="my-1 me-3">
                  <span className="me-3">BOM Snapshot</span>
                  <Tooltip title="Shows the real time overview of the BOM">
                    <i className="fas fa-info-circle text-primary"></i>
                  </Tooltip>
                </h6>
                <Tooltip title="Expand">
                  <button
                    type="button"
                    className="link-btn ms-auto"
                    onClick={() => setOpenSnapshot(!openSnapshot)}
                    aria-expanded={open}
                  >
                    <i className="fas fa-sort ms-2 line-height-1"></i>
                  </button>
                </Tooltip>
              </div>
              <Collapse in={openSnapshot}>
                <div className="card-body border-top bg-light rounded-bottom-10">
                  {/* for blank data start */}
                  <div className="blank_data text-center pb-3">
                    <img
                      src={
                        process.env.PUBLIC_URL + "/assets/images/sanapshot.png"
                      }
                      class="img-fluid"
                      alt=""
                    />
                  </div>
                  {/* for blank data end */}
                  {/* for data start */}
                  <div className="bom_data pb-3">
                    <div className="bom_data_top">
                      {rowsRawMaterial.length > 0 && (
                        <>
                          <div className="bom_pointer_item">
                            <p>Raw Material</p>
                            <h5>{rowsRawMaterial.length} Items</h5>
                            <i className="fas fa-eject text-warning line-height-1"></i>
                          </div>
                          <div className="pointer-divider second"></div>
                        </>
                      )}
                      {sequenceData.length > 0 && (
                        <div className="bom_pointer_item second">
                          <p>Process</p>
                          <h5>{sequenceData.length} Processes</h5>
                          <i className="fas fa-play text-primary line-height-1"></i>
                        </div>
                      )}

                      {sequenceData.length > 0 &&
                        currentFinishItem?.product_code && (
                          <div className="pointer-divider third"></div>
                        )}

                      {currentFinishItem?.product_code && (
                        <div className="bom_pointer_item third">
                          <p>Finished Goods</p>
                          <h5>1 Item</h5>
                          <i className="fas fa-square text-success line-height-1"></i>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* for data end */}
                  <div className="pt-3 px-3 d-flex gap-3 flex-wrap align-items-center border-top">
                    <p className="mb-0 d-flex align-items-center gap-2 f-s-14">
                      <i className="fas fa-eject text-warning line-height-1"></i>
                      Raw Materials
                    </p>
                    <p className="mb-0 d-flex align-items-center gap-2 f-s-14">
                      <i className="fas fa-play text-primary line-height-1"></i>
                      Processes
                    </p>
                    <p className="mb-0 d-flex align-items-center gap-2 f-s-14">
                      <i className="fas fa-square text-success line-height-1"></i>
                      Finished Goods
                    </p>
                  </div>
                </div>
              </Collapse>
            </div>

            {/* Finished Goods Section */}
            <div className="card shadow-none border">
              <div className="card-header border-bottom-0 d-flex justify-content-between align-items-center">
                <h6 className="my-1 me-3">
                  <span className="me-3">Finished Goods</span>
                  <Tooltip title="Add the Goods that are created when this BOM is processed.">
                    <i className="fas fa-info-circle text-primary"></i>
                  </Tooltip>
                </h6>
                <Tooltip title="Expand">
                  <button
                    type="button"
                    className="link-btn ms-auto"
                    onClick={() => setOpenFinishedGoods(!openFinishedGoods)}
                    aria-expanded={open}
                  >
                    <i className="fas fa-sort ms-2 line-height-1"></i>
                  </button>
                </Tooltip>
              </div>
              <Collapse in={openFinishedGoods}>
                <div className="card-body border-top bg-light rounded-bottom-10 pb-1">
                  <div className="table-responsive">
                    <table className="table table-bordered primary-table-head mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Item Category</th>
                          <th>Quantity</th>
                          <th>Unit</th>
                          <th>Cost Allocation (%)</th>
                          <th>Comment</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className>
                          <td>1</td>
                          <td>
                            <div className="width-150">
                              <select
                                className="form-select"
                                value={currentFinishItem?.product_code}
                                onChange={(e) => {
                                  setSelectedFinishId(e.target.value);
                                  setSelectedFinishName("");
                                }}
                              >
                                <option value="">Select ID</option>
                                {finishItems.map((item) => (
                                  <option
                                    key={item.id}
                                    value={item.product_code}
                                  >
                                    {item.product_code}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td>
                            <div className="width-200">
                              <select
                                value={currentFinishItem?.product_name || "N/A"}
                                className="form-select"
                                onChange={(e) => {
                                  setSelectedFinishName(e.target.value);
                                  setSelectedFinishId("");
                                }}
                              >
                                <option value="">Select Name</option>
                                {finishItems.map((item) => (
                                  <option
                                    key={item.id}
                                    value={item.product_name}
                                  >
                                    {item.product_name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td>
                            <div style={{ width: "100px" }}>
                              {currentFinishItem?.Categories?.title ||
                                data.finishedGoods[0].category}
                            </div>
                          </td>
                          <td>
                            <div style={{ width: "100px" }}>
                              <input
                                type="number"
                                className="form-control"
                                placeholder="Quantity"
                                value={currentFinishItem.quantity}
                                onChange={(e) =>
                                  setCurrentFinishItem({
                                    ...currentFinishItem,
                                    quantity: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </td>
                          <td>
                            {currentFinishItem?.Masteruom?.unit_name ||
                              data.finishedGoods[0].unit}
                          </td>
                          <td>
                            <div style={{ width: "120px" }}>
                              <input
                                className="form-control"
                                type="number"
                                value={currentFinishItem.costAllocation}
                                onChange={(e) =>
                                  setCurrentFinishItem({
                                    ...currentFinishItem,
                                    costAllocation: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </td>
                          <td>
                            <div style={{ width: "150px" }}>
                              <input
                                type="text"
                                className="form-control"
                                value={currentFinishItem.comment || ""}
                                onChange={(e) =>
                                  setCurrentFinishItem((prev) => ({
                                    ...prev,
                                    comment: e.target.value, 
                                  }))
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </Collapse>
            </div>

            {/* Raw Materials Section */}
            <div className="card shadow-none border">
              <div className="card-header border-bottom-0 d-flex justify-content-between align-items-center">
                <h6 className="my-1 me-3">
                  <span className="me-3">Raw Materials</span>
                  <Tooltip title="Add the raw materials required to produce the finished goods">
                    <i className="fas fa-info-circle text-primary"></i>
                  </Tooltip>
                </h6>
                <Tooltip title="Expand">
                  <button
                    type="button"
                    className="link-btn ms-auto"
                    onClick={() => setOpenRawMaterials(!openRawMaterials)}
                    aria-expanded={open}
                  >
                    <i className="fas fa-sort ms-2 line-height-1"></i>
                  </button>
                </Tooltip>
              </div>
              <Collapse in={openRawMaterials}>
                <div className="card-body border-top bg-light rounded-bottom-10">
                  <div className="table-responsive">
                    <table className="table table-bordered primary-table-head raw_material_table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Quantity</th>
                          <th>Unit</th>
                          <th>Comment</th>

                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rowsRawMaterial.length < 1 ? (
                          <tr>
                            <td colSpan={9}>
                              <div className="fs-7 text-center text-muted">
                                No data available
                              </div>
                            </td>
                          </tr>
                        ) : (
                          rowsRawMaterial.map((row, index) => (
                            <tr key={index} className="active_tr">
                              <td className="active_td">{index + 1}</td>
                              <td>
                                <div className="width-150">
                                  <select
                                    className="form-select"
                                    value={row?.product_code || "N/A"}
                                    onChange={(e) =>
                                      handleRowChangeRawMaterial(
                                        index,
                                        "id",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="">Select ID</option>
                                    {rawMaterialItems.map((item) => (
                                      <option
                                        key={item.id}
                                        value={item.product_code}
                                      >
                                        {item.product_code}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </td>
                              <td>
                                <div className="width-200">
                                  <select
                                    className="form-select"
                                    value={row?.product_name || "N/A"}
                                    onChange={(e) =>
                                      handleRowChangeRawMaterial(
                                        index,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="">Select Name</option>
                                    {rawMaterialItems.map((item) => (
                                      <option
                                        key={item.id}
                                        value={item.product_name}
                                      >
                                        {item.product_name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </td>
                              <td>
                                <div style={{ width: "150px" }}>
                                  {row?.Categories?.title || "N/A"}
                                </div>
                              </td>
                              <td>
                                <div style={{ width: "150px" }}>
                                  <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Quantity"
                                    value={row.quantity}
                                    onChange={(e) =>
                                      handleRowChangeRawMaterial(
                                        index,
                                        "quantity",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </td>
                              <td>{row?.Masteruom?.unit_name || "N/A"}</td>
                              <td>
                                <div style={{ width: "150px" }}>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Comment"
                                    value={row.comment}
                                    onChange={(e) =>
                                      handleRowChangeRawMaterial(
                                        index,
                                        "comment",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Tooltip title="Remove">
                                    <button
                                      type="button"
                                      className="table-btn"
                                      onClick={() =>
                                        removeRowRawMaterial(index)
                                      }
                                    >
                                      <i className="fas fa-trash-alt text-danger"></i>
                                    </button>
                                  </Tooltip>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={addRowRawMaterial}
                  >
                    <i className="fas fa-plus me-2"></i>Add Raw Material Row
                  </button>
                </div>
              </Collapse>
            </div>

            {/* Routing Section */}
            <div className="card shadow-none border">
              <div className="card-header border-bottom-0 d-flex justify-content-between align-items-center flex-wrap">
                <h6 className="my-1 me-3">
                  <span className="me-3">Routing</span>
                  <Tooltip title="You can add the routing that will be run on Raw materials to produce FG.">
                    <i className="fas fa-info-circle text-primary"></i>
                  </Tooltip>
                </h6>
                <div className="d-flex flex-wrap align-items-center ms-auto gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-light btn-sm"
                    onClick={handleShowManageRoutingModal}
                  >
                    <i className="fas fa-sliders-h me-2"></i>Manage
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={handleShowSelectRoutingModal}
                  >
                    <i className="fas fa-check-circle me-2"></i>Select Routing
                  </button>
                  <Tooltip title="Expand">
                    <button
                      type="button"
                      className="link-btn ms-auto"
                      onClick={() => setOpenRouting(!openRouting)}
                      aria-expanded={open}
                    >
                      <i className="fas fa-sort ms-2 line-height-1"></i>
                    </button>
                  </Tooltip>
                </div>
              </div>
              <Collapse in={openRouting}>
                <div className="card-body border-top bg-light rounded-bottom-10 pb-1">
                  <div className="route_wrap">
                    {sequenceData.length > 0
                      ? sequenceData.map((route) => (
                          <div className="route_item">
                            <div className="route_header">
                              <div className="route_number">
                                {route.sequence}
                              </div>
                              <hr />
                            </div>
                            <div className="route_body">
                              <h6 className="route_name">{route.route_id} : {route.route_name}</h6>
                              <div className="route_comment">
                                <textarea
                                  placeholder="Add a Comment"
                                  className="form-control"
                                  rows={3}
                                  value={routingComments[route.id] || ""} // Bind value to state
                                  onChange={(e) =>
                                    handleRoutingCommentChange(
                                      route.id,
                                      e.target.value
                                    )
                                  } // Update state on change
                                ></textarea>
                              </div>
                            </div>
                          </div>
                        ))
                      : ""}
                  </div>
                </div>
              </Collapse>
            </div>

            <div className="d-flex justify-content-end gap-3">
              <button type="button" className="btn btn-outline-success">
                <i className="fi fi-br-clock-three me-2"></i>Save to Draft
              </button>
              <button
                type="submit"
                onClick={updateBOM}
                className="btn btn-success"
              >
                <i className="fas fa-save me-2"></i>Save BOM
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manage Routing Modal */}
      <ManageRouting
        routes={routesAll}
        setRoutes={setRoutes}
        GetRoute={GetRoute}
        GetSequenceProductComment={GetSequenceProductComment}
        show={showManageRoutingModal}
        handleClose={handleCloseManageRoutingModal}
      />
      {/* Select Routing Modal */}
      <SelectRoutingModal
        routes={routesAll}
        GetSequenceProductComment={GetSequenceProductComment}
        show={showSelectRoutingModal}
        handleClose={handleCloseSelectRoutingModal}
      />
      {/* Delete Modal */}
      <DeleteModal show={deleteShow} handleClose={deleteModalClose} />
    </>
  );
};

export default EditBom;
