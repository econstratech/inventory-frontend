import React, { useEffect, useState } from "react";
import { Form, Row, Col, Table, Collapse, Modal } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./BOMPage.css";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Tooltip } from "antd";
import Select from "react-select";
import AddAlternateItemModal from "./AddAlternateItemModal";
import RawMaterialAddAlternateItemModal from "./RawMaterialAddAlternateItemModal";
import LinkChildBomModal from "./LinkChildBomModal";
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
import { DropDownList } from "@progress/kendo-react-dropdowns";
const CreateBom = () => {
  const { userDetails } = UserAuth();
  const [finishedGoods, setFinishedGoods] = useState([
    {
      id: "",
      name: "",
      category: "",
      quantity: "",
      unit: "",
      costAllocation: "",
      comment: "",
    },
  ]);
  const navigate = useNavigate();
  const [rawMaterials, setRawMaterials] = useState([
    { id: "", name: "", category: "", quantity: "", unit: "", comment: "" },
  ]);

  const [otherCharges, setOtherCharges] = useState([
    { classification: "", amount: "", comment: "" },
  ]);

  const addRow = (setState, state) => setState([...state, {}]);

  const removeRow = (index, state, setState) => {
    const newState = [...state];
    newState.splice(index, 1);
    setState(newState);
  };

  // const handleInputChange = (index, event, state, setState) => {
  //   const { name, value } = event.target;
  //   const newState = [...state];
  //   newState[index][name] = value;
  //   setState(newState);
  // };
  // const finishedGoodsID = ["123456", "654321", "987654", "456789"];
  //collapse
  const [expandedDisableTableRow, setExpandedDisableTableRow] = useState({});
  const [open, setOpen] = useState(true);
  const [openSnapshot, setOpenSnapshot] = useState(true);
  const [openFinishedGoods, setOpenFinishedGoods] = useState(true);
  const [openRawMaterials, setOpenRawMaterials] = useState(true);
  const [openRouting, setOpenRouting] = useState(true);
  const [openScrap, setOpenScrap] = useState(true);

  const [stores, setStores] = useState([]);
  const [storescrap, setStorescrap] = useState([]);
  const [FGStore, setFGStore] = useState(null);
  const [RMStore, setRMStore] = useState(null);
  const [ScrapRejectStore, setScrapRejectStore] = useState(null);
  const [formData, setFormData] = useState({});
  const [bomNumber, setBOM] = useState("");
  const generateRandomBOM = () => {
    const randomBOM =
      "BOM" + Math.floor(10000000 + Math.random() * 90000000).toString();
    setBOM(randomBOM);
  };
  const getTaskData = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
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
  // page redirection side bar collapse
  const location = useLocation();

  const [rows, setRows] = useState([]);
  const [rowsrm, setRowsrm] = useState([]);

  useEffect(() => {
    if (location.pathname === "/production/bom/create-bom") {
      document.body.classList.add("sidebar-collapse");
    } else {
      document.body.classList.remove("sidebar-collapse");
    }
    return () => {
      document.body.classList.remove("sidebar-collapse");
    };
  }, [location.pathname]);
  // page redirection side bar collapse end
  // Fetch data from backend on ID or Name change
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
            quantity: prev.quantity || 1,
            costAllocation: prev.costAllocation || 100,
          }));
        }
      } catch (error) {
        console.error("Error fetching item details:", error);
      }
    };

    fetchItemDetails();
  }, [selectedFinishId, selectedFinishName]);

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

  useEffect(() => {
    // Fetch stores
    const fetchStores = async () => {
      const result = await PrivateAxios.get("/warehousesselect");
      const filteredStores = result.data.data.filter(
        (store) => store.store_type === "In-Stock Stores"
      );
      setStores(filteredStores);
    };
    const fetchStorescrap = async () => {
      const result = await PrivateAxios.get("/warehousesselect");
      const filteredStorescrap = result.data.data.filter(
        (store) => store.store_type === "Rejected Goods Stores"
      );
      setStorescrap(filteredStorescrap);
    };
    fetchStores();
    fetchStorescrap();
  }, []);

  // Add Alternate Item Modal start
  const [showAddAlternateItemModal, setShowAddAlternateItemModal] =
    useState(false);
  const handleCloseAddAlternateItemModal = () =>
    setShowAddAlternateItemModal(false);
  const handleShowAddAlternateItemModal = () =>
    setShowAddAlternateItemModal(true);
  // RawMaterial Add Alternate Item Modal start
  const [
    showRawMaterialAddAlternateItemModal,
    setShowRawMaterialAddAlternateItemModal,
  ] = useState(false);
  const [
    showRawMaterialAddAlternateItemModalId,
    setshowRawMaterialAddAlternateItemModalId,
  ] = useState("");
  const handleCloseRawMaterialAddAlternateItemModal = () => {
    setShowRawMaterialAddAlternateItemModal(false);
    setshowRawMaterialAddAlternateItemModalId("");
  };
  const handleShowRawMaterialAddAlternateItemModal = (id) => {
    setShowRawMaterialAddAlternateItemModal(true);
    setshowRawMaterialAddAlternateItemModalId(id);
  };
  const [routingComments, setRoutingComments] = useState({});
  // Link Child Modal start

  const [showLinkChildModalId, setShowLinkChildModalId] = useState(null);
  const [selectedRowData, setSelectedRowData] = useState("");

  const [showLinkChildModal, setShowLinkChildModal] = useState(false);

  const handleCloseLinkChildModal = () => {
    setShowLinkChildModal(false);
    setShowLinkChildModalId("");
  };

  const handleShowLinkChildModal = (rowIndex, name, category, product_code) => {
    console.log("Opening modal for row:", rowIndex);
    setShowLinkChildModalId(rowIndex); // 🔹 Store row index instead of null
    setSelectedRowData({ product_code });
    setShowLinkChildModal(true);
  };
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

  //table disable row show

  const handleToggleDisableTableRow = () => {
    setExpandedDisableTableRow(!expandedDisableTableRow);
  };

  const handleRoutingCommentChange = (routeId, value) => {
    setRoutingComments((prev) => ({
      ...prev,
      [routeId]: value,
    }));
  };
  //files selected on change
  const [files, setFiles] = useState([]);
  const fileIcons = {
    pdf: faFilePdf, // PDF icon
    docx: faFileWord, // Word icon
    doc: faFileWord,
    xlsx: faFileExcel, // Excel icon
    csv: faFileExcel,
    png: faFileImage, // Image icon
    jpg: faFileImage,
    jpeg: faFileImage,
    gif: faFileImage,
    txt: faFileAlt, // Text file icon
    default: faFile, // Default file icon
  };
  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    return fileIcons[extension] || fileIcons.default;
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) {
      console.error("No files selected.");
      return;
    }
    setFiles(selectedFiles);
  };
  const handleSaveRawMaterials = (rowId, newRawMaterials) => {
    setRowsRawMaterial((prevRows) =>
      prevRows.map((row, index) =>
        index === rowId
          ? {
              ...row,
              childMaterials: [
                ...(row.childMaterials || []),
                ...newRawMaterials.map((child) => ({
                  ...child,
                  baseQuantity: child.quantity,
                  quantity: row.quantity * child.quantity,
                  alternateItems: child.alternatives || [], // 🔹 Ensure alternateItems exists
                })),
              ],
            }
          : row
      )
    );

    setShowLinkChildModal(false);
  };

  console.log(showLinkChildModal, "ffff");

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

  // ============================= start RAW Matiarials ====================
  const [rowsRawMaterial, setRowsRawMaterial] = useState([]);
  const [rawMaterialItems, setRawMaterialItems] = useState([]);

  useEffect(() => {
    //GetSequenceProductComment();
  }, []);

  //========================== start scrap =============================
  const [rowsscrap, setRowsscrap] = useState([]);
  const [scrapItems, setScrapItems] = useState([]);
  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        const response = await PrivateAxios.get(`/product/list`);
        setScrapItems(response.data.data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchAllItems();
  }, []);

  // Fetch item details when either ID or Name changes
  const fetchItemDetails = async (queryParam, index) => {
    try {
      if (!queryParam) return;
      const response = await PrivateAxios.get(
        `/production/finishedgoods-select?${queryParam}`
      );
      if (response.data?.data) {
        setRowsscrap((prevRows) =>
          prevRows.map((row, rowIndex) =>
            rowIndex === index
              ? {
                  ...row,
                  ...response.data.data,
                  quantity: row.quantity || 1,
                  costAllocation: row.costAllocation || 100,
                }
              : row
          )
        );
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  };

  // Add a new empty row only if the last row has either ID or Name selected
  const addRowScrap = () => {
    // If there are no rows, just add the first one
    if (rowsscrap.length === 0) {
      setRowsscrap([
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
      // If the last row has either ID or Name selected, add another row
      const lastRow = rowsscrap[rowsscrap.length - 1];
      if (lastRow?.product_code || lastRow?.product_name) {
        setRowsscrap((prevRows) => [
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

  const removeRowScrap = (index) => {
    setRowsscrap((prevRows) =>
      prevRows.filter((_, rowIndex) => rowIndex !== index)
    );
  };

  const handleRowChangeScrap = (index, field, value) => {
    setRowsscrap((prevRows) =>
      prevRows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    );

    if (field === "id") {
      fetchItemDetails(`product_code=${value}`, index);
    } else if (field === "name") {
      fetchItemDetails(`product_name=${value}`, index);
    }
  };

  //========================== end scrap ================================

  // ============================= start RAW Matiarials ====================
  // const [rowsRawMaterial, setRowsRawMaterial] = useState([]);
  // const [rawMaterialItems, setRawMaterialItems] = useState([]);

  useEffect(() => {
    generateRandomBOM();
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
                  costAllocation: row.costAllocation || 100,
                  alternateItems: row.alternateItems || [],
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
    // If there are no rows, just add the first one
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
          alternateItems: [],
          childMaterials: [],
        },
      ]);
    } else {
      // If the last row has either ID or Name selected, add another row
      const lastRow = rowsRawMaterial[rowsRawMaterial.length - 1];
      if (lastRow?.id || lastRow?.name) {
        setRowsRawMaterial((prevRows) => [
          ...prevRows,
          {
            id: prevRows.length + 1,
            name: "",
            category: "",
            unit: "",
            quantity: "",
            costAllocation: "",
            comment: "",
            alternateItems: [],
            childMaterials: [],
          },
        ]);
      } else {
        ErrorMessage(
          "Please select either ID or Name before adding a new row."
        );
      }
    }
  };
  const finishedGoodsID = rowsRawMaterial.map((row) => row.product_code);
  const removeRowRawMaterial = (index) => {
    setRowsRawMaterial((prevRows) =>
      prevRows.filter((_, rowIndex) => rowIndex !== index)
    );
  };

  const handleRowChangeRawMaterial = (index, field, value) => {
    setRowsRawMaterial((prevRows) =>
      prevRows.map((row, rowIndex) => {
        if (rowIndex !== index) return row;

        let updatedChildMaterials = row.childMaterials || [];

        if (field === "quantity" && !isNaN(value) && value > 0) {
          updatedChildMaterials = updatedChildMaterials.map((child) => ({
            ...child,
            quantity: parseFloat(value) * parseFloat(child.baseQuantity || 1),
          }));
        }

        return {
          ...row,
          [field]: value,
          childMaterials: field === "id" ? [] : updatedChildMaterials,
        };
      })
    );
    if (field === "id") {
      fetchItemDetailsRawMat(`product_code=${value}`, index);
    } else if (field === "name") {
      fetchItemDetailsRawMat(`product_name=${value}`, index);
    }
  };

  // create bom ===========================
  const uploadFiles = async () => {
    if (!files || files.length === 0) {
      console.error("No files selected for upload.");
      return [];
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await PrivateAxiosFile.post(
        "/production/upload-files",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Uploaded Files:", response.data.fileUrls);
      return response.data.fileUrls;
    } catch (error) {
      console.error(
        "File Upload Error:",
        error.response?.data || error.message
      );
      return [];
    }
  };

  const saveBOM = async () => {
    try {
      const fileUrls = await uploadFiles();
      const payload = {
        bomNumber: bomNumber,
        documentName: formData.document_name,
        FGStore: FGStore?.value,
        RMStore: RMStore?.value,
        ScrapRejectStore: ScrapRejectStore?.value,
        attachments: fileUrls,
        description: formData.description,
        comment: formData.comment,
        labour_charges_amount: formData.labour_charges_amount,
        labour_charges_comment: formData.labour_charges_comment,
        machinery_charges_amount: formData.machinery_charges_amount,
        machinery_charges_comment: formData.machinery_charges_comment,
        electricity_charges_amount: formData.electricity_charges_amount,
        electricity_charges_comment: formData.electricity_charges_comment,
        other_charges_amount: formData.other_charges_amount,
        other_charges_comment: formData.other_charges_comment,

        finishedGoods: [currentFinishItem].map((item) => ({
          product_id: item.id,
          product_code: item.product_code,
          name: item.product_name,
          category: item.Categories?.title || "Unknown",
          unit: item.Masteruom?.unit_name || "N/A",
          quantity: item.quantity,
          costAllocation: item.costAllocation,
          comment: item.comment || "",
          alternate: rows.length,
        })),

        finishedGoodsAlternate: rows.map((item) => ({
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
          alternative: item.alternateItems || [], // ✅ Ensure alternative items are included

          // 🔹 Add childMaterials along with their alternative items
          childMaterials:
            item.childMaterials?.map((child) => ({
              product_id: child.product_id,
              product_code: child.product_code,
              name: child.name || "Unknown",
              category: child.category || "Unknown",
              unit: child.unit || "N/A",
              quantity: child.quantity,
              comment: child.comment || "-",
              alternative: child.alternateItems || [], // ✅ Ensure child alternative items are included
            })) || [],
        })),

        scrapItems: rowsscrap.map((item) => ({
          product_id: item.id,
          product_code: item.product_code,
          name: item.product_name,
          category: item.Categories?.title || "Unknown",
          unit: item.Masteruom?.unit_name || "N/A",
          quantity: item.quantity,
          costAllocation: item.costAllocation,
          comment: item.comment || "",
        })),

        routing: sequenceData.map((route) => ({
          route_id: route.route_id,
          route_name: route.route_name,
          sequence: route.sequence,
          comment: routingComments[route.id] || "",
        })),

        company_id: userDetails.company_id,
        user_id: userDetails.id,
      };

     // console.log("Payload Sent to API:", JSON.stringify(payload, null, 2));

      const response = await PrivateAxios.post(
        "/production/create-bom",
        payload
      );
      const lastCreatedBOMId = response.data?.bom?.id;

      if (lastCreatedBOMId) {
        navigate(`/production/bom/view-bom/${lastCreatedBOMId}`);
      }

      SuccessMessage("BOM saved successfully!");
    } catch (error) {
      console.error("Error saving BOM:", error?.response?.data || error);
    }
  };

  // end create bom ========================
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
            <h5 className="card-title mb-1">Create Bill of Material (BOM)</h5>
            <div className="d-flex flex-wrap align-items-center justify-content-between w-100">
              <p className="my-1 fw-medium text-muted f-s-14">
                Create new bill of material by adding raw material and routing
                required to get the finished product.
              </p>
              <p className="my-1 fw-medium text-muted f-s-14">
                Last Modified Date : 21/11/2024 - 17:30
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
                              value={bomNumber || ""}
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
                            onChange={getTaskData}
                            name="document_name"
                            className="form-control"
                            placeholder="Enter Document Name"
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
                              onChange={setFGStore}
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
                              onChange={setRMStore}
                              placeholder="Select Store"
                            />
                          </div>
                        </div>
                      </Col>
                      <Col lg={4} md={6} sm={12}>
                        <div className="form-group" controlId="docDate">
                          <label className="form-label">Scrap/Reject Store</label>
                          <div className='custom-select-wrap'>
                            
                            <Select
                              options={storescrap.map((store) => ({
                                value: store.id,
                                label: store.name,
                              }))}
                              onChange={setScrapRejectStore}
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
                            onChange={getTaskData}
                            rows={3}
                            name="description"
                            placeholder="Enter Description"
                          ></textarea>
                        </div>
                      </Col>
                      <Col lg={12} md={12} sm={12}>
                        <div className="form-group" controlId="docDate">
                          <label className="form-label">Comment</label>
                          <input
                            type="text"
                            placeholder="Enter Comment"
                            onChange={getTaskData}
                            name="comment"
                            className="form-control"
                          />
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
                        {files.length > 0 && (
                          <div className="form-group" controlId="docDate">
                            <label className="col-form-label">
                              ATTACHMENTS
                            </label>
                            <div className="erp_attachment_wrap">
                              {/* loop this item */}
                              {files.map((file, index) => (
                                <div
                                  key={index}
                                  className="erp_attachment_item"
                                >
                                  <div className="erp_attachment_icon">
                                    <FontAwesomeIcon
                                      icon={getFileIcon(file.name)}
                                    />
                                  </div>
                                  <div className="erp_attachment_file text-truncate">
                                    {file.name}{" "}
                                  </div>
                                  <div className="erp_attachment_button">
                                    <Tooltip title="Remove">
                                      <button
                                        type="button"
                                        className="link-btn"
                                        onClick={() => handleDeleteFile(index)}
                                      >
                                        <i class="fas fa-trash-alt text-danger"></i>
                                      </button>
                                    </Tooltip>
                                  </div>
                                </div>
                              ))}
                              {/* loop this item end*/}
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
                        <div className="bom_pointer_item">
                          <p>Raw Material</p>
                          <h5>2 Items</h5>
                          <i className="fas fa-eject text-warning line-height-1"></i>
                        </div>
                      )}
                      {rowsRawMaterial.length > 0 && (
                        <div className="pointer-divider second"></div>
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
                    {rowsscrap.length > 0 && (
                      <div
                        className={`bom_data_bottom ${
                          sequenceData.length > 0 ||
                          currentFinishItem?.product_code
                            ? "without_process"
                            : ""
                        }`}
                      >
                        <div className="bom_pointer_item">
                          <p>Scrap</p>
                          <h5>{rowsscrap.length} Item</h5>
                          <i className="fas fa-stop-circle text-secondary line-height-1"></i>
                        </div>
                      </div>
                    )}
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
                                value={currentFinishItem?.product_code || "N/A"}
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
                              {currentFinishItem?.Categories?.title || "N/A"}
                            </div>
                          </td>
                          <td>
                            <div style={{ width: "100px" }}>
                              <input
                                type="number"
                                min="1"
                                max="1"
                                className="form-control"
                                placeholder="Quantity"
                                readOnly
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
                            {currentFinishItem?.Masteruom?.unit_name || "N/A"}
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
                                  setCurrentFinishItem({
                                    ...currentFinishItem,
                                    comment: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </td>
                          <td>
                            <div
                              className="d-flex gap-2 align-items-center"
                              style={{ width: "100px" }}
                            >
                              <span className="f-s-14">{rows.length}</span>
                              <Tooltip title="Add Alternate Item">
                                <button
                                  type="button"
                                  className="link-btn line-height-1"
                                  onClick={handleShowAddAlternateItemModal}
                                >
                                  <i className="fas fa-plus-circle fs-5 text-primary line-height-1"></i>
                                </button>
                              </Tooltip>
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
                        <th></th>
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
                        {rowsRawMaterial.map((row, index) => (
                          //const isRowExpanded = expandedDisableTableRow[index] || false;
                          <React.Fragment key={index}>
                            <tr key={index} className="active_tr">
                              <td>
                                {row.childMaterials?.length > 0 && (
                                  <Tooltip
                                    title={
                                      expandedDisableTableRow[index]
                                        ? "Collapse"
                                        : "Expand"
                                    }
                                  >
                                    <button
                                      type="button"
                                      className="link-btn"
                                      onClick={() =>
                                        setExpandedDisableTableRow(
                                          (prevState) => ({
                                            ...prevState,
                                            [index]: !prevState[index], // Toggle only this row
                                          })
                                        )
                                      }
                                    >
                                      {expandedDisableTableRow[index] ? (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          id="Layer_1"
                                          data-name="Layer 1"
                                          viewBox="0 0 24 24"
                                          width={14}
                                          height={14}
                                          fill="currentColor"
                                          className=""
                                        >
                                          <path d="M24,12c0,.828-.671,1.5-1.5,1.5H1.5c-.829,0-1.5-.672-1.5-1.5s.671-1.5,1.5-1.5H22.5c.829,0,1.5,.672,1.5,1.5Zm-11.293,3.293c-.391-.391-1.024-.391-1.414,0l-3.163,3c-.63,.63-.184,1.707,.707,1.707h1.663v2.5c0,.828,.671,1.5,1.5,1.5s1.5-.672,1.5-1.5v-2.5h1.663c.891,0,1.337-1.077,.707-1.707l-3.163-3Zm-1.414-6.586c.391,.391,1.024,.391,1.414,0l3.163-3c.63-.63,.184-1.707-.707-1.707h-1.663V1.5c0-.828-.671-1.5-1.5-1.5s-1.5,.672-1.5,1.5v2.5h-1.663c-.891,0-1.337,1.077-.707,1.707l3.163,3Z" />
                                        </svg>
                                      ) : (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          id="Layer_1"
                                          data-name="Layer 1"
                                          viewBox="0 0 24 24"
                                          width={14}
                                          height={14}
                                          fill="currentColor"
                                          className=""
                                        >
                                          <path d="M17.087,16.923h-3.587V6.923h3.587c.811,0,1.218-.994,.644-1.575L12.644,.193c-.356-.36-.932-.36-1.288,0L6.269,5.348c-.574,.581-.167,1.575,.644,1.575h3.587v10h-3.587c-.811,0-1.218,.994-.644,1.575l5.087,5.154c.356,.36,.932,.36,1.288,0l5.087-5.154c.574-.581,.167-1.575-.644-1.575Z" />
                                        </svg>
                                      )}
                                    </button>
                                  </Tooltip>
                                )}
                              </td>
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
                                <div
                                  className="d-flex gap-2 align-items-center"
                                  style={{ width: "120px" }}
                                >
                                  <span className="f-s-14">
                                    {row.alternateItems?.length || 0}
                                  </span>
                                  <Tooltip title="Add Alternate Item">
                                    <button
                                      type="button"
                                      className="link-btn line-height-1"
                                      onClick={() =>
                                        handleShowRawMaterialAddAlternateItemModal(
                                          index
                                        )
                                      }
                                    >
                                      <i className="fas fa-plus-circle fs-5 text-primary line-height-1"></i>
                                    </button>
                                  </Tooltip>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Tooltip title="Change Child BOM">
                                    <button
                                      type="button"
                                      className="table-btn"
                                      onClick={() =>
                                        handleShowLinkChildModal(
                                          index,
                                          row.name,
                                          row.category,
                                          row.product_code
                                        )
                                      }
                                    >
                                      <i className="fas fa-link"></i>
                                    </button>
                                  </Tooltip>
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
                            {expandedDisableTableRow[index] && (
                              <>
                                {Array.isArray(row.childMaterials) &&
                                  row.childMaterials.length > 0 &&
                                  row.childMaterials.map(
                                    (child, childIndex) => (
                                      <tr
                                        key={`${index}-${childIndex}`}
                                        className="disable_tr"
                                      >
                                        <td>
                                          <div
                                            style={{
                                              width: "20px",
                                              textAlign: "center",
                                            }}
                                          >
                                            &nbsp;
                                          </div>
                                        </td>
                                        <td className="disable_td">{`${
                                          index + 1
                                        }.${childIndex + 1}`}</td>
                                        <td>
                                          <DropDownList
                                            style={{ width: "200px" }}
                                            className="custom_keno_dropdown"
                                            data={finishedGoodsID}
                                            defaultValue={
                                              child.product_code || "Select ID"
                                            }
                                            disabled
                                          />
                                        </td>
                                        <td>
                                          <div className="custom-select-wrap">
                                            <DropDownList
                                              style={{ width: "200px" }}
                                              className="custom_keno_dropdown"
                                              defaultValue={
                                                child.name || "Goods Name"
                                              }
                                              disabled
                                            />
                                          </div>
                                        </td>
                                        <td>
                                          <div
                                            style={{ width: "150px" }}
                                            className="text-muted"
                                          >
                                            {child.category || "Raw Material"}
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ width: "150px" }}>
                                            <input
                                              type="number"
                                              className="form-control"
                                              placeholder="Quantity"
                                              value={child.quantity || ""}
                                              disabled
                                            />
                                          </div>
                                        </td>
                                        <td>{child.unit || "Unit"}</td>
                                        <td>
                                          <div style={{ width: "150px" }}>
                                            <input
                                              type="text"
                                              className="form-control"
                                              placeholder="Comment"
                                              value={child.comment || ""}
                                              disabled
                                            />
                                          </div>
                                        </td>
                                        <td>
                                          <div
                                            className="d-flex gap-2 align-items-center"
                                            style={{ width: "120px" }}
                                          >
                                            <span className="f-s-14">
                                              {Array.isArray(
                                                child.alternateItems
                                              )
                                                ? child.alternateItems.length
                                                : 0}
                                            </span>
                                            <Tooltip title="Add Alternate Item">
                                              <button
                                                type="button"
                                                className="link-btn line-height-1"
                                                disabled
                                                onClick={() =>
                                                  handleShowRawMaterialAddAlternateItemModal(
                                                    index
                                                  )
                                                }
                                              >
                                                <i className="fas fa-plus-circle fs-5 text-primary line-height-1"></i>
                                              </button>
                                            </Tooltip>
                                          </div>
                                        </td>
                                        <td>
                                          <div className="d-flex gap-2">
                                            <Tooltip title="Change Child BOM">
                                              <button
                                                type="button"
                                                className="table-btn"
                                                disabled
                                                onClick={() =>
                                                  handleShowLinkChildModal(
                                                    index,
                                                    row.name,
                                                    row.category,
                                                    row.product_code
                                                  )
                                                }
                                              >
                                                <i className="fas fa-link"></i>
                                              </button>
                                            </Tooltip>
                                            <Tooltip title="Remove">
                                              <button
                                                type="button"
                                                className="table-btn link-btn"
                                                disabled
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
                                    )
                                  )}
                              </>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={addRowRawMaterial}
                  >
                    <i className="fas fa-plus-circle me-2"></i>Add Raw Material
                    Row
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
                              <h6 className="route_name">
                                {route.route_id} : {route.route_name}
                              </h6>
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

            {/* Scrap Section */}
            <div className="card shadow-none border">
              <div className="card-header border-bottom-0 d-flex justify-content-between align-items-center">
                <h6 className="my-1 me-3">
                  <span className="me-3">Scrap</span>
                  <Tooltip title="Mention the Scrap that is generated in the process.">
                    <i className="fas fa-info-circle text-primary"></i>
                  </Tooltip>
                </h6>
                <Tooltip title="Expand">
                  <button
                    type="button"
                    className="link-btn ms-auto"
                    onClick={() => setOpenScrap(!openScrap)}
                    aria-expanded={open}
                  >
                    <i className="fas fa-sort ms-2 line-height-1"></i>
                  </button>
                </Tooltip>
              </div>
              <Collapse in={openScrap}>
                <div className="card-body border-top bg-light rounded-bottom-10">
                  <div className="table-responsive">
                    <table className="table table-bordered primary-table-head mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Quantity</th>
                          <th>Unit</th>
                          <th>Cost Allocation (%)</th>
                          <th>Comment</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rowsscrap.length < 1 ? (
                          <tr>
                            <td colSpan={9}>
                              <div className="fs-7 text-center text-muted">
                                No data available
                              </div>
                            </td>
                          </tr>
                        ) : (
                          rowsscrap.map((row, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>
                                <div className="width-200">
                                  <select
                                    className="form-select"
                                    value={row?.product_code || "N/A"}
                                    onChange={(e) =>
                                      handleRowChangeScrap(
                                        index,
                                        "id",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="">Select ID</option>
                                    {scrapItems.map((item) => (
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
                                      handleRowChangeScrap(
                                        index,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="">Select Name</option>
                                    {scrapItems.map((item) => (
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
                              <td>{row?.Categories?.title || "N/A"}</td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="Quantity"
                                  value={row.quantity}
                                  onChange={(e) =>
                                    handleRowChangeScrap(
                                      index,
                                      "quantity",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                              <td> {row?.Masteruom?.unit_name || "N/A"}</td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="Cost Allocation (%)"
                                  value={row.costAllocation}
                                  onChange={(e) =>
                                    handleRowChangeScrap(
                                      index,
                                      "costAllocation",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Comment"
                                  value={row.comment}
                                  onChange={(e) =>
                                    handleRowChangeScrap(
                                      index,
                                      "comment",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="link-btn"
                                  onClick={() => removeRowScrap(index)}
                                >
                                  <i className="fas fa-minus-circle fs-5 text-danger"></i>
                                </button>
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
                    onClick={addRowScrap}
                  >
                    <i className="fas fa-plus-circle me-2"></i>Add Scrap Row
                  </button>
                </div>
              </Collapse>
            </div>

            {/* Other Section */}
            <div className="card shadow-none border">
              <div className="card-header border-bottom-0 d-flex justify-content-between align-items-center">
                <h6 className="my-1 me-3">
                  <span className="me-3">Other Charges</span>
                  <Tooltip title="Other charges can be added here to calculate the BOM Cost">
                    <i className="fas fa-info-circle text-primary"></i>
                  </Tooltip>
                </h6>
                <Tooltip title="Expand">
                  <button
                    type="button"
                    className="link-btn ms-auto"
                    onClick={() => setOpenScrap(!openScrap)}
                    aria-expanded={open}
                  >
                    <i className="fas fa-sort ms-2 line-height-1"></i>
                  </button>
                </Tooltip>
              </div>
              <Collapse in={openScrap}>
                <div className="card-body border-top bg-light rounded-bottom-10">
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
                            <div className="text-end">Amount</div>
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
                            <div style={{ minWidth: "200px" }}>
                              <input
                                type="number"
                                onChange={getTaskData}
                                name="labour_charges_amount"
                                className="form-control text-end"
                              />
                            </div>
                          </td>
                          <td>
                            <div style={{ minWidth: "200px" }}>
                              <input
                                type="text"
                                onChange={getTaskData}
                                name="labour_charges_comment"
                                className="form-control"
                              />
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
                            <div style={{ minWidth: "200px" }}>
                              <input
                                type="number"
                                onChange={getTaskData}
                                name="machinery_charges_amount"
                                className="form-control text-end"
                              />
                            </div>
                          </td>
                          <td>
                            <div style={{ minWidth: "200px" }}>
                              <input
                                type="text"
                                onChange={getTaskData}
                                name="machinery_charges_comment"
                                className="form-control"
                              />
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
                            <div style={{ minWidth: "200px" }}>
                              <input
                                type="number"
                                onChange={getTaskData}
                                name="electricity_charges_amount"
                                className="form-control text-end"
                              />
                            </div>
                          </td>
                          <td>
                            <div style={{ minWidth: "200px" }}>
                              <input
                                type="text"
                                onChange={getTaskData}
                                name="electricity_charges_comment"
                                className="form-control"
                              />
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
                            <div style={{ minWidth: "200px" }}>
                              <input
                                type="number"
                                onChange={getTaskData}
                                name="other_charges_amount"
                                className="form-control text-end"
                              />
                            </div>
                          </td>
                          <td>
                            <div style={{ minWidth: "200px" }}>
                              <input
                                type="text"
                                onChange={getTaskData}
                                name="other_charges_comment"
                                className="form-control"
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

            <div className="d-flex justify-content-end gap-3">
              <button
                type="submit"
                onClick={saveBOM}
                className="btn btn-success"
              >
                <i className="fas fa-save me-2"></i>Save BOM
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Alternate Items Modal */}
      <AddAlternateItemModal
        show={showAddAlternateItemModal}
        handleClose={handleCloseAddAlternateItemModal}
        setRows={setRows}
        rows={rows}
      />
      {/* Add Alternate Items Modal */}
      <RawMaterialAddAlternateItemModal
        show={showRawMaterialAddAlternateItemModal}
        handleClose={handleCloseRawMaterialAddAlternateItemModal}
        setRowsrm={setRowsrm}
        setRowsRawMaterial={setRowsRawMaterial}
        showRawMaterialAddAlternateItemModalId={
          showRawMaterialAddAlternateItemModalId
        }
        rowsRawMaterial={rowsRawMaterial}
        rowsrm={rowsrm}
      />
      {/* Link Child Modal */}
      <LinkChildBomModal
        show={showLinkChildModal}
        handleClose={handleCloseLinkChildModal}
        showLinkChildModalId={showLinkChildModalId}
        //selectedRowData={rawMaterials.find(row => row.id === showLinkChildModalId)}
        selectedRowData={selectedRowData}
        handleSave={handleSaveRawMaterials}
      />
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

export default CreateBom;
