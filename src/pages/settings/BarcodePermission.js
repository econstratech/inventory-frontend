import React, { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  Form,
  Modal,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { PrivateAxios } from "../../environment/AxiosInstance";
import Loader from "../landing/loder/Loader";
import { SuccessMessage, ErrorMessage } from "../../environment/ToastMessage";
import SettingsInventoryTopBar from "./settingsInventory/SettingsInventoryTopBar";

function BarcodePermission() {
  const [key, setKey] = useState("In-Stock Stores");
  const [loading, setLoading] = useState(false);
  const styles = {
    labelContainer: {
      width: '50%',
      border: '1px solid #ccc',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
    },
    barcodeimage: {
      maxHeight: '100px',
    },
    labelHeader: {

      padding: '5px',
      fontWeight: 'bold',
      fontSize: '12px',
    },
    sku: {
      fontWeight: 'bold',
      margin: '5px 0',
    },
    barcode: {
      margin: '5px 0',
    },
    productCode: {
      margin: '5px 0',
      fontWeight: 'bold',
      fontSize: '12px',
    },
    barcodeText: {
      fontFamily: 'monospace', // Using a monospaced font to match
      fontSize: '12px',
      fontWeight: 'bold',
      marginTop: '5px',
    },
  };

  const [formData, setFormData] = useState({
    companyName: '',
    barcodeNumber: '1',
    itemId: '1',
    anotherCompanyName: '1',
  });

  // Fetch existing data on component mount
  useEffect(() => {
    PrivateAxios.get('/getbarcode')
      .then(response => {
        setFormData(response.data.data);
      })
      .catch(error => {
        ErrorMessage('There was an error fetching the data!');
      });
  }, []);

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();

    PrivateAxios.post('/updatebarcode', formData)
      .then(response => {
        SuccessMessage('Data updated successfully!');
      })
      .catch(error => {
        console.error('There was an error updating the data!', error);
      });
  };


  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <SettingsInventoryTopBar />
          <div className="p-4">
            <div className="card">

              <div className="card-body">
                <ul
                  className="nav nav-tabs gth-tabs"
                  id="systemControllerFilterTab"
                  role="tablist"
                >
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link active`}
                      data-bs-toggle="tab"
                      data-bs-target="#systemTaskTodo"
                      type="button"
                      role="tab"
                      aria-controls="systemTaskTodo"
                      aria-selected="General"
                    >
                      <span className="btn-todo">General</span>
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link`}
                      data-bs-toggle="tab"
                      data-bs-target="#systemTaskInProgressLabel"
                      type="button"
                      role="tab"
                      aria-controls="systemTaskInProgressLabel"
                      aria-selected="Label"
                    >
                      <span className="btn-inprogress">Label</span>
                    </button>
                  </li>
                </ul>

                <div className="tab-content pt-0">
                  <div
                    className={`tab-pane active`}
                    id="systemTaskTodo"
                    role="tabpanel"
                  >
                    <div className="px-0 p-3">
                      <div className="row">
                        <div class="d-flex flex-row mt-6 align-center">
                          <span class="tz-semi-bold tz-small-title tz-neutral-7 mr-2 f-s-16">
                            How to Print Barcodes
                          </span>
                          <hr
                            role="separator"
                            aria-orientation="horizontal"
                            class="v-divider theme--light"
                          ></hr>
                        </div>
                        <div class="d-flex flex-row mt-2">
                          <div class="videowrapper">
                            <iframe

                              src="https://www.youtube.com/embed/0YHaNFI3k2Q"
                              title="YouTube video player"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowfullscreen="allowfullscreen"
                            ></iframe>
                            <div

                              class="overlayWrapper pointer"
                            ></div>
                          </div>
                          <div

                            height="180px"
                            class="d-flex flex-column justify-space-between ml-4 tz-body tz-regular py-1 px-2"
                          >
                            <div className="f-s-16">
                              1. Click on "Print Now".<br></br>
                              2. When the print dialogue box opens up, select the
                              barcode printer connected to your system.<br></br>
                              3. Open More Settings of the browser and select
                              "Print using System Dialogue".<br></br>
                              4. In the System Dialogue, select the Barcode
                              Printer.<br></br>
                              5. Select the Paper Size. Add your Custom Paper Size
                              if not already added.<br></br>
                              6. Click on Print.<br></br>
                            </div>
                            <div class="d-flex justify-center align-end w-100 tz-neutral-8 tz-semi-bold tz-neutral-3-bg">
                              Note: Please reach out to us on chat if you need any
                              help.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>


                  <div
                    className={`tab-pane`}
                    id="systemTaskInProgressLabel"
                    role="tabpanel"
                  >
                    <div className="p-3">
                      <div className="row">
                        <div class='col-12 text-center f-s-15 pb-10 mb-10'>SAMPLE LABELS</div>
                        <div style={styles.labelContainer}>
                          <div style={styles.labelHeader}>{formData.company_name && formData.company_name != 0 ? formData.company_name : ''}</div>
                          <div style={styles.sku}>{formData.has_product_code && formData.has_product_code != 0 ? 'SKU00024' : ''}</div>
                          <div style={styles.barcode}>
                            <img src={process.env.PUBLIC_URL + '/assets/images/barcode.png'} style={styles.barcodeimage} className=" img-fluid mt-1 ms-2" />
                          </div>
                          <div style={styles.productCode}>{formData.has_barcode_number && formData.has_barcode_number != 0 ? "65463535365665634" : ''}</div>
                        </div>
                        <div style={styles.labelContainer}>
                          <div style={styles.labelHeader}>{formData.company_name && formData.company_name != 0 ? formData.company_name : ''}</div>
                          <div style={styles.sku}>{formData.has_product_code && formData.has_product_code != 0 ? 'SKU00324' : ''}</div>
                          <div style={styles.barcode}>
                            <img src={process.env.PUBLIC_URL + '/assets/images/barcode.png'} style={styles.barcodeimage} className=" img-fluid mt-1 ms-2" />
                          </div>
                          <div style={styles.productCode}>{formData.has_barcode_number && formData.has_barcode_number != 0 ? "3454354523464566" : ''}</div>
                        </div>
                      </div>
                      <div className="row">
                        <div class='col-12 f-s-18 '>
                          <h5 className="my-3 fw-bold">Customize Label</h5>
                        </div>
                        <form onSubmit={handleSubmit}>
                          <div className="form-group">
                            <label>Company Name</label>
                            <input
                              type="text"
                              name="company_name"  // Ensure this matches the key in formData
                              value={formData.company_name || ""}
                              onChange={handleChange}
                              placeholder="Enter title"
                              className="form-control"
                            />
                          </div>

                          <div className="form-group">
                            <label>Barcode Number</label>

                            <select
                              name="has_barcode_number"  // Ensure this matches the key in formData
                              value={formData.has_barcode_number || "1"}
                              onChange={handleChange}
                              className="form-control"
                            >
                              <option value="1">Yes</option>
                              <option value="0">No</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label>Product Code</label>
                            <select
                              name="has_product_code"  // Ensure this matches the key in formData
                              value={formData.has_product_code || "1"}
                              onChange={handleChange}
                              className="form-control"
                            >
                              <option value="1">Yes</option>
                              <option value="0">No</option>
                            </select>
                          </div>

                          {/* <div className="form-group">
                            <label>Another Company Name</label>
                            <select
                              name="company_name"  // Ensure this matches the key in formData
                              value={formData.company_name}
                              onChange={handleChange}
                              className="form-control"
                            >
                              <option value="1">Yes</option>
                              <option value="0">No</option>
                            </select>
                          </div> */}

                          <button type="submit" className="btn btn-success  ms-auto d-block">
                            Update
                          </button>
                        </form>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}


    </>
  );
}

export default BarcodePermission;
