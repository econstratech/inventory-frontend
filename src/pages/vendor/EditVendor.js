import React, { useState } from "react";
// import Select from "react-select";
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
// import { UserAuth } from "../auth/Auth";
// import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
// import {
//   AllUser,
//   AllCategories,
//   GetTaskRemainder,
// } from "../../environment/GlobalApi";
import "../global.css";
import {
  // Axios,
  PrivateAxios,
  // PrivateAxiosFile,
} from "../../environment/AxiosInstance";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const EditVendor = () => {
  const location = useLocation();
  const { data } = location.state || {};
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    vendor_name: data?.vendor_name || "",
    address: data?.address || "",
    phone: data?.phone || "",
    mobile: data?.mobile || "",
    email: data?.email || "",
  });

  const [error, setError] = useState({});

  const getVendorData = async (e, data) => {
    if (e.target) {
      var name = e.target.name;
      setFormData({ ...formData, [name]: e.target.value });
    } else {
      setFormData({ ...formData, [data.name]: e.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formData1 = new FormData();
    formData1.append('vendor_name', formData.vendor_name.trim());
    formData1.append('address', formData.address.trim());
    formData1.append('mobile', formData.mobile.trim());
    formData1.append('email', formData.email.trim());

    PrivateAxios.post(`vendor/update/${id}`, formData1)
      .then((res) => {
        if (res.status === 200) {
          SuccessMessage("Vendor updated successfully!");
          navigate("/suppliers");
        }
      })
      .catch((err) => {
        ErrorMessage(err.message);
      });
  };

  return (
    <React.Fragment>
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
            <h3 className="card-title">Update Supplier</h3>
          </div>


          <form action="" onSubmit={handleSubmit} method="post">
            <div className="card-body pb-1">
              <div className="row">
                {/* <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>GSTIN</label>
                    <input type='text' value={formData.gstin} title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control text-uppercase" name='gstin' placeholder='e.g. BE0477472501' onChange={getVendorData}  />
                  </div>
                </div> */}
                <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>Vendor Name</label>
                    <input type='text' value={formData.vendor_name} title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control" name='vendor_name' placeholder='Enter vendor Name' onChange={getVendorData} required  />
                  </div>
                </div>
                {/* <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>Vendor Type</label>
                    <div className='custom-select-wrap'>
                      <select class="form-select" value={formData.type} aria-label="Default select example" name='type' onChange={getVendorData} >
                        <option value="">Select </option>
                        <option value="Individual" >Individual</option>
                        <option value="Company" >Company</option>
                      </select>
                    </div>
                  </div>
                </div> */}
                {/* <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>Website</label>
                    <input type='url' value={formData.website} className="form-control" name='website' placeholder='http://www.econstra.com' onChange={getVendorData} />
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
                      value={formData.address2}

                    />
                  </div>
                </div>
                <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>Country</label>
                    <Select
                      name="country"
                      value={
                        countries.find(option => option.value === formData.country) ||
                        { label: 'India', value: 'India' }
                      }
                      options={countries}
                      onChange={(selectedOption) =>
                        setFormData({ ...formData, country: selectedOption.value })
                      }
                      placeholder="Select a country"
                    />
                  </div>
                </div>
                <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>State</label>
                    <input type='text' value={formData.state} title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control" name='state' placeholder='Enter state' onChange={getVendorData}  />
                  </div>
                </div>
                <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>City</label>
                    <input type='text' value={formData.city} title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control" name='city' placeholder='Enter city' onChange={getVendorData}  />
                  </div>
                </div>
                <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>Zip</label>
                    <input type='text' value={formData.zip} title="Only numbers are allowed" pattern="[0-9]*" className="form-control" name='zip' placeholder='Enter zip Code' onChange={getVendorData}  />
                  </div>
                </div> */}
                <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>Email</label>
                    <input type='email' value={formData.email} className="form-control" name='email' placeholder='Enter your email' onChange={getVendorData}  />
                  </div>
                </div>
                {/* <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>Phone</label>
                    <input type='text' value={formData.phone} title="Only numbers are allowed" pattern="[0-9]*" className="form-control" name='phone' placeholder='Enter your phone' onChange={getVendorData}  />
                  </div>
                </div> */}
                <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>Mobile</label>
                    <input type='text' value={formData.mobile} title="Only numbers are allowed" pattern="[0-9]*" className="form-control" name='mobile' placeholder='Enter your mobile number' onChange={getVendorData}  />
                  </div>
                </div>

                <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>Address</label>
                    <textarea rows={3} value={formData.address} className="form-control" name='address' placeholder='Enter Address' onChange={getVendorData}  />
                  </div>
                </div>
                {/* <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>GST Treatment</label>
                    <div className='custom-select-wrap'>
                      <select class="form-select" value={formData.gst_treatment} aria-label="Default select example" name='gst_treatment' onChange={getVendorData} >
                        <option value="">Select One</option>
                        <option value="regular">Registered Business - Regular</option>
                        <option value="composition">Registered Business - Composition</option>
                        <option value="unregistered">Unregistered Business</option>
                        <option value="consumer">Consumer</option>
                        <option value="overseas">Overseas</option>
                        <option value="special_economic_zone">Special Economic Zone</option>
                        <option value="deemed_export">Deemed Export</option>
                        <option value="uin_holders">UIN Holders</option>
                      </select>
                    </div>
                  </div>
                </div> */}

                {/* <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>PAN</label>
                    <input type='text' value={formData.pan} title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control text-uppercase" name='pan' placeholder='e.g. ABCTY1234k' onChange={getVendorData}  />
                  </div>
                </div>
                <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>Bank Account Number</label>
                    <input type='text' value={formData.account_number != null ? formData.account_number : ""} title="Only numbers are allowed" pattern="[0-9]*" className="form-control" name='account_number' placeholder='e.g. 6345234564539' onChange={getVendorData}  />
                  </div>
                </div>
                <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>Bank Name</label>
                    <input type='text' value={formData.bank_name != '' ? formData.bank_name : ""} title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control" name='bank_name' placeholder='e.g. HDFC' onChange={getVendorData}  />
                  </div>
                </div>
                <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>Account Holder</label>
                    <input type='text' value={formData.account_holder != '' ? formData.account_holder : ""} pattern="[A-Za-z0-9 ]*" className="form-control" name='account_holder' placeholder='e.g. Anil Gupta' onChange={getVendorData}  />
                  </div>
                </div>
                <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>IFSC</label>
                    <input type='text' value={formData.ifsc_code != '' ? formData.ifsc_code : ""} title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control text-uppercase" name='ifsc_code' placeholder='e.g. HDFC0000088' onChange={getVendorData}  />
                  </div>
                </div> */}

                {/* <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>Upload File (if any)</label>
                    <input type='file' className='form-control' placeholder='Upload file' accept=".png, .jpg, .jpeg" onChange={fileUpload} />
                  </div>
                </div>
                <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Items (Press Enter after done)</label>
                    <TagsInput className="form-label" value={tags} onChange={handleChange} />
                  </div>
                </div>
                <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Vendor Score</label>
                    <input type='number' min={1} max={5} value={formData.ratings != '' ? formData.ratings : ""} className="form-control" name='ratings' placeholder='e.g. 1-5' onChange={getVendorData} />
                  </div>
                </div> */}


              </div>
            </div>
            <div class="card-footer d-flex justify-content-end">

              <button type="submit" class="btn btn-exp-green">
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </React.Fragment>
  );
};

export default EditVendor;
