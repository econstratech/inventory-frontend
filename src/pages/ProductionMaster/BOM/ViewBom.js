import React, { useEffect, useRef, useState } from "react";
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
import { Tooltip } from "antd";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DeleteModal from "../../CommonComponent/DeleteModal";
import AlternativeProductModal from "./AlternativeProductModal";
import { UserAuth } from "../../auth/Auth";

import { PrivateAxios } from "../../../environment/AxiosInstance";

const ViewBom = () => {
  const navigate = useNavigate();
  //delete modal
  const [deleteShow, setDeleteShow] = useState(false);
  const deleteModalClose = () => setDeleteShow(false);
  const deleteModalShow = () => setDeleteShow(true);
  // Add Alternate Item Modal start

  //collapse
  const [open, setOpen] = useState(true);
  const [openSnapshot, setOpenSnapshot] = useState(true);
  const [openFinishedGoods, setOpenFinishedGoods] = useState(true);
  const [openRawMaterials, setOpenRawMaterials] = useState(true);
  const [openRouting, setOpenRouting] = useState(true);
  const [openScrap, setOpenScrap] = useState(true);
  const { bomId } = useParams(); // ✅ Get BOM ID from URL
  const [bomData, setBomData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch BOM Details
  const fetchBOMDetails = async () => {
    try {
      
      const response = await PrivateAxios.get(`/production/view-bom/${bomId}`);
      console.log("BOM Data Received:", response.data);
      setBomData(response.data);
    } catch (error) {
      console.error("Error fetching BOM:", error);
    } finally {
      setLoading(false);
    }
  };
const location = useLocation();
 useEffect(() => {
     if (location.pathname === `/production/bom/view-bom/${bomId}`) {
       document.body.classList.add("sidebar-collapse");
     } else {
       document.body.classList.remove("sidebar-collapse");
     }
     return () => {
       document.body.classList.remove("sidebar-collapse");
     };
   }, [location.pathname]);

  useEffect(() => {
    if (bomId) {
      fetchBOMDetails();
    }
  }, [bomId]);
    const {  getGeneralSettingssymbol} = UserAuth();

    // Add Alternate Item Modal start
    const [showViewAlternateItemModal, setShowViewAlternateItemModal] = useState(false);
    const handleCloseViewAlternateItemModal = () => setShowViewAlternateItemModal(false);
    const handleShowViewAlternateItemModal = () => setShowViewAlternateItemModal(true);
    //collapse
    const { bomid } = useParams();
    const [expandedRows, setExpandedRows] = useState({});
    const [selectedAlternatives, setSelectedAlternatives] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // 🔹 Toggle Parent Row (Expand/Collapse)
    const handleToggleRow = (rowId) => {
        setExpandedRows((prev) => ({
            ...prev,
            [rowId]: !prev[rowId],
        }));
    };

    const showAlternativesModal = (alternatives) => {
        
        if (alternatives && alternatives.length > 0) {
            setSelectedAlternatives(alternatives);
            setIsModalVisible(true);
        }
    };

  //calculate using dropdown
  const [selectedValueCalculated, setSelectedValueCalculated] =
    useState("Average Pricing");

  const handleCalculatedSelection = (value) => {
    setSelectedValueCalculated(value);
  };

  // view BOM cost toggle
  const [isCheckedBomCost, setIsCheckedBomCost] = useState(false);

  const handleCheckboxChangeBomCost = () => {
    setIsCheckedBomCost(!isCheckedBomCost); // Toggle the checkbox state
  };

  // Create an array of 5 items



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
        if (bomid) {
          fetchBOMDetails();
        }
      }, [bomid]);
    

      const bomDetailRef = useRef();

      const handleDownloadPDF = async () => {
        const input = bomDetailRef.current;
    
        if (!input) return;
    
        const canvas = await html2canvas(input, {
          scale: 2,
          useCORS: true,
        });
    
        const imgData = canvas.toDataURL("image/png");
    
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
    
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
        let heightLeft = imgHeight;
        let position = 0;
    
        // First page
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
    
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
    
        pdf.save(`BOM-${Date.now()}.pdf`);
      };

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
          <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="my-1 fw-bold">{bomData?.bomNumber || "N/A"} Details</h6>
            <div className="d-flex ms-auto gap-2">
              {/* {!isCheckedBomCost && (
                <>
                  <Tooltip title="Edit and Save">
                    <Link
                      role="button"
                      className="icon-btn"
                      to={{pathname: `/production/bom/${bomData?.id}/edit-bom` }}
                      state={{ data: bomData }}
                    >
                      <i class="fas fa-pen"></i>
                    </Link>
                  </Tooltip>
                  <Tooltip title="Duplicate">
                    <Link
                      role="button"
                      className="icon-btn"
                      to="/production/bom/edit-bom"
                    >
                      <i class="fas fa-copy"></i>
                    </Link>
                  </Tooltip>
                  <Tooltip title="Print">
                    <button type="button" className="icon-btn">
                      <i class="fas fa-print"></i>
                    </button>
                  </Tooltip>
                </>
              )} */}
              <Tooltip title="Download">
                <button type="button" className="icon-btn"  onClick={handleDownloadPDF}>
                  <i class="fas fa-download"></i>
                </button>
              </Tooltip>
              {!isCheckedBomCost && (
                <>
                  <Tooltip title="Delete BOM">
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={deleteModalShow}
                    >
                      <i class="fas fa-trash-alt text-danger"></i>
                    </button>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
          <div className="card-body pb-1" ref={bomDetailRef}>
            {/* Document Detail Section */}
            <div className="card shadow-none border">
              <div className="card-header border-bottom-0 d-flex justify-content-between align-items-center">
                <h6 className="my-1 me-3">
                  <span className="me-3">Document Detail</span>
                  <Tooltip title="Important Details of the BOM is present here">
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
                  <div className="row">
                    <div className="col-lg-4 col-md-6 col-sm-12">
                      <div className="form-group form-group-view">
                        <label className="col-form-label">Document Name</label>
                        <p>{bomData?.documentName} </p>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12">
                      <div className="form-group form-group-view">
                        <label className="col-form-label">
                          Document Number
                        </label>
                        <p>{bomData?.bomNumber}</p>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12">
                      <div className="form-group form-group-view">
                        <label className="col-form-label">FG Store</label>
                        <p>{bomData?.FGStoreDetails?.name}</p>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12">
                      <div className="form-group form-group-view">
                        <label className="col-form-label">RM Store</label>
                        <p>{bomData?.RMStoreDetails?.name}</p>
                      </div>
                    </div>

                    <div className="col-lg-4 col-md-6 col-sm-12">
                      <div className="form-group form-group-view">
                        <label className="col-form-label">
                          Last Modified By
                        </label>
                        <p>{bomData?.UserDetailsM?.name}</p>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12">
                      <div className="form-group form-group-view">
                        <label className="col-form-label">
                          Last Modified Date
                        </label>
                        <p>{formatDate(bomData?.updated_at)}</p>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12">
                      <div className="form-group form-group-view">
                        <label className="col-form-label">Created By</label>
                        <p>{bomData?.UserDetails?.name}</p>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12">
                      <div className="form-group form-group-view">
                        <label className="col-form-label">Creation Date</label>
                        <p>{formatDate(bomData?.created_at)}</p>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-group form-group-view">
                        <label className="col-form-label">Description</label>
                        <p>{bomData?.description}</p>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-group form-group-view">
                        <label className="col-form-label">ATTACHMENTS</label>
                        <div className="erp_attachment_wrap">
                          {/* loop this item */}

                          {bomData?.attachments ? (
                            (() => {
                              try {
                                const files = JSON.parse(bomData.attachments);
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
                        </div>
                      </div>
                    </div>
                  </div>
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
                        process.env.PUBLIC_URL +
                        "/assets/images/bom-spanshot.png"
                      }
                      class="img-fluid"
                      alt="placeholder"
                    />
                  </div>
                  {/* for blank data end */}
                  {/* for data start */}
                  <div className="bom_data pb-3">
                    <div className="bom_data_top">
                      <div className="bom_pointer_item">
                        <p>Raw Material</p>
                        <h5>{bomData?.rawMaterials?.length} Items</h5>
                        <i className="fas fa-eject text-warning line-height-1"></i>
                      </div>
                      <div className="pointer-divider second"></div>
                      <div className="bom_pointer_item second">
                        <p>Process</p>
                        <h5>{bomData?.routing?.length} Processes</h5>
                        <i className="fas fa-play text-primary line-height-1"></i>
                      </div>
                      <div className="pointer-divider third"></div>
                      <div className="bom_pointer_item third">
                        <p>Finished Goods</p>
                        <h5>1 Item</h5>
                        <i className="fas fa-square text-success line-height-1"></i>
                      </div>
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
                  <Tooltip title="The product created using this BOM">
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
                    <table className="table mb-0 table-bordered primary-table-head">
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
                        {bomData?.finishedGoods?.length > 0 ? (
                          bomData.finishedGoods.map((item, index) => (
                            <tr className>
                              <td>{index + 1}</td>
                              <td>
                                <div
                                  style={{ width: "150px" }}
                                  className="fw-medium f-s-14 d-flex justify-content-between align-items-center"
                                >
                                  <div className="me-3">
                                    {item.product_code}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div style={{ width: "250px" }}>
                                  {item.name}
                                </div>
                              </td>
                              <td>
                                <div style={{ width: "150px" }}>
                                  {item.category}
                                </div>
                              </td>
                              <td>
                                <div
                                  style={{ width: "150px" }}
                                  className="fs-5"
                                >
                                  {item.quantity}
                                </div>
                              </td>
                              <td>
                                <div style={{ width: "150px" }}>
                                  {item.unit}
                                </div>
                              </td>
                              <td>
                                <div
                                  style={{ width: "150px" }}
                                  className="fs-5"
                                >
                                  {item.costAllocation}
                                </div>
                              </td>
                              <td>
                                <div style={{ width: "150px" }}>
                                  {item.comment}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8">No Finished Goods available.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Collapse>
            </div>

            {/* Raw Materials Section */}
            <div className='card shadow-none border'>
            <div className='card-header border-bottom-0 d-flex justify-content-between align-items-center'>
                <h6 className='my-1 me-3'>
                    <span className="me-3">Raw Materials</span>
                    <Tooltip title="The Raw Materials required to create BOM">
                        <i className="fas fa-info-circle text-primary"></i>
                    </Tooltip>
                </h6>
                <Tooltip title="Expand">
                    <button type='button' className='link-btn ms-auto' onClick={() => setOpenRawMaterials(!openRawMaterials)} aria-expanded={openRawMaterials}>
                        <i className="fas fa-sort ms-2 line-height-1"></i>
                    </button>
                </Tooltip>
            </div>
            
            <Collapse in={openRawMaterials}>
                <div className='card-body border-top bg-light rounded-bottom-10 pb-1'>
                    <div className="table-responsive">
                        <table className="table table-bordered primary-table-head raw_material_table">
                            <thead>
                                <tr>
                                    <th>&nbsp;</th>
                                    <th>#</th>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Quantity</th>
                                    <th>Unit</th>
                                    <th>Alternatives</th>
                                    <th>Comment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* ✅ Parent Rows (Raw Materials) */}
                                {bomData?.rawMaterials?.map((row, index) => (
                                    <React.Fragment key={row.id}>
                                        <tr className="active_tr">
                                            <td>
                                                <div style={{ width: '20px', textAlign: 'center' }}>
                                                    {row.childMaterials.length > 0 && (
                                                        <Tooltip title={expandedRows[row.id] ? "Collapse" : "Expand"}>
                                                            <button type='button' className='link-btn'
                                                                onClick={() => handleToggleRow(row.id)}
                                                            >
                                                                {expandedRows[row.id] ? '➖' : '➕'}
                                                            </button>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="active_td">{index + 1}</td>
                                            <td>
                                                <div style={{ minWidth: '200px' }}>{row.product_code}</div>
                                            </td>
                                            <td>
                                                <div style={{ minWidth: '200px' }}>{row.name}</div>
                                            </td>
                                            <td>
                                                <div style={{ minWidth: '200px' }}>{row.category}</div>
                                            </td>
                                            <td>
                                                <div style={{ minWidth: '150px' }} className="fs-5">{row.quantity}</div>
                                            </td>
                                            <td>
                                                <div style={{ minWidth: '150px' }}>{row.unit}</div>
                                            </td>
                                            <td>
                                                {/* ✅ Alternative Products Icon */}
                                                {row.alternatives.length > 0 ? (
                                                    <Tooltip title="View Alternative Products">
                                                        <button type="button" className="link-btn"
                                                            onClick={() => showAlternativesModal(row.alternatives)}
                                                        >
                                                            <i className="fas fa-exchange-alt text-primary"></i> ({row.alternatives.length})
                                                        </button>
                                                    </Tooltip>
                                                ) : 'N/A'}
                                            </td>
                                            <td>
                                                <div style={{ minWidth: '150px' }}>{row.comment || '-'}</div>
                                            </td>
                                        </tr>
        
                                        {/* ✅ Child Rows (Expand on Click) */}
                                        {expandedRows[row.id] && row.childMaterials.length > 0 && row.childMaterials.map((child, childIndex) => (
                                            <tr key={`${row.id}-${childIndex}`} className="diable_tr">
                                                <td>
                                                    <div style={{ width: '20px', textAlign: 'center' }}>&nbsp;</div>
                                                </td>
                                                <td className="disable_td">{`${index + 1}.${childIndex + 1}`}</td>
                                                <td>
                                                    <div style={{ minWidth: '200px' }}>{child.product_code}</div>
                                                </td>
                                                <td>
                                                    <div style={{ minWidth: '200px' }}>{child.name}</div>
                                                </td>
                                                <td>
                                                    <div style={{ minWidth: '200px' }}>{child.category}</div>
                                                </td>
                                                <td>
                                                    <div style={{ minWidth: '150px' }} className="fs-5">{child.quantity}</div>
                                                </td>
                                                <td>
                                                    <div style={{ minWidth: '150px' }}>{child.unit}</div>
                                                </td>
                                                <td>
                                                    {/* ✅ Alternative Products for Child Materials */}
                                                    {child.alternatives.length > 0 ? (
                                                        <Tooltip title="View Alternative Products">
                                                            <button type="button" className="link-btn"
                                                                onClick={() => showAlternativesModal(child.alternatives)}
                                                            >
                                                                <i className="fas fa-exchange-alt text-primary"></i> ({child.alternatives.length})
                                                            </button>
                                                        </Tooltip>
                                                    ) : 'N/A'}
                                                </td>
                                                <td>
                                                    <div style={{ minWidth: '150px' }}>{child.comment || '-'}</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
        
                                {/* ✅ No Data Message */}
                                {(!bomData?.rawMaterials || bomData.rawMaterials.length === 0) && (
                                    <tr>
                                        <td colSpan="9" className="text-center">No Raw Materials Available.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Collapse>
          </div>
        

            {/* Routing Section */}
            <div className="card shadow-none border">
              <div className="card-header border-bottom-0 d-flex justify-content-between align-items-center flex-wrap">
                <h6 className="my-1 me-3">
                  <span className="me-3">Routing</span>
                  <Tooltip title="List the processes to be done on the Raw Materials">
                    <i className="fas fa-info-circle text-primary"></i>
                  </Tooltip>
                </h6>
              </div>
              <Collapse in={openRouting}>
                <div className="card-body border-top bg-light rounded-bottom-10 pb-1">
                  <div className="route_wrap">
                    {bomData?.routing?.length > 0 ? (
                      bomData.routing.map((route, index) => (
                        <div className="route_item" key={route.sequence}>
                          <div className="route_header">
                            <div className="route_number">{route.sequence}</div>
                            <hr />
                          </div>
                          <div className="route_body">
                            <h6 className="route_name">{route.route_id} : {route.route_name}</h6>
                            <div className="route_comment">
                              <div className="route_p">{route.comment}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3">No Routing data available.</td>
                      </tr>
                    )}
                  </div>
                </div>
              </Collapse>
            </div>

            {/* Scrap Section */}
            <div className='card shadow-none border'>
                            <div className='card-header border-bottom-0 d-flex justify-content-between align-items-center'>
                                <h6 className='my-1 me-3'>
                                    <span className="me-3">Scrap</span>
                                    <Tooltip title="Scrap Generated in the creation of Finished Goods">
                                        <i className="fas fa-info-circle text-primary"></i>
                                    </Tooltip>
                                </h6>
                                <Tooltip title="Expand">
                                    <button type="button" className='link-btn ms-auto' onClick={() => setOpenScrap(!openScrap)} aria-expanded={open}>
                                        <i className="fas fa-sort ms-2 line-height-1"></i>
                                    </button>
                                </Tooltip>
                            </div>
                            <Collapse in={openScrap}>
                                <div className="card-body border-top bg-light rounded-bottom-10 pb-1">
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
                                                </tr>
                                            </thead>
                                            <tbody>
                                            {bomData?.scrapItems?.map((row, index) => (
                                                <tr>
                                                    <td>
                                                    {index + 1}
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '200px' }} >
                                                        {row.product_code}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '200px' }} >
                                                        {row.name}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '200px' }}>{row.category}</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '150px' }} className="fs-5">{row.quantity}</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '150px' }}>{row.unit}</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '150px' }}>{row.costAllocation}</div>
                                                    </td>
                                                 
                                                    <td>
                                                        <div style={{ minWidth: '150px' }}>
                                                        {row.comment}
                                                        </div>
                                                    </td>
                                                </tr>
                                                ))}
                                                {(!bomData?.scrapItems || bomData.scrapItems.length === 0) && (
                                                    <tr>
                                                        <td colSpan="9" className="text-center">No Scrap Available.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </Collapse>
                        </div>

                        {/* Other Section */}
                        <div className='card shadow-none border'>
                            <div className='card-header border-bottom-0 d-flex justify-content-between align-items-center'>
                                <h6 className='my-1 me-3'>
                                    <span className="me-3">Other Charges</span>
                                    <Tooltip title="Other Charges incurred">
                                        <i className="fas fa-info-circle text-primary"></i>
                                    </Tooltip>
                                </h6>
                                <Tooltip title="Expand">
                                    <button type="button" className='link-btn ms-auto' onClick={() => setOpenScrap(!openScrap)} aria-expanded={open}>
                                        <i className="fas fa-sort ms-2 line-height-1"></i>
                                    </button>
                                </Tooltip>
                            </div>
                            <Collapse in={openScrap}>
                                <div className="card-body border-top bg-light rounded-bottom-10 pb-1">
                                    <div className="table-responsive">
                                        <table className="table table-bordered primary-table-head mb-0">
                                            <thead>
                                                <tr>
                                                    <th><div>#</div></th>
                                                    <th><div>Classification</div></th>
                                                    <th><div className="text-end">Amount</div></th>
                                                    <th><div>Comment</div></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <div>1</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '250px' }}>Labour Charges</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '200px' }} className="text-end">
                                                            {getGeneralSettingssymbol} {new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2}).format(bomData?.labour_charges_amount)}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '200px' }}>
                                                        {bomData?.labour_charges_comment || "N/A"}
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div>2</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '250px' }}>Machinery Charges</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '200px' }} className="text-end">

                                                        {getGeneralSettingssymbol} {new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2}).format(bomData?.machinery_charges_amount)}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '200px' }}>
                                                        {bomData?.machinery_charges_comment || "N/A"}
                                                        
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div>3</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '250px' }}>Electricity Charges</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '200px' }} className="text-end">
                                                        {getGeneralSettingssymbol} {new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2}).format(bomData?.electricity_charges_amount)}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '200px' }}>
                                                        {bomData?.electricity_charges_comment || "N/A"}
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div>4</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '250px' }}>Other Charges</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '200px' }} className="text-end">
                                                        {getGeneralSettingssymbol} {new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2}).format(bomData?.other_charges_amount)}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ minWidth: '200px' }}>
                                                        {bomData?.other_charges_comment || "N/A"}
                                                        </div>
                                                    </td>
                                                </tr>

                                            </tbody>
                                        </table>
                                    </div>

                                </div>
                            </Collapse>
                        </div>

                        {/* {!isCheckedBomCost && (
                            <div className="d-flex justify-content-end gap-3 position-sticy bottom-0 py-2 bg-white border-top">
                                <button type='button' className="btn btn-success"><i className="fas fa-bolt me-2"></i>Product FG</button>
                            </div>
                        )} */}




                

                        




                    </div>
                </div>
            </div>
         
<AlternativeProductModal show={isModalVisible} 
    alternatives={selectedAlternatives} 
    onClose={() => setIsModalVisible(false)}
    />


      {/* Delete Modal */}
      
      <DeleteModal show={deleteShow} handleClose={deleteModalClose} />
    </>
  );
           
};

export default ViewBom;