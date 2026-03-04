import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Loader from "../../environment/Loader"; // Assuming you have this component in the same directory
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import { UserAuth } from "../auth/Auth";

import "../global.css";
import {
  // Axios,
  PrivateAxios,
  // PrivateAxiosFile,
} from "../../environment/AxiosInstance";

function AddNewVendor() {
  // Set reminder
  const [loading, setLoading] = useState(false); // Initialize loading as false
  const [error, setError] = useState({});
  //country list
  // const [countries, setCountries] = useState([]);
  // const [selectedCountry, setSelectedCountry] = useState(null);
  // const [gstin, setGstin] = useState('');
  // const [companyDetails, setCompanyDetails] = useState(null);
  // const [isVerifying, setIsVerifying] = useState(false);
  // const apiKey = 'QfJkSKRK6zgFjId6llu5NiMKUzL2';
  // const [tags, setTags] = useState([]);

  // const handleChange = (newTags) => {
  //   setTags(newTags);
  // };
  // useEffect(() => {
  //   Axios
  //     .get("https://api.first.org/data/v1/countries") // No auth header needed
  //     .then((response) => {
  //       const rawData = response.data.data;
  //       const countryOptions = Object.keys(rawData).map((key) => ({
  //         label: rawData[key].country,
  //         value: rawData[key].country
  //       }));
  
  //       setCountries(countryOptions);
  
  //       // ✅ Set default country after countries are loaded
  //       setFormData((prevData) => ({
  //         ...prevData,
  //         country: { value: 'India', label: 'India' },
  //       }));
  //     })
  //     .catch((error) => console.error("Error fetching countries:", error));
  // }, []);

  const [formData, setFormData] = useState({
    vendor_name: "",
    email: "",
    address: "",
    mobile: "",
  });

  const getVendorData = async (e, data) => {
    if (e.target) {
      var name = e.target.name;
      setFormData({ ...formData, [name]: e.target.value });
    } else {
      setFormData({ ...formData, [data.name]: e.value });
    }
  };

  const navigate = useNavigate();

  // const fileUpload = async (e) => {
  //   const file = e.target.files[0];
  //   let fileSize = file.size;
  //   if (Number(fileSize) >= 2097152) {
  //     setError({ file: "This image in getter than 2MB" });
  //   } else {
  //     setFormData({ ...formData, file: e.target.files[0] });
  //     setError("");
  //   }
  // };

  // const verifyGST = async () => {
  //   if (!gstin) {
  //     setError('Please enter a GSTIN number.');
  //     return;
  //   }

  //   if (isVerifying) return;

  //   setIsVerifying(true);
  //   try {
  //     SuccessMessage("Request sent to GST Portal");

  //     const response = await Axios.get(`https://appyflow.in/api/verifyGST`, {
  //       params: {
  //         gstNo: gstin,
  //         key_secret: apiKey,
  //       },
  //     });

  //     if (response.data && response.data.taxpayerInfo) {
  //       const taxpayerInfo = response.data.taxpayerInfo;
  //       setCompanyDetails(taxpayerInfo);

  //       // ✅ Autofill form fields from GST data
  //       setFormData((prev) => ({
  //         ...prev,
  //         vendor_name: taxpayerInfo.tradeNam || "",
  //         address: [
  //           taxpayerInfo.pradr?.addr?.bnm,
  //           taxpayerInfo.pradr?.addr?.bno,
  //           taxpayerInfo.pradr?.addr?.flno,
  //         ].filter(Boolean).join(", "),
  //         address2: [
  //           taxpayerInfo.pradr?.addr?.st,
  //           taxpayerInfo.pradr?.addr?.loc,
  //           taxpayerInfo.pradr?.addr?.dst,
  //         ].filter(Boolean).join(", "),
  //         state: taxpayerInfo.pradr?.addr?.stcd || "",
  //         city: taxpayerInfo.pradr?.addr?.dst || "",
  //         zip: taxpayerInfo.pradr?.addr?.pncd || "",
  //         pan: taxpayerInfo.panNo || "",
  //         gstin: gstin, // ensure GSTIN is reflected in formData too
  //       }));

  //       SuccessMessage("GST details fetched successfully.");
  //     } else {
  //       ErrorMessage('Invalid GSTIN or no data found.');
  //     }
  //   } catch (error) {
  //     ErrorMessage('Error fetching GST details. Please try again later.');
  //     console.error(error);
  //   } finally {
  //     setIsVerifying(false);
  //   }
  // };

  const SubmitData = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Sync gstin to formData
    // setFormData((prev) => ({ ...prev }));

    // Wait a tick to ensure formData is updated
    setTimeout(async () => {
      const formData1 = new FormData();
      formData1.append("vendor_name", formData.vendor_name || "");
      // formData1.append("type", formData.type || "");
      formData1.append("address", formData.address || "");
      // formData1.append("address2", formData.address2 || "");
      // formData1.append("gst_treatment", formData.gst_treatment || "");

      // ✅ Proper GSTIN and country handling
      // formData1.append("gstin", gstin || "");
      // formData1.append("country", formData.country?.value || "");

      // formData1.append("pan", formData.pan || "");
      // formData1.append("phone", formData.phone || "");
      formData1.append("mobile", formData.mobile || "");
      formData1.append("email", formData.email || "");
      // formData1.append("zip", formData.zip || "");
      // formData1.append("state", formData.state || "");
      // formData1.append("city", formData.city || "");
      // formData1.append("website", formData.website || "");
      // formData1.append("account_number", formData.account_number || "");
      // formData1.append("bank_name", formData.bank_name || "");
      // formData1.append("account_holder", formData.account_holder || "");
      // formData1.append("ifsc_code", formData.ifsc_code || "");
      // formData1.append("file", formData.file || "");

      // formData1.append("tags", JSON.stringify(tags));

      try {
        const res = await PrivateAxios.post("vendor/add", formData1);
        if (res.status === 200) {
          SuccessMessage("Supplier is added successfully!");
          navigate("/suppliers");
        }
      } catch (error) {
        setLoading(false);
        ErrorMessage(error?.response?.data?.message || "Failed to add supplier.");
        console.error("There was an error!", error);
      }
    }, 0); // Delay to ensure setFormData finishes
  };

  return (
    <React.Fragment>
      {loading ? (
        <Loader />
      ) : (
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
              <div className="card-header">
                <h3 className="card-title">Add New Supplier</h3>
              </div>
              <form action="" onSubmit={SubmitData} method="post">
                <div className="card-body pb-1">
                  <div className="row">
                  {/* <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                       <div className="d-flex align-items-center gap-2">
                        <div className="form-group w-100">
                          <label className="form-label">GSTIN</label>
                          <input
                            type="text"
                            title="Only letters and numbers are allowed"
                            pattern="[A-Za-z0-9 ]*"
                            className="form-control text-uppercase "
                            name="gstin"
                            placeholder="e.g. BE0477472501"
                            onChange={(e) => setGstin(e.target.value)}
                            
                          />
                        </div>
                        <button
                          className="btn btn-exp-purple btn-sm"
                          type="button"
                          onClick={verifyGST}
                          disabled={isVerifying}
                        >
                          {isVerifying ? "Verifying..." : "Verify GST"}
                        </button>
                      </div>
                    </div> */}

                    <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">Vendor Name</label>
                        <input
                          type="text"
                          title="Only letters and numbers are allowed"
                          className="form-control"
                          name="vendor_name"
                          placeholder="Enter vendor Name"
                          onChange={getVendorData}
                          required
                        />
                        {error.vendor_name ? (
                          <span className="field-invalid">
                            <i class="bi bi-exclamation-triangle-fill me-1"></i>
                            {error.catname}
                          </span>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>

                    <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          placeholder="Enter your email"
                          onChange={getVendorData}
                          
                        />
                      </div>
                    </div>


                    {/* <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">Vendor Type</label>
                        <div className="custom-select-wrap">
                          <select
                            class="form-select"
                            aria-label="Default select example"
                            name="type"
                            onChange={getVendorData}
                            
                          >
                            <option value="">Select </option>
                            <option value="Individual">Individual</option>
                            <option value="Company">Company</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">Website</label>
                        <input
                          type="url"
                          className="form-control"
                          name="website"
                          placeholder="http://www.econstra.com"
                          onChange={getVendorData}

                        />
                      </div>
                    </div> */}
                 
                    {/* <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">Address 2</label>
                        <input
                          type="text"
                          className="form-control"
                          name="address2"
                          placeholder="Enter Product Code"
                          onChange={getVendorData}
                           value={formData.address2 || ""}
                          
                        />
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">Country</label>
                        <Select
                          name="country"
                          options={countries}
                          onChange={getVendorData}
                          placeholder="Select a country"
                          defaultValue={{ value: 'India', label: 'India' }}
                        />
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">State</label>
                        <input
                          type="text"
                          title="Only letters and numbers are allowed"
                          pattern="[A-Za-z0-9 ]*"
                          className="form-control"
                          name="state"
                          placeholder="Enter state"

                          value={companyDetails && companyDetails.pradr && companyDetails.pradr.addr && companyDetails.pradr.addr.stcd}
                          onChange={getVendorData}
                          
                        />
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          title="Only letters and numbers are allowed"
                          pattern="[A-Za-z0-9 ]*"
                          className="form-control"
                          name="city"
                          value={companyDetails && companyDetails.pradr && companyDetails.pradr.addr && companyDetails.pradr.addr.dst}
                          placeholder="Enter city"
                          onChange={getVendorData}
                          
                        />
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">Zip</label>
                        <input
                          type="text"
                          title="Only numbers are allowed"
                          pattern="[0-9]*"
                          className="form-control"
                          name="zip"
                          value={companyDetails && companyDetails.pradr && companyDetails.pradr.addr && companyDetails.pradr.addr.pncd}
                          placeholder="Enter zip Code"
                          onChange={getVendorData}
                          
                        />
                      </div>
                    </div> */}
  
                    {/* <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input
                          type="text"
                          title="Only numbers are allowed"
                          pattern="[0-9]*"
                          className="form-control"
                          name="phone"
                          placeholder="Enter your phone"
                          onChange={getVendorData}
                          
                        />
                      </div>
                    </div> */}
                    <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">Mobile</label>
                        <input
                          type="text"
                          title="Only numbers are allowed"
                          pattern="[0-9]*"
                          className="form-control"
                          name="mobile"
                          placeholder="Enter your mobile number"
                          onChange={getVendorData}
                          
                        />
                      </div>
                    </div>

                    <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">Address</label>
                        <textarea
                          type="text"
                          className="form-control"
                          name="address"
                          placeholder="Enter Address"
                          onChange={getVendorData}
                          value={formData.address || ""}
                          rows={3}
                        />
                      </div>
                    </div>


                    {/* <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">GST Treatment</label>
                        <div className="custom-select-wrap">
                          <select
                            class="form-select"
                            aria-label="Default select example"
                            name="gst_treatment"
                            onChange={getVendorData}
                            
                          >
                            <option value="">Select One</option>
                            <option value="regular">
                              Registered Business - Regular
                            </option>
                            <option value="composition">
                              Registered Business - Composition
                            </option>
                            <option value="unregistered">
                              Unregistered Business
                            </option>
                            <option value="consumer">Consumer</option>
                            <option value="overseas">Overseas</option>
                            <option value="special_economic_zone">
                              Special Economic Zone
                            </option>
                            <option value="deemed_export">Deemed Export</option>
                            <option value="uin_holders">UIN Holders</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">PAN</label>
                        <input
                          type="text"
                          title="Only letters and numbers are allowed"
                          pattern="[A-Za-z0-9 ]*"
                          className="form-control text-uppercase"
                          name="pan"
                          placeholder="e.g. ABCTY1234k"
                          value={companyDetails && companyDetails.panNo}
                          onChange={getVendorData}
                          
                        />
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">Bank Account Number</label>
                        <input
                          type="text"
                          title="Only numbers are allowed"
                          pattern="[0-9]*"
                          className="form-control"
                          name="account_number"
                          placeholder="e.g. 6345234564539"
                          onChange={getVendorData}
                          
                        />
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">Bank Name</label>
                        <input
                          type="text"
                          title="Only letters and numbers are allowed"
                          pattern="[A-Za-z0-9 ]*"
                          className="form-control"
                          name="bank_name"
                          placeholder="e.g. HDFC"
                          onChange={getVendorData}
                          
                        />
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">Account Holder</label>
                        <input
                          type="text"
                          pattern="[A-Za-z0-9 ]*"
                          className="form-control"
                          name="account_holder"
                          placeholder="e.g. Anil Gupta"
                          onChange={getVendorData}
                          
                        />
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">IFSC</label>
                        <input
                          type="text"
                          title="Only letters and numbers are allowed"
                          pattern="[A-Za-z0-9 ]*"
                          className="form-control text-uppercase"
                          name="ifsc_code"
                          placeholder="e.g. HDFC0000088"
                          onChange={getVendorData}
                          
                        />
                      </div>
                    </div>

                    <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="form-label">Upload File (if any)</label>
                        <input
                          type="file"
                          className="form-control"
                          placeholder="Upload file"
                          accept=".png, .jpg, .jpeg"
                          onChange={fileUpload}
                        />
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                      <div className="form-group  pt-0">
                        <label className="form_label mb-0">Items (Press Enter after done)</label>
                        <TagsInput className="react-tagsinput-remove" value={tags} onChange={handleChange} />
                      </div>
                    </div> */}
                  </div>
                </div>
                <div class="card-footer d-flex justify-content-end">
                  <button type="reset" class="btn btn-exp-light me-2">
                    Reset
                  </button>

                  <button type="submit" class="btn btn-exp-green">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </React.Fragment>
  );
}

export default AddNewVendor;
