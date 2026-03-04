import { Tooltip } from "antd";
import Select from "react-select";
import React, { useEffect, useState } from "react";
import { Collapse, Modal } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { PrivateAxios } from "../../environment/AxiosInstance";
import { UserAuth } from "../auth/Auth";
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
const ProcessStartModal = ({
  show,
  handleClose,
  productionData,
  setProductionData,
}) => {
  const [openFGProduct, setOpenFGProduct] = useState(true);
  const [openIssueRawMaterial, setOpenIssueRawMaterial] = useState(true);
  const [openMarkScrapGenerated, setOpenMarkScrapGenerated] = useState(true);
  const [openLogRoutingData, setOpenLogRoutingData] = useState(true);
  const [openLogOtherCharges, setOpenLogOtherCharges] = useState(true);
  const [stores, setStores] = useState([]);
  const [storeWiseStock, setStoreWiseStock] = useState({});
  const [storeStockMap, setStoreStockMap] = useState({});
  const [alternatives, setAlternative] = useState([]);
  const [selectedStores, setSelectedStores] = useState({});
  const [alternativesitem, setAlternativesitem] = useState([]);
  const [fgQuantityAdded, setFgQuantityAdded] = useState(0);
  const [fgComment, setFgComment] = useState("");
  const [routingnumber, setroutingnumber] = useState("");
  const [children, setChildren] = useState([]);
  const { getGeneralSettingssymbol } = UserAuth();
  const [storeStocks, setStoreStocks] = useState({});
  const [fgChanges, setFgChanges] = useState({});
  console.log(productionData);
 const navigate = useNavigate();
  const targetProduction =
    productionData?.finishedGoods?.[0]?.targetProduction || 0;

  const handleChange = (index, value) => {
    const updated = { ...fgChanges, [index]: Number(value) };
    setFgChanges(updated);
  };

  const updateAlternativeStockError = (altRow, storeId, inputQuantity) => {
    const stockKey = `${altRow.product_id}-${storeId}`;
    const currentStock = storeStocks[stockKey] ?? 0;
    const isError = Number(inputQuantity || 0) > currentStock;

    altRow.stockError = isError;

    // If using setState (which you probably are), trigger state update
    setAlternativesitem((prev) =>
      prev.map((item) =>
        item.id === altRow.id ? { ...item, stockError: isError } : item
      )
    );
  };
  const hasAnyInsufficientStock = () => {
    return (
      productionData?.rawMaterials?.some((row) => row.stockError) ||
      children.some((row) => row.stockError) ||
      alternativesitem.some((row) => row.stockError)
    );
  };

  //==========================================================

  const handleStoreChange = async (productId, storeId) => {
    try {
      const response = await PrivateAxios.get(`/production/get-current-stock`, {
        params: {
          product_id: productId,
          store_id: storeId,
        },
      });

      const stock = response.data.currentStock || 0;
      setStoreStocks((prev) => ({
        ...prev,
        [`${productId}-${storeId}`]: stock,
      }));
    } catch (error) {
      console.error("Error fetching stock:", error);
      setStoreStocks((prev) => ({
        ...prev,
        [`${productId}-${storeId}`]: "N/A",
      }));
    }
  };

  //children

  //==========================================================
  useEffect(() => {
    const fetchStores = async () => {
      const result = await PrivateAxios.get("/warehousesselect");
      const filteredStores = result.data.data.filter(
        (store) => store.store_type === "In-Stock Stores"
      );
      setStores(filteredStores);

      if (
        filteredStores.length > 0 &&
        productionData?.rawMaterials?.length > 0
      ) {
        productionData.rawMaterials.forEach((material) => {
          const firstStore = filteredStores[0];
          setSelectedStores((prev) => ({
            ...prev,
            [material.product_id]: firstStore.id,
          }));
          handleStoreChange(material.product_id, firstStore.id);
        });
      }
    };
    fetchStores();
  }, [productionData]);

  // submit all sections data form updating records
  const handleSubmit = async () => {
    try {
      const formSubmit = {
        production_id: productionData?.production?.id,

        // ✅ RAW MATERIALS (parent only, including updated fields)
        rawMaterials: (productionData.rawMaterials || []).map((item) => ({
          id: item.id,
          product_id: item.product_id,
          inputQuantity: item.inputQuantity || 0,
          item_name: item.product_name,
          final_quantity: parseFloat(item.stockIn) - parseFloat(item.stockOut),
          item_unit:item.unit,
          usedRM:item.newQuantity !== undefined ? item.newQuantity : parseFloat(item.usedRM || 0),
          comment: item.comment || "",
          store_id: selectedStores[item.product_id] || null,
          addLess: item.type || "Issue from store",
        })),

        // ✅ CHILD RAW MATERIALS
        childRawMaterials: (children || []).map((item) => ({
          id: item.id,
          product_id: item.product_id,
          inputQuantity: item.quantity || 0,
          newQuantity:
            item.newQuantity !== undefined
              ? item.newQuantity
              : parseFloat(item.usedRM || 0),
          usedRM: item.usedRM || 0,
          comment: item.comment || "",
          store_id: item.selectedStoreId || null,
          addLess: item.type || "Issue from store",
        })),

        // ✅ ALTERNATE RAW MATERIALS
        alternateRawMaterials: (alternatives || []).map((item) => ({
          id: item.id,
          product_id: item.product_id,
          inputQuantity: item.inputQuantity || 0,
          newQuantity:
            item.newQuantity !== undefined
              ? item.newQuantity
              : parseFloat(item.usedRM || 0),
          usedRM: item.usedRM || 0,
          comment: item.comment || "",
          store_id: item.selectedStoreId || null,
          addLess: item.addLess || "Issue from store",
        })),

        finishedGoods: (productionData.finishedGoods || []).map((item) => ({
          id: item.id,
          product_id: item.product_id,
          quantity: fgQuantityAdded,
          completed:
            Number(fgQuantityAdded) +
            Number(productionData?.finishedGoods[0].completed || 0),
          tested:
            item.tested == 0
              ? Number(productionData?.finishedGoods[0].targetProduction) +
                Number(fgQuantityAdded)
              : Number(item.tested) + Number(fgQuantityAdded),
          passed:
            item.passed == 0
              ? Number(productionData?.finishedGoods[0].targetProduction) +
                Number(fgQuantityAdded)
              : Number(item.passed) + Number(fgQuantityAdded),

          comment: fgComment ==''?item.comment: fgComment,
        })),

        scrapMaterials: (productionData.scrapItems || []).map((item) => ({
          id: item.id,
          product_id: item.product_id,
          actualquantity:
            Number(item.actualquantity || 0) + Number(item.quantityAdded || 0), // ✅ updated calculation
          comment: item.comment || "",
        })),

        // ✅ ROUTING
        routingData: (productionData.routing || []).map((item) => ({
          id: item.id,
          comment: item.comment || "",
          current_fg_qty:
          (Number(item.current_fg_qty || 0) +
          Number(item.change_input_qty || 0)),
          change_fg_qty:
          (Number(item.current_fg_qty || 0) +
          Number(item.change_input_qty || 0)) ,
          completion: (
            ((Number(item.current_fg_qty || 0) +
              Number(item.change_input_qty || 0)) /
              Number(
                productionData?.finishedGoods?.[0]?.targetProduction || 1
              )) *
            100
          ).toFixed(2),
          mark_done: item.mark_done === 1 ? 1 : 0,
        })),

        production: {
          id: productionData?.production?.id,
          labourChargesAA: productionData?.production?.labourChargesAA,
          labourCharges_comment: productionData?.production?.labourCharges_comment || "",
          machineryChargesAA: productionData?.production?.machineryChargesAA,
          machineryCharges_comment: productionData?.production?.machineryCharges_comment || "",
          electricityChargesAA: productionData?.production?.electricityChargesAA,
          electricityCharges_comment: productionData?.production?.electricityCharges_comment || "",
          otherChargesAA: productionData?.production?.otherChargesAA,
          otherCharges_comment: productionData?.production?.otherCharges_comment || "",
          production_number: productionData?.production?.production_number,
        },
      };

      console.log("Form Data Ready to Submit:", formSubmit);

       const response = await PrivateAxios.post('/production/submit-production-process', formSubmit);

       console.log("Production Submitted Successfully", response.data);
       
       SuccessMessage('Production Submitted Successfully.!');
      // Optional: Show success toast or navigate
      navigate(`/production/all-production-process/view-production/`+ response.data.pid);
      window.location.reload();
      handleClose();
    } catch (error) {
      console.error("Submission failed:", error);
      // Optional: Show error toast
    }
  };

  return (
    <Modal
      id="ProcessStartModal"
      show={show}
      onHide={handleClose}
      backdrop="static"
      centered
      size="xxl"
      className="fullscreen"
    >
      <Modal.Header closeButton>
        <Modal.Title className="gth-modal-title">
          <i class="fas fa-bolt me-2 text-primary"></i> Take Actions for{" "}
          <span>{productionData?.production.production_number}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pb-1">
        {/* Mark FG Product start */}
        <div className="card shadow-none border">
          <div className="card-header border-bottom-0 d-flex justify-content-between align-items-center flex-wrap">
            <h6 className="my-1 me-3 fw-semibold">
              <span className="me-3">Mark FG Produced</span>
            </h6>
            <Tooltip title="Expand">
              <button
                type="button"
                className="link-btn ms-auto"
                onClick={() => setOpenFGProduct(!openFGProduct)}
                aria-expanded={openFGProduct}
              >
                <i className="fas fa-sort ms-2 line-height-1"></i>
              </button>
            </Tooltip>
          </div>
          <Collapse in={openFGProduct}>
            <div className="card-body border-top bg-light rounded-bottom-10 pb-1">
              <div className="table-responsive">
                <table className="table table-bordered primary-table-head">
                  <thead>
                    <tr>
                      <th>Item ID</th>
                      <th>Item Name</th>
                      <th>Item Category</th>
                      <th>Unit</th>
                      <th>Target Production</th>
                      <th>Completed</th>
                      <th>Tested</th>
                      <th>Passed</th>
                      <th>Rejected</th>
                      <th>Store</th>
                      <th>Quantity Added</th>
                      <th>New Quantity</th>
                      <th>Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="">
                      <td>
                        <div style={{ width: "150px" }}>
                          {productionData?.finishedGoods[0].product_code}
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
                        <div style={{ width: "100px" }}>
                          {productionData?.finishedGoods[0].unit}
                        </div>
                      </td>
                      <td>
                        <div style={{ width: "140px" }}>
                          {productionData?.finishedGoods[0].targetProduction}
                        </div>
                      </td>
                      <td>
                        <div style={{ width: "100px" }}>
                          {productionData?.finishedGoods[0].completed}
                        </div>
                      </td>
                      <td>
                        <div style={{ width: "100px" }}>
                          {productionData?.finishedGoods[0].tested}
                        </div>
                      </td>
                      <td>
                        <div style={{ width: "100px" }}>
                          {productionData?.finishedGoods[0].passed}
                        </div>
                      </td>
                      <td>
                        <div style={{ width: "100px" }}>
                          {productionData?.finishedGoods[0].rejected}
                        </div>
                      </td>
                      <td>
                        <div style={{ width: "130px" }}>
                          {productionData?.storeDetails?.fg_store_id ===
                          productionData?.production?.fg_store
                            ? productionData?.storeDetails?.fg_store_name
                            : "Store Not Found"}
                        </div>
                      </td>
                      <td>
                        <div style={{ width: "130px" }}>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={fgQuantityAdded}
                            onChange={(e) =>
                              setFgQuantityAdded(Number(e.target.value || 0))
                            }
                            min={0}
                          />
                        </div>
                      </td>
                      <td>
                        <div style={{ width: "130px" }}>
                          {Number(fgQuantityAdded) +
                            Number(
                              productionData?.finishedGoods[0].completed || 0
                            )}
                        </div>
                      </td>
                      <td>
                        <div style={{ width: "200px" }}>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={fgComment}
                            onChange={(e) => setFgComment(e.target.value)}
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="text-end mb-3">
                <label className="custom-checkbox me-0 mb-0">
                  <input type="checkbox" />
                  <span className="checkmark" />
                  <span className="text-">Mark as tested</span>
                </label>
              </div>
            </div>
          </Collapse>
        </div>
        {/* Mark FG Product end */}

        {/* Issue raw Material start */}
        <div className="card shadow-none border">
          <div className="card-header border-bottom-0 d-flex justify-content-between align-items-center flex-wrap">
            <h6 className="my-1 me-3 fw-semibold">
              <span className="me-3">Issue Raw Materials</span>
            </h6>
            <Tooltip title="Expand">
              <button
                type="button"
                className="link-btn ms-auto"
                onClick={() => setOpenIssueRawMaterial(!openIssueRawMaterial)}
                aria-expanded={openIssueRawMaterial}
              >
                <i className="fas fa-sort ms-2 line-height-1"></i>
              </button>
            </Tooltip>
          </div>
          <Collapse in={openIssueRawMaterial}>
            <div className="card-body border-top bg-light rounded-bottom-10 pb-1">
              <div className="table-responsive">
                <table className="table table-bordered primary-table-head raw_material_table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Item ID</th>
                      <th>Item Name</th>
                      <th>Current Stock</th>
                      <th>Estimated RM</th>
                      <th>Used RM</th>
                      <th>Unit</th>
                      <th>Comment</th>
                      <th>Store</th>
                      <th>Add/Less</th>
                      <th>Quantity</th>
                      <th>New Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productionData?.rawMaterials?.length > 0 ? (
                      productionData.rawMaterials
                        .filter((rm) => !rm.parent_raw_material_id) // Get only main raw materials
                        .map((rawMaterial, index) => {
                          const children = productionData.rawMaterials.filter(
                            (child) =>
                              child.parent_raw_material_id === rawMaterial.id &&
                              child.alternative_flag === 0
                          );
                          const alternatives =
                            productionData.rawMaterials.filter(
                              (alt) =>
                                alt.parent_raw_material_id === rawMaterial.id &&
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
                                  <div style={{ minWidth: "150px" }}>
                                    {storeStocks[
                                      `${rawMaterial.product_id}-${
                                        selectedStores[rawMaterial.product_id]
                                      }`
                                    ] ?? "N/A"}
                                  </div>
                                </td>

                                <td>
                                  {/* ✅ Estimated RM (STATIC) */}
                                  <div style={{ minWidth: "140px" }}>
                                    {rawMaterial.EstimatedProduction || 0}
                                  </div>
                                </td>

                                <td>
                                  <div style={{ minWidth: "130px" }}>
                                    {rawMaterial.usedRM || 0}
                                  </div>
                                </td>

                                <td>
                                  <div style={{ minWidth: "130px" }}>
                                    {rawMaterial.unit || "N/A"}
                                  </div>
                                </td>

                                <td>
                                  <div style={{ width: "200px" }}>
                                    <input
                                      type="text"
                                      className="form-control form-control-sm"
                                      value={rawMaterial.comment || ""}
                                      onChange={(e) => {
                                        const updated = [
                                          ...productionData.rawMaterials,
                                        ];
                                        const rmIndex = updated.findIndex(
                                          (r) => r.id === rawMaterial.id
                                        );
                                        updated[rmIndex].comment =
                                          e.target.value;
                                        setProductionData({
                                          ...productionData,
                                          rawMaterials: updated,
                                        });
                                      }}
                                    />
                                  </div>
                                </td>

                                <td>
                                  <div style={{ width: "180px" }}>
                                    <select
                                      className="form-select form-select-sm"
                                      value={
                                        selectedStores[
                                          rawMaterial.product_id
                                        ] || ""
                                      }
                                      onChange={(e) => {
                                        const storeId = e.target.value;
                                        setSelectedStores((prev) => ({
                                          ...prev,
                                          [rawMaterial.product_id]: storeId,
                                        }));
                                        handleStoreChange(
                                          rawMaterial.product_id,
                                          storeId
                                        );
                                      }}
                                    >
                                      {stores.map((store) => (
                                        <option key={store.id} value={store.id}>
                                          {store.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </td>

                                <td>
                                  <div style={{ width: "180px" }}>
                                    <select
                                      className="form-select form-select-sm"
                                      value={
                                        rawMaterial.type || "Issue from store"
                                      }
                                      onChange={(e) => {
                                        const updated = [
                                          ...productionData.rawMaterials,
                                        ];
                                        const rmIndex = updated.findIndex(
                                          (r) => r.id === rawMaterial.id
                                        );
                                        updated[rmIndex].type = e.target.value;
                                        setProductionData({
                                          ...productionData,
                                          rawMaterials: updated,
                                        });
                                      }}
                                    >
                                      <option>Issue from store</option>
                                      <option>Return to store</option>
                                    </select>
                                  </div>
                                </td>

                                <td>
                                  <div style={{ width: "120px" }}>
                                    <input
                                      type="number"
                                      className="form-control form-control-sm"
                                      placeholder="0"
                                      value={
                                        rawMaterial.inputQuantity === 0 ||
                                        !rawMaterial.inputQuantity
                                          ? ""
                                          : rawMaterial.inputQuantity
                                      }
                                      onChange={(e) => {
                                        const val =
                                          parseFloat(e.target.value) || 0;
                                        const stock =
                                          storeStocks[
                                            `${rawMaterial.product_id}-${
                                              selectedStores[
                                                rawMaterial.product_id
                                              ]
                                            }`
                                          ];
                                        const usedRM =
                                          parseFloat(rawMaterial.usedRM) || 0;
                                        const isStockLow =
                                          stock !== undefined && val > stock;

                                        const updated = [
                                          ...productionData.rawMaterials,
                                        ];
                                        const rmIndex = updated.findIndex(
                                          (r) => r.id === rawMaterial.id
                                        );
                                        updated[rmIndex].inputQuantity = val;
                                        updated[rmIndex].newQuantity =
                                          usedRM + val;
                                        updated[rmIndex].stockError =
                                          isStockLow;

                                        setProductionData({
                                          ...productionData,
                                          rawMaterials: updated,
                                        });
                                      }}
                                    />
                                    {rawMaterial.stockError && (
                                      <div
                                        style={{
                                          color: "red",
                                          fontSize: "12px",
                                        }}
                                      >
                                        Insufficient Stock
                                      </div>
                                    )}
                                  </div>
                                </td>

                                <td>
                                  <div style={{ width: "120px" }}>
                                    {rawMaterial.newQuantity !== undefined
                                      ? rawMaterial.newQuantity
                                      : parseFloat(rawMaterial.usedRM || 0)}
                                  </div>
                                </td>
                              </tr>

                              {/* Child Raw Materials (C Icon) */}

                              {children.map((child, childIndex) => {
                                const defaultStoreId =
                                  stores.find((s) => s.is_default === 1)?.id ||
                                  stores[0]?.id;
                                const selectedStoreId =
                                  child.selectedStoreId || defaultStoreId;
                                const currentStock =
                                  storeStocks[
                                    `${child.product_id}-${selectedStoreId}`
                                  ];
                                const quantity =
                                  parseFloat(child.quantity) || 0;
                                const usedRM = parseFloat(child.usedRM) || 0;
                                const newQuantity = quantity + usedRM;
                                const isStockInsufficient =
                                  currentStock !== undefined &&
                                  quantity > currentStock;

                                return (
                                  <tr key={child.id} className="child_tr">
                                    <td
                                      className="active_td"
                                      style={{
                                        backgroundColor: "rgb(186,91,245,.29)",
                                      }}
                                    >
                                      <div style={{ whiteSpace: "nowrap" }}>
                                        {index + 1}.{childIndex + 1}
                                      </div>
                                    </td>

                                    {/* Product Name */}
                                    <td>
                                      <div style={{ minWidth: "200px" }}>
                                      {child.product_code} 
                                      </div>
                                    </td>

                                    {/* Product Code */}
                                    <td>
                                      <div style={{ minWidth: "150px" }}>
                                      {child.product_name || "N/A"}
                                      </div>
                                    </td>

                                    {/* Current Stock */}
                                    <td>
                                      <div style={{ minWidth: "150px" }}>
                                        {currentStock ?? "N/A"}
                                      </div>
                                    </td>

                                    {/* Estimated RM */}
                                    <td>
                                      <div style={{ minWidth: "120px" }}>
                                        {child.usedRM || 0}
                                      </div>
                                    </td>

                                    {/* Used RM */}
                                    <td>
                                      <div style={{ minWidth: "120px" }}>
                                        {child.usedRM || 0}
                                      </div>
                                    </td>

                                    {/* Unit */}
                                    <td>
                                      <div style={{ minWidth: "130px" }}>
                                        {child.unit || "N/A"}
                                      </div>
                                    </td>

                                    {/* Comment */}
                                    <td>
                                      <div style={{ width: "200px" }}>
                                        <input
                                          type="text"
                                          className="form-control form-control-sm"
                                          value={child.comment || ""}
                                          onChange={(e) => {
                                            const updatedChildren = [
                                              ...children,
                                            ];
                                            updatedChildren[
                                              childIndex
                                            ].comment = e.target.value;
                                            setChildren(updatedChildren);
                                          }}
                                        />
                                      </div>
                                    </td>

                                    {/* Store Selection */}
                                    <td>
                                      <div style={{ width: "180px" }}>
                                        <select
                                          className="form-select form-select-sm"
                                          value={selectedStoreId}
                                          onChange={(e) => {
                                            const newStoreId = e.target.value;
                                            handleStoreChange(
                                              child.product_id,
                                              newStoreId
                                            );
                                            const updatedChildren = [
                                              ...children,
                                            ];
                                            updatedChildren[
                                              childIndex
                                            ].selectedStoreId = newStoreId;
                                            setChildren(updatedChildren);
                                          }}
                                        >
                                          {stores.map((store) => (
                                            <option
                                              key={store.id}
                                              value={store.id}
                                            >
                                              {store.name}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </td>

                                    {/* Add / Less Type */}
                                    <td>
                                      <div style={{ width: "180px" }}>
                                        <select
                                          className="form-select form-select-sm"
                                          value={
                                            child.type || "Issue from store"
                                          }
                                          onChange={(e) => {
                                            const updatedChildren = [
                                              ...children,
                                            ];
                                            updatedChildren[childIndex].type =
                                              e.target.value;
                                            setChildren(updatedChildren);
                                          }}
                                        >
                                          <option>Issue from store</option>
                                          <option>Return to store</option>
                                        </select>
                                      </div>
                                    </td>

                                    {/* Quantity Input */}
                                    <td>
                                      <div style={{ width: "120px" }}>
                                        <input
                                          type="number"
                                          className="form-control form-control-sm"
                                          placeholder="0"
                                          onChange={(e) => {
                                            const val =
                                              parseFloat(e.target.value) || 0;
                                            const updatedChildren = [
                                              ...children,
                                            ];
                                            updatedChildren[
                                              childIndex
                                            ].quantity = val;
                                            updatedChildren[
                                              childIndex
                                            ].newQuantity = val + usedRM;
                                            updatedChildren[
                                              childIndex
                                            ].stockError =
                                              currentStock !== undefined &&
                                              val > currentStock;
                                            setChildren(updatedChildren);
                                          }}
                                        />
                                        {isStockInsufficient && (
                                          <div
                                            style={{
                                              color: "red",
                                              fontSize: "12px",
                                            }}
                                          >
                                            Insufficient Stock
                                          </div>
                                        )}
                                      </div>
                                    </td>

                                    {/* New Quantity */}
                                    <td>
                                      <div style={{ width: "120px" }}>
                                        {child.newQuantity !== undefined
                                          ? child.newQuantity
                                          : usedRM}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}

                              {/* Alternative Raw Materials (A Icon) */}
                              {alternatives.map((alt, altIndex) => {
                                const defaultStoreId =
                                  stores.find((s) => s.is_default === 1)?.id ||
                                  stores[0]?.id;
                                const selectedStoreId =
                                  alt.selectedStoreId || defaultStoreId;
                                const currentStock =
                                  storeStocks[
                                    `${alt.product_id}-${selectedStoreId}`
                                  ];
                                const inputQty =
                                  parseFloat(alt.inputQuantity) || 0;
                                const usedRM = parseFloat(alt.usedRM) || 0;
                                const newQty = inputQty + usedRM;
                                const isStockInsufficient =
                                  currentStock !== undefined &&
                                  inputQty > currentStock;

                                return (
                                  <tr key={alt.id} className="alternative_tr">
                                    <td
                                      className="active_td"
                                      style={{
                                        backgroundColor:
                                          "rgba(255, 190, 11, 0.25)",
                                      }}
                                    >
                                      <div style={{ whiteSpace: "nowrap" }}>
                                        {index + 1}.{altIndex + 1}
                                      </div>
                                    </td>

                                    {/* Product Name */}
                                    <td>
                                      <div style={{ minWidth: "200px" }}>
                                      {alt.product_code} 
                                      </div>
                                    </td>

                                    {/* Product Code */}
                                    <td>
                                      <div style={{ minWidth: "150px" }}>
                                      {alt.product_name || "N/A"}
                                      </div>
                                    </td>

                                    {/* Current Stock */}
                                    <td>
                                      <div style={{ minWidth: "150px" }}>
                                        {currentStock ?? "N/A"}
                                      </div>
                                    </td>

                                    {/* Estimated RM */}
                                    <td>
                                      <div style={{ minWidth: "140px" }}>
                                        {alt.quantity || 0}
                                      </div>
                                    </td>

                                    {/* Used RM */}
                                    <td>
                                      <div style={{ minWidth: "130px" }}>
                                        {alt.usedRM || 0}
                                      </div>
                                    </td>

                                    {/* Unit */}
                                    <td>
                                      <div style={{ minWidth: "130px" }}>
                                        {alt.unit || "N/A"}
                                      </div>
                                    </td>

                                    {/* Comment */}
                                    <td>
                                      <div style={{ width: "200px" }}>
                                        <input
                                          type="text"
                                          className="form-control form-control-sm"
                                          value={alt.comment || ""}
                                          onChange={(e) => {
                                            const updated = [...alternatives];
                                            updated[altIndex].comment =
                                              e.target.value;
                                            setAlternative(updated);
                                          }}
                                        />
                                      </div>
                                    </td>

                                    {/* Store Select */}
                                    <td>
                                      <div style={{ width: "180px" }}>
                                        <select
                                          className="form-select form-select-sm"
                                          value={selectedStoreId}
                                          onChange={(e) => {
                                            const newStoreId = e.target.value;
                                            handleStoreChange(
                                              alt.product_id,
                                              newStoreId
                                            );

                                            const updated = [...alternatives];
                                            updated[altIndex].selectedStoreId =
                                              newStoreId;
                                            setAlternative(updated);

                                            updateAlternativeStockError(
                                              alt,
                                              newStoreId,
                                              alt.inputQuantity
                                            );
                                          }}
                                        >
                                          {stores.map((store) => (
                                            <option
                                              key={store.id}
                                              value={store.id}
                                            >
                                              {store.name}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </td>

                                    {/* Issue / Return Type */}
                                    <td>
                                      <div style={{ width: "180px" }}>
                                        <select
                                          className="form-select form-select-sm"
                                          value={
                                            alt.addLess || "Issue from store"
                                          }
                                          onChange={(e) => {
                                            const updated = [...alternatives];
                                            updated[altIndex].addLess =
                                              e.target.value;
                                            setAlternative(updated);
                                          }}
                                        >
                                          <option>Issue from store</option>
                                          <option>Return to store</option>
                                        </select>
                                      </div>
                                    </td>

                                    {/* Quantity Input */}
                                    <td>
                                      <div style={{ width: "120px" }}>
                                        <input
                                          type="number"
                                          className="form-control form-control-sm"
                                          value={
                                            alt.inputQuantity === 0
                                              ? ""
                                              : alt.inputQuantity || ""
                                          }
                                          placeholder="0"
                                          onChange={(e) => {
                                            const qty =
                                              parseFloat(e.target.value) || 0;
                                            const updated = [...alternatives];
                                            updated[altIndex].inputQuantity =
                                              qty;
                                            updated[altIndex].newQuantity =
                                              qty + usedRM;
                                            updated[altIndex].stockError =
                                              currentStock !== undefined &&
                                              qty > currentStock;
                                            setAlternative(updated);

                                            updateAlternativeStockError(
                                              alt,
                                              selectedStoreId,
                                              qty
                                            );
                                          }}
                                        />
                                        {isStockInsufficient && (
                                          <div
                                            style={{
                                              color: "red",
                                              fontSize: "0.8rem",
                                            }}
                                          >
                                            Insufficient Stock
                                          </div>
                                        )}
                                      </div>
                                    </td>

                                    {/* New Quantity */}
                                    <td>
                                      <div style={{ width: "120px" }}>
                                        {alt.newQuantity !== undefined
                                          ? alt.newQuantity
                                          : usedRM}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
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
              </div>
            </div>
          </Collapse>
        </div>
        {/* Issue raw Material end */}

        {/* Mark Scrap Generated start */}
        <div className="card shadow-none border">
          <div className="card-header border-bottom-0 d-flex justify-content-between align-items-center flex-wrap">
            <h6 className="my-1 me-3 fw-semibold">
              <span className="me-3">Mark Scrap Generated</span>
            </h6>
            <Tooltip title="Expand">
              <button
                type="button"
                className="link-btn ms-auto"
                onClick={() =>
                  setOpenMarkScrapGenerated(!openMarkScrapGenerated)
                }
                aria-expanded={openMarkScrapGenerated}
              >
                <i className="fas fa-sort ms-2 line-height-1"></i>
              </button>
            </Tooltip>
          </div>
          <Collapse in={openMarkScrapGenerated}>
            <div className="card-body border-top bg-light rounded-bottom-10 pb-1">
              <div className="table-responsive">
                <table className="table table-bordered primary-table-head">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Item ID</th>
                      <th>Item Name</th>
                      <th>Estimated Quantity</th>
                      <th>Actual Quantity</th>
                      <th>Unit</th>
                      <th>Store</th>
                      <th>Quantity</th>
                      <th>New Quantity</th>
                      <th>Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productionData?.scrapItems?.length > 0 ? (
                      productionData.scrapItems.map((sc, index) => {
                        const actual = Number(sc.actualquantity || 0);
                        const quantityAdded = sc.quantityAdded || 0;
                        const newQuantity = actual + Number(quantityAdded);

                        return (
                          <tr key={index}>
                            <td>{index + 1}</td>

                            <td>
                              <div style={{ minWidth: "200px" }}>
                                {sc.product_code || "N/A"}
                              </div>
                            </td>

                            <td>
                              <div style={{ minWidth: "200px" }}>
                                {sc.product_name || "N/A"}
                              </div>
                            </td>

                            <td>
                              <div style={{ minWidth: "150px" }}>
                                {sc.estimatedquantity || "0"}
                              </div>
                            </td>

                            <td>
                              <div style={{ minWidth: "150px" }}>
                                {sc.actualquantity || "0"}
                              </div>
                            </td>

                            <td>
                              <div style={{ minWidth: "100px" }}>
                                {sc.scrap_unit || "N/A"}
                              </div>
                            </td>

                            <td>
                              <div style={{ minWidth: "150px" }}>
                                {productionData?.storeDetails
                                  ?.scrap_store_id ===
                                productionData?.production?.scrap_store
                                  ? productionData?.storeDetails
                                      ?.scrap_store_name
                                  : "Store Not Found"}
                              </div>
                            </td>

                            <td>
                              <div style={{ width: "120px" }}>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={sc.quantityAdded || ""}
                                  onChange={(e) => {
                                    const updatedScrap = [
                                      ...productionData.scrapItems,
                                    ];
                                    updatedScrap[index].quantityAdded = Number(
                                      e.target.value || 0
                                    );
                                    setProductionData((prev) => ({
                                      ...prev,
                                      scrapItems: updatedScrap,
                                    }));
                                  }}
                                />
                              </div>
                            </td>

                            <td>
                              <div style={{ width: "120px" }}>
                                {newQuantity}
                              </div>
                            </td>

                            <td>
                              <div style={{ width: "200px" }}>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={sc.comment || ""}
                                  onChange={(e) => {
                                    const updatedScrap = [
                                      ...productionData.scrapItems,
                                    ];
                                    updatedScrap[index].comment =
                                      e.target.value;
                                    setProductionData((prev) => ({
                                      ...prev,
                                      scrapItems: updatedScrap,
                                    }));
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="10" className="text-center">
                          No Scrap Items Found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Collapse>
        </div>
        {/* Mark Scrap Generated end */}

        {/* Log Routing Data start */}
        <div className="card shadow-none border">
          <div className="card-header border-bottom-0 d-flex justify-content-between align-items-center flex-wrap">
            <h6 className="my-1 me-3 fw-semibold">
              <span className="me-3">Log Routing Data</span>
            </h6>
            <Tooltip title="Expand">
              <button
                type="button"
                className="link-btn ms-auto"
                onClick={() => setOpenLogRoutingData(!openLogRoutingData)}
                aria-expanded={openLogRoutingData}
              >
                <i className="fas fa-sort ms-2 line-height-1"></i>
              </button>
            </Tooltip>
          </div>
          <Collapse in={openLogRoutingData}>
            <div className="card-body border-top bg-light rounded-bottom-10 pb-1">
              <div className="mb-3">
                <p className="mb-1 fw-medium">
                  FG : {productionData?.finishedGoods[0].product_name} (
                  {productionData?.finishedGoods[0].product_code})
                </p>
                <p className="mb-1 fw-medium">
                  Target Production : {targetProduction}{" "}
                  {productionData?.finishedGoods[0].unit}
                </p>
              </div>
              <div className="table-responsive">
                <table className="table table-bordered primary-table-head">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Current FG quantity</th>
                      <th>Change in FG quantity</th>
                      <th>Final FG quantity</th>
                      <th>Completion %</th>
                      <th>Comment</th>
                      <th>Mark Done</th>
                    </tr>
                  </thead>
                  <tbody>
  {productionData?.routing?.length > 0 ? (
    productionData.routing.map((route, index) => {
      const currentFG = Number(route.current_fg_qty || 0);
      const changeQty = Number(route.change_input_qty || 0); // ✅ use value from route
      const finalFG = currentFG + changeQty;

      const targetProduction = Number(
        productionData?.finishedGoods?.[0]?.targetProduction || 1
      );
      const completion = ((finalFG / targetProduction) * 100).toFixed(2);

      return (
        <tr key={index}{ ...(route.mark_done === 1 ? { className: "process_tbl_disble_tr" } : {}) } >
          <td>
            <div style={{ width: "150px" }}>{route.route_id}</div>
          </td>
          <td>
            <div style={{ width: "200px" }}>{route.route_name}</div>
          </td>
          <td>
            <div style={{ width: "150px" }}>{currentFG}</div>
          </td>
          <td>
            <div style={{ width: "150px" }}>
              <input
                type="number"
                className="form-control form-control-sm"
                
                onChange={(e) => {
                  const updatedRoutes = [...productionData.routing];
                  updatedRoutes[index].change_input_qty = e.target.value;
                  setProductionData((prev) => ({
                    ...prev,
                    routing: updatedRoutes,
                  }));
                }}
              />
            </div>
          </td>
          <td>
            <div style={{ width: "150px" }}>{finalFG}</div>
          </td>
          <td>
            <div style={{ width: "150px" }}>
              {completion}%
              {parseFloat(completion) > 100 && (
                <p className="text-danger mb-0 small">
                  Completion is greater than 100%
                </p>
              )}
            </div>
          </td>
          <td>
            <div style={{ width: "200px" }}>
              <input
                type="text"
                className="form-control form-control-sm"
                value={route.comment || ""}
                onChange={(e) => {
                  const updatedRoutes = [...productionData.routing];
                  updatedRoutes[index].comment = e.target.value;
                  setProductionData((prev) => ({
                    ...prev,
                    routing: updatedRoutes,
                  }));
                }}
              />
            </div>
          </td>
          <td>
            <div style={{ width: "120px" }}>
              <label className="custom-checkbox me-0 mb-0">
                <input
                  type="checkbox"
                  checked={route.mark_done === 1}
                  onChange={(e) => {
                    const updatedRoutes = [...productionData.routing];
                    updatedRoutes[index].mark_done = e.target.checked ? 1 : 0;
                    setProductionData((prev) => ({
                      ...prev,
                      routing: updatedRoutes,
                    }));
                  }}
                />
                <span className="checkmark" />
              </label>
            </div>
          </td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan="12" className="text-center">
        No Routing Found.
      </td>
    </tr>
  )}
</tbody>

                </table>
              </div>
            </div>
          </Collapse>
        </div>
        {/* Log Routing Data end */}

        {/* Log Other Charges start */}
        <div className="card shadow-none border">
          <div className="card-header border-bottom-0 d-flex justify-content-between align-items-center flex-wrap">
            <h6 className="my-1 me-3 fw-semibold">
              <span className="me-3">Log Other Charges</span>
            </h6>
            <Tooltip title="Expand">
              <button
                type="button"
                className="link-btn ms-auto"
                onClick={() => setOpenLogOtherCharges(!openLogOtherCharges)}
                aria-expanded={openLogOtherCharges}
              >
                <i className="fas fa-sort ms-2 line-height-1"></i>
              </button>
            </Tooltip>
          </div>
          <Collapse in={openLogOtherCharges}>
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
                    {/* Labour Charges */}
                    <tr>
                      <td>
                        <div>1</div>
                      </td>
                      <td>
                        <div style={{ minWidth: 250 }}>Labour Charges</div>
                      </td>
                      <td className="text-end">
                        {getGeneralSettingssymbol}
                        {productionData?.production.labour_charges?.toFixed(2)}
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control text-end"
                          value={
                            productionData?.production.labourChargesAA || ""
                          }
                          onChange={(e) =>
                            setProductionData((prev) => ({
                              ...prev,
                              production: {
                                ...prev.production,
                                labourChargesAA: parseFloat(
                                  e.target.value || 0
                                ),
                              },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={
                            productionData?.production.labourCharges_comment ||
                            ""
                          }
                          onChange={(e) =>
                            setProductionData((prev) => ({
                              ...prev,
                              production: {
                                ...prev.production,
                                labourCharges_comment: e.target.value,
                              },
                            }))
                          }
                        />
                      </td>
                    </tr>

                    {/* Machinery Charges */}
                    <tr>
                      <td>
                        <div>2</div>
                      </td>
                      <td>
                        <div style={{ minWidth: 250 }}>Machinery Charges</div>
                      </td>
                      <td className="text-end">
                        {getGeneralSettingssymbol}
                        {productionData?.production.machinery_charges?.toFixed(
                          2
                        )}
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control text-end"
                          value={
                            productionData?.production.machineryChargesAA || ""
                          }
                          onChange={(e) =>
                            setProductionData((prev) => ({
                              ...prev,
                              production: {
                                ...prev.production,
                                machineryChargesAA: parseFloat(
                                  e.target.value || 0
                                ),
                              },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={
                            productionData?.production
                              .machineryCharges_comment || ""
                          }
                          onChange={(e) =>
                            setProductionData((prev) => ({
                              ...prev,
                              production: {
                                ...prev.production,
                                machineryCharges_comment: e.target.value,
                              },
                            }))
                          }
                        />
                      </td>
                    </tr>

                    {/* Electricity Charges */}
                    <tr>
                      <td>
                        <div>3</div>
                      </td>
                      <td>
                        <div style={{ minWidth: 250 }}>Electricity Charges</div>
                      </td>
                      <td className="text-end">
                        {getGeneralSettingssymbol}
                        {productionData?.production.electricity_charges?.toFixed(
                          2
                        )}
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control text-end"
                          value={
                            productionData?.production.electricityChargesAA ||
                            ""
                          }
                          onChange={(e) =>
                            setProductionData((prev) => ({
                              ...prev,
                              production: {
                                ...prev.production,
                                electricityChargesAA: parseFloat(
                                  e.target.value || 0
                                ),
                              },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={
                            productionData?.production
                              .electricityCharges_comment || ""
                          }
                          onChange={(e) =>
                            setProductionData((prev) => ({
                              ...prev,
                              production: {
                                ...prev.production,
                                electricityCharges_comment: e.target.value,
                              },
                            }))
                          }
                        />
                      </td>
                    </tr>

                    {/* Other Charges */}
                    <tr>
                      <td>
                        <div>4</div>
                      </td>
                      <td>
                        <div style={{ minWidth: 250 }}>Other Charges</div>
                      </td>
                      <td className="text-end">
                        {getGeneralSettingssymbol}
                        {productionData?.production.other_charges?.toFixed(2)}
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control text-end"
                          value={
                            productionData?.production.otherChargesAA || ""
                          }
                          onChange={(e) =>
                            setProductionData((prev) => ({
                              ...prev,
                              production: {
                                ...prev.production,
                                otherChargesAA: parseFloat(e.target.value || 0),
                              },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={
                            productionData?.production.otherCharges_comment ||
                            ""
                          }
                          onChange={(e) =>
                            setProductionData((prev) => ({
                              ...prev,
                              production: {
                                ...prev.production,
                                otherCharges_comment: e.target.value,
                              },
                            }))
                          }
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Collapse>
        </div>
        {/* Log Other Charges end */}
      </Modal.Body>
      <Modal.Footer className="gth-blue-light-bg">
        <button className="btn" onClick={handleClose}>
          Cancel
        </button>
        <button
          className="btn btn-exp-green"
          onClick={handleSubmit}
          disabled={hasAnyInsufficientStock()}
        >
          Save Changes
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProcessStartModal;
