import { DropDownList } from "@progress/kendo-react-dropdowns";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { PrivateAxios } from "../../../environment/AxiosInstance";
import { ErrorMessage } from "../../../environment/ToastMessage";
const RawMaterialAddAlternateItemModal = ({
  show,
  handleClose,
  setRowsrm,
  rowsrm,
  setRowsRawMaterial,
  rowsRawMaterial,
  showRawMaterialAddAlternateItemModalId,
}) => {
  // State for rows
  const [finishItems, setFinishItems] = useState([]); // Items for dropdown options
  const [finishAlternativeCount, setFinishAlternativeCount] = useState("");
  const [data, setData] = useState([]);

  // console.log(rowsRawMaterial, "row ,meterial==");

  useEffect(() => {
    if (showRawMaterialAddAlternateItemModalId !== null && showRawMaterialAddAlternateItemModalId !== undefined) {
      const selectedRow = rowsRawMaterial[showRawMaterialAddAlternateItemModalId];
  
      if (selectedRow) {
        setData(selectedRow.alternateItems);
        //console.log(selectedRow.alternateItems, "ids");
      } else {
        console.log("Row not found for ID:", showRawMaterialAddAlternateItemModalId);
      }
    }
  }, [showRawMaterialAddAlternateItemModalId, rowsRawMaterial]);
  

  // console.log(,"data");
  //console.log(showRawMaterialAddAlternateItemModalId, "data====");

  //   rowsRawMaterial.map((row, rowIndex) =>
  //     rowIndex === showRawMaterialAddAlternateItemModalId
  //       ? setData(row.alternateItems)
  //       : []
  //   ),

  // Fetch all items for dropdown options (ID and Name)
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

  // Fetch item details when either ID or Name changes
  const fetchItemDetails = async (queryParam, index) => {
    try {
      if (!queryParam) return; // Prevent unnecessary API calls
      const response = await PrivateAxios.get(
        `/production/finishedgoods-select?${queryParam}`
      );
      if (response.data?.data) {
        setData((prevRows) =>
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
  const addRow = () => {
    // If there are no rowsrm, just add the first one
    if (data.length === 0) {
      setData([
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
      const lastRow = data[data.length - 1];
      if (lastRow?.product_code || lastRow?.product_name) {
        setData((prevRows) => [
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

  // Remove a specific row
  const removeRow = (index) => {
    setData((prevRows) => prevRows.filter((_, rowIndex) => rowIndex !== index));
  };

  // Update a specific row field
  const handleRowChange = (index, field, value) => {
    setFinishAlternativeCount(data.length);
    setData((prevRows) =>
      prevRows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    );

    // Fetch item details if ID or Name is changed
    if (field === "id") {
      fetchItemDetails(`product_code=${value}`, index);
    } else if (field === "name") {
      fetchItemDetails(`product_name=${value}`, index);
    }
  };

  const submitForm = () => {
    setRowsRawMaterial((prevRows) =>
      prevRows.map((row, rowIndex) =>
        rowIndex === showRawMaterialAddAlternateItemModalId
          ? { ...row, alternateItems: data }
          : row
      )
    );
    setData([]);
    handleClose();
  };
  return (
    <>
      <Modal
        id="BomAddAlternateItemModal"
        show={show}
        onHide={handleClose}
        backdrop="static"
        centered
        size="lg"
        className="fullscreen"
      >
        <Modal.Header closeButton>
          <Modal.Title className="gth-modal-title">
            Add Alternate Items
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="table-responsive">
            <table className="table table-bordered primary-table-head">
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/*  */}
                {data.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="width-200">
                        <select
                          className="form-select"
                          value={row?.product_code || "N/A"}
                          onChange={(e) =>
                            handleRowChange(index, "id", e.target.value)
                          }
                        >
                          <option value="">Select ID</option>
                          {finishItems.map((item) => (
                            <option key={item.id} value={item.product_code}>
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
                            handleRowChange(index, "name", e.target.value)
                          }
                        >
                          <option value="">Select Name</option>
                          {finishItems.map((item) => (
                            <option key={item.id} value={item.product_name}>
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
                          handleRowChange(index, "quantity", e.target.value)
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
                          handleRowChange(
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
                          handleRowChange(index, "comment", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => removeRow(index)}
                      >
                        <i className="fas fa-minus-circle fs-5 text-danger"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={addRow}
          >
            <i className="fas fa-plus me-2"></i>Add Row
          </button>
        </Modal.Body>
        <Modal.Footer className="gth-blue-light-bg">
          <button type="reset" className="btn btn-light" onClick={handleClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-exp-green"
            onClick={submitForm}
          >
            Save
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RawMaterialAddAlternateItemModal;
