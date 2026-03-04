import React, { useEffect, useState } from "react";

import Select from "react-select";

import { ErrorMessage, SuccessMessage } from "../../environment/ToastMessage";
import { UserAuth } from "../auth/Auth";
import {
  AllUser,
  AllCategories,
  GetTaskRemainder,
} from "../../environment/GlobalApi";
import "../global.css";
import {
  PrivateAxios,
  PrivateAxiosFile,
} from "../../environment/AxiosInstance";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";

const EditProduct = () => {
  const location = useLocation();
  const { data } = location.state || {};
  const { Logout } = UserAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const status = [
    { value: "1", label: "Active" },
    { value: "0", label: "In-active" },
  ];

  const [formData, setFormData] = useState({
    product_name: data.product_name,
    product_type: data.product_type,
    unit: data.unit,
    product_code: data.product_code,
    product_category: data.product_category,
    product_price: data.product_price,
    product_category_label: data.Categories.title,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState({});

  const getTaskData = async (e, data) => {
    if (e.target) {
      var name = e.target.name;
      setFormData({ ...formData, [name]: e.target.value });
    } else {
      setFormData({ ...formData, [data.name]: e.value });
      if (data.name == "product_category") {
        setFormData({ ...formData, product_category_label: e.label });
      }
    }
  };
  const product_type = [
    { value: "Consumable", label: "Consumable" },
    { value: "Service", label: "Service" },
  ];

  const [catProduct, setcategory] = useState([
    { value: "select", label: "-Select-" },
  ]);
  useEffect(() => {
    const AllProducts = async () => {
      const newUserArray = await AllCategories();
      if (newUserArray == 401) {
        Logout();
      }
      const newUserList = newUserArray.cat.map((data) => ({
        value: data.id,
        label: data.title,
      }));
      setcategory(newUserList);
    };
    AllProducts();
  }, []);
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
  // const handleSubmit = async (event) => {
  //event.preventDefault();
  //console.log(formData);

  // try {
  //     const response = await PrivateAxios.put(`product/update/${id}`, formData);
  //     if (response.status === 200) {
  //         SuccessMessage('Product category updated!');
  //         navigate('/category');
  //     }
  // } catch (error) {
  //     ErrorMessage('Error: Unable to update product category.');
  //     console.error('There was an error!', error);
  // }
  //};
  const handleSubmit = async (e) => {
    e.preventDefault();
    let formData1 = await new FormData();
    formData1.append("product_name", formData.product_name);
    formData1.append("product_type", formData.product_type);
    formData1.append("unit", formData.unit);
    formData1.append("product_category", formData.product_category);
    formData1.append("product_price", formData.product_price);
    formData1.append("file", formData.file);
    
    PrivateAxiosFile.post(`product/update/${id}`, formData1)
      .then((res) => {
        if (res.status === 200) {
          SuccessMessage("Product updated successfully!");
          navigate("/products");
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
        {/* <Link to="/products" className="text-dark ">
        <i class="fas fa-arrow-left me-1"></i>
<span class="ms-2 f-s-16">Back</span>
        </Link> */}
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
          <h3 className="card-title">Update Products</h3>
        </div>
        

        <form action="" onSubmit={handleSubmit} method="post">
          <div className="card-body pb-1">
            <div className="row">
              <div className="col-lg-4 col-md-4 col-sm-6 col-12">
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    value={formData.product_name}
                    
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
                      onChange={getTaskData}
                      value={
                        formData.product_type == "Service"
                          ? product_type[1]
                          : product_type[0]
                      }
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
                    pattern="[A-Za-z0-9]*"
                    value={formData.unit}
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
                    value={{
                      value: formData.product_category,
                      label: formData.product_category_label,
                    }}
                    options={catProduct}
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
                    value={formData.product_price}
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

export default EditProduct;
