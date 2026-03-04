

import React, { useEffect, useState } from "react";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ProductionStatusBar from "./ProductionStatusBar";
import BomPageTopBar from "../BOM/BomPageTopBar";

import { PrivateAxios } from "../../../environment/AxiosInstance";
import { format } from "date-fns"; 
import { ErrorMessage, SuccessMessage } from "../../../environment/ToastMessage";
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd-MM-yyyy h:mm a"); // Correct format
};

function AllProductionProcessList() {
     const navigate = useNavigate();
           const location = useLocation();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBOMs, setSelectedBOMs] = useState([]);   
    useEffect(() => {
        fetchWorkOrders();
    }, []);

        useEffect(() => {
            if (location.pathname === `/production/all-production-process`) {
            document.body.classList.add("sidebar-collapse");
            } else {
            document.body.classList.remove("sidebar-collapse");
            }
            return () => {
            document.body.classList.remove("sidebar-collapse");
            };
        }, [location.pathname]);
    const fetchWorkOrders = async () => {
        try {
            // Fetch work orders
            const response = await PrivateAxios.get("sales/production/allworkorder");
            let filteredData = response.data.filter(order => 
                order.is_deleted !== 1 && 
                (order.production_status === 1 || order.production_status === 2 || order.production_status === 5) &&
                order.production_number && order.production_number.trim() !== ''
              );
    
            // Fetch production data
            const productionResponse = await PrivateAxios.get("production/get-allproduction-list");
            const productionData = productionResponse.data; 
            filteredData = filteredData.map(order => {
                const matchingProduction = productionData.find(prod => prod.production_number === order.production_number);
                return {
                    ...order,
                    production_table_id: matchingProduction ? matchingProduction.id : null, 
                    BOM_id: matchingProduction ? matchingProduction.bom_number : null, 
                    status: matchingProduction ? matchingProduction.status : null, 
                };
            });
    
            setData(filteredData);
        } catch (error) {
            console.error("Error fetching work orders:", error);
        } finally {
            setLoading(false);
        }
    };
    

    const CustomDropDownFilter = (props) => {
        const handleChange = (e) => {
            props.onChange({
                value: e.value,
                operator: "eq",
                field: props.field,
            });
        };

    };
    
  

    
    

    return (
      <>
        <BomPageTopBar />
        <ProductionStatusBar />
        <div className="p-4">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body p-0">
                  <div className="d-flex justify-content-between align-items-center flex-wrap p-3"></div>
                  {loading ? (
                    <div className="text-center my-3">
                      Loading work orders...
                    </div>
                  ) : (
                    <div className="bg_succes_table_head rounded_table">
                      <Grid
                        data={data}
                        sortable
                        //filterable
                        pageable={{ buttonCount: 3, pageSizes: true }}
                      >
                        <GridColumn
                          field="purchase.production_number"
                          title="Process Number"
                          filter="text"
                          width="200px"
                          cell={(props) => {
                            const { production_number, production_table_id } =
                              props.dataItem;

                            // If no production_table_id, display "-"
                            if (!production_table_id) {
                              return <td>-</td>;
                            }

                            const handleClick = (e) => {
                              e.preventDefault();
                              window.open(
                                `/production/all-production-process/view-production/${production_table_id}`,
                                "_blank"
                              );
                            };

                            return (
                              <td>
                                <a
                                  href="#"
                                  onClick={handleClick}
                                  style={{
                                    color: "#007bff",
                                    textDecoration: "none",
                                  }}
                                  title="View Production"
                                >
                                  {production_number || "N/A"}{" "}
                                  <span className="ms-2 text-primary">
                                    <i className="fas fa-external-link-alt"></i>
                                  </span>
                                </a>
                              </td>
                            );
                          }}
                        />

                        <GridColumn
                          field="processStage"
                          title="Process Stage"
                          filter="text"
                          filterable={true}
                          width="200px"
                          cell={(props) => {
                            const { status } = props.dataItem;

                            return (
                              <>
                                {status === 1 ? (
                                  <td>
                                    <span className="badge badge-info">
                                      Planned
                                    </span>
                                  </td>
                                ) : status === 2 ? (
                                  <td>
                                    <span className="badge badge-warning">
                                      WIP
                                    </span>
                                  </td>
                                ) : status === 5 ? (
                                  <td>
                                    <span className="badge badge-success">
                                      Completed
                                    </span>
                                  </td>
                                ) : (
                                  <td />
                                )}
                              </>
                            );
                          }}
                        />

                        <GridColumn
                          field="ProductsItem.product_code"
                          title="Item ID"
                          width="200px"
                          cell={(props) => {
                            const product = props.dataItem.ProductsItem;
                            return <td>{product?.product_code || "N/A"} </td>;
                          }}
                        />

                        <GridColumn
                          field="ProductsItem.product_name"
                          title="Item Name"
                          width="200px"
                          cell={(props) => {
                            const product = props.dataItem.ProductsItem;
                            return <td>{product?.product_name || "N/A"}</td>;
                          }}
                        />
                        <GridColumn
                          field="ProductsItem.Masteruom.unit_name"
                          title="UOM"
                          width="150px"
                          cell={(props) => {
                            const uom = props.dataItem.ProductsItem?.Masteruom;
                            return <td>{uom?.unit_name || "N/A"}</td>;
                          }}
                        />
                        <GridColumn
                          field="qty"
                          title="Target Qty"
                          filter="dropdown"
                          width="250px"

                          //cell={CustomCell} // Dynamically render badges
                        />
                        <GridColumn
                          field="purchase.customer.name"
                          title="Buyer"
                          filter="text"
                          width="200px"
                          locked={false} // Locked column
                        />
                        <GridColumn
                          field="purchase.reference_number"
                          title="Document Number"
                          filter="text"
                          width="200px"
                        />
                        <GridColumn
                          field="purchase.BOM_id"
                          title="Bom Id"
                          filter="text"
                          width="200px"
                          cell={(props) => {
                            const { BOM_id } = props.dataItem; // Extract both values

                            return <td>{BOM_id || "N/A"} </td>;
                          }}
                        />

                        <GridColumn
                          field="purchase.created_at"
                          title="Document Date"
                          filter="numeric"
                          filterable={true}
                          width="200px"
                          cell={(props) => {
                            return (
                              <td>
                                {formatDate(
                                  props.dataItem.purchase?.expiration
                                )}
                              </td>
                            );
                          }}
                        />
                        <GridColumn
                          field="purchase.expiration"
                          title="Delivery Date"
                          filter="text"
                          filterable={false}
                          width="200px"
                          cell={(props) => {
                            return (
                              <td>
                                {formatDate(
                                  props.dataItem.purchase?.expiration
                                )}
                              </td>
                            );
                          }}
                        />
                        <GridColumn
                          field="purchase.createdByUser.name"
                          title="Created By"
                          width="200px"
                          cell={(props) => {
                            const user = props.dataItem.purchase?.createdByUser;
                            return <td>{user?.name || "N/A"}</td>;
                          }}
                        />
                      </Grid>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
}

export default AllProductionProcessList;