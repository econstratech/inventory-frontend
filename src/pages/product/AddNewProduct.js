import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import { UserAuth } from "../auth/Auth";
// import {
//   AllUser,
//   AllCategories,
//   GetTaskRemainder,
// } from "../../environment/GlobalApi";
import "../global.css";
import {
  PrivateAxios,
  PrivateAxiosFile,
} from "../../environment/AxiosInstance";

function AddNewProduct() {
  // Set reminder
  // const [isCheckedReminder, setIsCheckedReminder] = useState(false);
  // const [isFileRequired, setIsFileRequired] = useState(false);
  const [error, setError] = useState({});
  const { category } = UserAuth();



  const product_type = [
    { value: "Consumable", label: "Consumable" },
    { value: "Service", label: "Service" },
  ];
  const [formData, setFormData] = useState({
    product_name: "",
    product_type: "",
    product_category: "",
  });
  const [catProduct, setcategory] = useState([
    { value: "select", label: "-Select-" },
  ]);

  const getTaskData = async (e, data) => {
    if (e.target) {
      var name = e.target.name;
      setFormData({ ...formData, [name]: e.target.value });
    } else {
      setFormData({ ...formData, [data.name]: e.id });
    }
  };

  const navigate = useNavigate();

  const fileUpload = async (e) => {
    const file = e.target.files[0];
    let fileSize = file.size;
    if (Number(fileSize) >= 2097152) {
      setError({ file: "This image in getter than 2MB" });
    } else {
      setFormData({ ...formData, file: e.target.files[0] });
      setError("");
    }
  };

  const SubmitData = async (e) => {
    e.preventDefault();
    let formData1 = await new FormData();
    formData1.append("product_name", formData.product_name);
    formData1.append("product_type", formData.product_type);
    formData1.append("unit", formData.unit);
    formData1.append("product_category", formData.product_category);
    formData1.append("product_price", formData.product_price);
    formData1.append("file", formData.file);

    PrivateAxiosFile.post("product/add", formData1)
      .then((res) => {
        if (res.status === 200) {
          SuccessMessage("Product added successfully!");
          navigate('/products');
        }
      })
      .catch((err) => {
        ErrorMessage(
          "Error: Product can only contain alphanumeric characters and spaces."
        );
        console.error("There was an error!", error);
      });
  };

  return (
    <React.Fragment>
      <div className="p-4">
        <div className="mb-4">
          {/* <Link to="/products" className="text-dark">
            <i class="fas fa-arrow-left me-1"></i>
            <span class="ms-2 f-s-16">Back</span>
          </Link> */}
          
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Add New Product</h3>
          </div>
          <form action="" onSubmit={SubmitData} method="post">
            <div className="card-body pb-1">
              <div className="row">
                <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      title="Only letters and numbers are allowed"

                      className="form-control"
                      name="product_name"
                      placeholder="Enter Product Name"
                      onChange={getTaskData}
                      required
                    />
                    {error.catname ? (
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
                    <label className="form-label">Product Type</label>
                    <div className="custom-select-wrap">
                      <Select
                        onChange={(e) => setFormData({ ...formData, product_type: e.value })}
                        name="product_type"
                        options={product_type}
                        theme={(theme) => ({
                          ...theme,
                          colors: {
                            ...theme.colors,
                            primary25: "#ddddff",
                            primary: "#6161ff",
                          },
                        })}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <input
                      type="text"
                      title="Only letters and numbers are allowed"
                      pattern="[A-Za-z0-9]*"
                      className="form-control"
                      name="unit"
                      placeholder="Enter Product Unit (KG/Ltr)"
                      onChange={getTaskData}
                      required
                    />
                  </div>
                </div>

                <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Product Category</label>
                    <Select
                      name="product_category"

                      options={category}
                      getOptionLabel={(option) => option.title}
                      getOptionValue={(option) => option.id}
                      theme={(theme) => ({
                        ...theme,
                        colors: {
                          ...theme.colors,
                          primary25: "#ddddff",
                          primary: "#6161ff",
                        },
                      })}
                      onChange={getTaskData}
                    />
                  </div>
                </div>
                <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Unit Price</label>
                    <input
                      type="number"
                      min="5"
                      className="form-control"
                      name="product_price"
                      placeholder="Enter Product Price"
                      onChange={getTaskData}
                      required
                    />
                  </div>
                </div>
                <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Upload File (if any)</label>
                    <input
                      type="file"
                      className="form-control"
                      placeholder="Enter Task Name"
                      accept=".png, .jpg, .jpeg"
                      onChange={fileUpload}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="card-footer d-flex justify-content-end">
              <button type="reset" class="btn btn-exp-light me-2">
                Reset
              </button>
              <button type="submit" class="btn btn-exp-green">
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </React.Fragment>
  );
}

export default AddNewProduct;
