import React, { useEffect, useState } from "react";

// import Select from "react-select";
// import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
// import { UserAuth } from "../auth/Auth";
// import {
//   AllUser,
//   AllCategories,
//   GetTaskRemainder,
// } from "../../environment/GlobalApi";
import "../global.css";
import {
  Axios,
  PrivateAxios,
  PrivateAxiosFile,
} from "../../environment/AxiosInstance";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
const EditCustomer = () => {
  const location = useLocation();
  const { data } = location.state || {};

  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: data.name,
    address: data.address,
    pan: data.pan,
    phone: data.phone,
    email: data.email,
  });
  const [errorMessage, setErrorMessage] = useState({});
  // const [countries, setCountries] = useState([]);
  // useEffect(() => {
  //   Axios
  //     .get("https://api.first.org/data/v1/countries") // No headers needed
  //     .then((response) => {
  //       const rawData = response.data.data;
  //       const countryOptions = Object.keys(rawData).map((key) => ({
  //         label: rawData[key].country,
  //         value: rawData[key].country
  //       }));
  //       setCountries(countryOptions);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching countries:", error);
  //     });
  // }, []);

  // const [message, setMessage] = useState("");

  const getTaskData = async (e, data) => {
    if (e.target) {
      var name = e.target.name;
      setFormData({ ...formData, [name]: e.target.value });
    } else {
      setFormData({ ...formData, [data.name]: e.value });

    }
  };
  const [tags, setTags] = useState(() => {
    try {
      return data && data.tags ? JSON.parse(data.tags) : [];
    } catch (error) {
      console.error('Error parsing tags:', error);
      return [];
    }
  });
  // const handleChange = (newTags) => {
  //   setTags(newTags);
  // };

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

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Phone number validation (numbers only & 10 digits)
  const isValidPhone = (phone) => {
    return /^[0-9]{10}$/.test(phone);
  };

  // Customer form validation
  const validateCustomerForm = () => {
    let newErrors = {};
    // clear previous errors
    setErrorMessage({});
  
    if (!formData.name.trim()) {
      newErrors.name = "Buyer Name is required";
    } else if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Invalid email address";
    } else if (formData.phone && formData.phone !== '' && !isValidPhone(formData.phone)) {
      newErrors.phone = "Invalid phone number. Only 10 digits are allowed.";
    }
  
    setErrorMessage(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check validation before submit data
    if (!validateCustomerForm()) return;

    // Remove null or empty values from formData
    const formDataToSend = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value !== null && value !== '')
    );

    try {
      const response = await PrivateAxios.post(`customer/update/${id}`, formDataToSend);
      if (response.status === 200) {
        SuccessMessage("Customer updated successfully!");
        navigate("/customers");
      } else {
        ErrorMessage("Failed to update customer");
      }
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };

  return (
    <React.Fragment>
      <div className="p-4">
        <div className="mb-4">
          <Link to="/customers" className="text-dark ">
            <i class="fas fa-arrow-left me-1"></i>
            <span class="ms-2 f-s-16">Back</span>
          </Link>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Update Buyer</h3>
          </div>


          <form action="" onSubmit={handleSubmit} method="post">
            <div className="card-body pb-1">
              <div className="row">
                {/* <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>GSTIN</label>
                    <input type='text' value={formData.gstin} title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control text-uppercase" name='gstin' placeholder='e.g. BE0477472501' onChange={getTaskData} />
                  </div>
                </div> */}
                <div className='col-lg-6 col-md-6 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>Buyer Name <span className="text-danger">*</span></label>
                    <input required type='text' value={formData.name} title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control" name='name' placeholder='Enter Customer Name' onChange={getTaskData} />
                    {errorMessage.name && <span className="text-danger">{errorMessage.name}</span>}
                  </div>
                </div>
                {/* <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>Vendor Type</label>
                    <div className='custom-select-wrap'>
                      <select class="form-select" value={formData.type} aria-label="Default select example" name='type' onChange={getTaskData} >
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
                    <input type='url' value={formData.website} className="form-control" name='website' placeholder='http://www.econstra.com' onChange={getTaskData} />
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
                      onChange={getTaskData}
                      value={formData.address2}

                    />
                  </div>
                </div> */}
                {/* <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>Country</label>
                    <Select
                      name='country'
                      value={{
                        value: formData.country,
                        label: formData.country,
                      }}
                      options={countries}
                      onChange={getTaskData}
                      placeholder="Select a country"
                    />
                  </div>
                </div> */}
                {/* <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>State</label>
                    <input type='text' value={formData.state} title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control" name='state' placeholder='Enter state' onChange={getTaskData} />
                  </div>
                </div>
                <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>City</label>
                    <input type='text' value={formData.city} title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control" name='city' placeholder='Enter city' onChange={getTaskData} />
                  </div>
                </div>
                <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>Zip</label>
                    <input type='text' value={formData.zip} title="Only numbers are allowed" pattern="[0-9]*" className="form-control" name='zip' placeholder='Enter zip Code' onChange={getTaskData} />
                  </div>
                </div> */}
                <div className='col-lg-6 col-md-6 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>Email <span className="text-danger">*</span></label>
                    <input type='text' value={formData.email} className="form-control" name='email' placeholder='Enter your email' onChange={getTaskData} />
                    {errorMessage.email && <span className="text-danger">{errorMessage.email}</span>}
                  </div>
                </div>
                <div className='col-lg-6 col-md-6 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>Mobile</label>
                    <input type='text' value={formData.phone} className="form-control" name='phone' placeholder='Enter your phone' onChange={getTaskData} />
                    {errorMessage?.phone && <span className="text-danger">{errorMessage?.phone}</span>}
                  </div>
                </div>
                {/* <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Sales Person</label>
                    <div className="custom-select-wrap">
                      <input
                        type="text"
                        value={formData.sales_person}
                        className="form-control"
                        name="sales_person"
                        placeholder="Enter Sales Person Name"
                        onChange={getTaskData}

                      />
                    </div>
                  </div>
                </div> */}

                {/* <div className='col-lg-6 col-md-6 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>PAN</label>
                    <input type='text' value={formData.pan} title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control text-uppercase" name='pan' placeholder='e.g. ABCTY1234k' onChange={getTaskData} />
                  </div>
                </div> */}
                <div className='col-lg-6 col-md-6 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>Address</label>
                    <textarea
                      value={formData.address}
                      className="form-control"
                      name='address'
                      placeholder='Enter Product Code'
                      onChange={getTaskData}
                      rows={3}
                    />
                  </div>
                </div>
                {/* <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>Bank Account Number</label>
                    <input type='text' value={formData.account_number != null ? formData.account_number : ""} title="Only numbers are allowed" pattern="[0-9]*" className="form-control" name='account_number' placeholder='e.g. 6345234564539' onChange={getTaskData} />
                  </div>
                </div>
                <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>Bank Name</label>
                    <input type='text' value={formData.bank_name != '' ? formData.bank_name : ""} title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control" name='bank_name' placeholder='e.g. HDFC' onChange={getTaskData} />
                  </div>
                </div>
                <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>Account Holder</label>
                    <input type='text' value={formData.account_holder != '' ? formData.account_holder : ""} pattern="[A-Za-z0-9 ]*" className="form-control" name='account_holder' placeholder='e.g. Anil Gupta' onChange={getTaskData} />
                  </div>
                </div>
                <div className='col-lg-4 col-md-4 col-sm-6 col-12'>
                  <div className='form-group'>
                    <label className='form-label'>IFSC</label>
                    <input type='text' value={formData.ifsc_code != '' ? formData.ifsc_code : ""} title="Only letters and numbers are allowed" pattern="[A-Za-z0-9 ]*" className="form-control text-uppercase" name='ifsc_code' placeholder='e.g. HDFC0000088' onChange={getTaskData} />
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
                    <input type='number' min={1} max={5} value={formData.ratings != '' ? formData.ratings : ""} className="form-control" name='ratings' placeholder='e.g. 1-5' onChange={getTaskData} />
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

export default EditCustomer;
