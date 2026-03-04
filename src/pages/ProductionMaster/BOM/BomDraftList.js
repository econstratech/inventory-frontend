import React, { useState } from "react";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Link } from "react-router-dom";
import BomPageTopBar from "./BomPageTopBar";
import BomStatusBar from "./BomStatusBar";

function BomDraftList() {
  const [data, setData] = useState([
    {
      bomName: "Gopal",
      status: "draft",
      fgName: "Raw Material 1",
      numberOfRm: 2,
      lastModifiedBy: "Ranjan Kumar",
      lastModifiedDate: "19/11/2024, 6:20 pm",
    },
    {
      bomName: "RM 104",
      status: "draft",
      fgName: "Display (15.6 inches, Resolution: 1920 x 1080 pixels)",
      numberOfRm: 2,
      lastModifiedBy: "Ranjan Kumar",
      lastModifiedDate: "19/11/2024, 6:17 pm",
    },
    {
      bomName: "RM05",
      status: "draft",
      fgName: "Battery (Capacity: 70 Whr)",
      numberOfRm: 2,
      lastModifiedBy: "Ranjan Kumar",
      lastModifiedDate: "19/11/2024, 6:13 pm",
    },
    {
      bomName: "Laptop BOM",
      status: "draft",
      fgName: "Finished Good #1",
      numberOfRm: 6,
      lastModifiedBy: "Ranjan Kumar",
      lastModifiedDate: "19/11/2024, 10:22 am",
    },
  ]);

  //for status badge
  const statuses = [
    { text: "All", value: "all" },
    { text: "Draft", value: "draft" },
    { text: "Published", value: "published" },
    { text: "Deleted", value: "deleted" },
  ];

  const statusStyles = {
    all: "badge-outline-active",
    draft: "badge-outline-warning",
    published: "badge-outline-meantGreen",
    deleted: "badge-outline-quotation"
  };

  const getStatusBadge = (status) => {
    const style = statusStyles[status] || "badge-outline-secondary";
    return (
      <label className={`mb-0 badge ${style}`}>
        <i className="fas fa-circle f-s-8 d-flex me-1"></i>
        {statuses.find((s) => s.value === status)?.text || status}
      </label>
    );
  };
  const CustomCell = (props) => {
    const { dataItem, field } = props;
    const status = dataItem[field];

    return <td>{getStatusBadge(status)}</td>;
  };
  //for status badge

  const CustomDropDownFilter = (props) => {
    const handleChange = (e) => {
      props.onChange({
        value: e.value,
        operator: "eq",
        field: props.field,
      });
    };

    return (
      <DropDownList
        data={statuses}
        textField="text"
        dataItemKey="value"
        value={statuses.find((s) => s.value === props.value) || statuses[0]}
        onChange={handleChange}
      />
    );
  };

  return (
    <>
      <BomPageTopBar />
      <BomStatusBar />
      <div className="p-4">
        <div className="row">


          <div className="col-12">
            <div className="card">
              <div className="card-body p-0">
                <div className="d-flex justify-content-between align-items-center flex-wrap p-3">
                  <button type='button' className="btn btn-outline-primary btn-sm">
                    <i className="fas fa-plus"></i><span className="ms-2">Start Process</span>
                  </button>
                  <div className="d-flex gap-2">
                    <p className="my-1 me-3 fw-medium text-muted">2 BOMs selected</p>
                    <button type='button' className="btn btn-outline-danger btn-sm">
                      <i className="fas fa-trash-alt"></i><span className="ms-2">Delete</span>
                    </button>
                  </div>
                </div>
                <div className="bg_succes_table_head rounded_table">
                  <Grid
                    data={data}
                    sortable
                    //filterable
                    pageable={{ buttonCount: 3, pageSizes: true }}

                  >

                    <GridColumn
                      field=""
                      title=""
                      width="55px"
                      cell={() => (
                        <td>
                          <label className="custom-checkbox me-0 mb-0">
                            <input
                              type="checkbox"
                            />
                            <span className="checkmark" />
                            <span className="text-"></span>
                          </label>
                        </td>
                      )}
                      filterable={false}
                    />
                    <GridColumn
                      field="bomId"
                      title="BOM ID"
                      filter="text"
                      width="270px"
                      locked={false} // Locked column
                      cell={() => (
                        <td>
                          <Link to="/production/bom/view-bom">
                            BOM00001 <span className="ms-2 text-primary"><i className="fas fa-external-link-alt"></i></span>
                          </Link>
                        </td>
                      )}
                      filterable={false}
                    />
                    <GridColumn field="bomName" title="BOM Name" filter="text" width="270px" filterable={false} />
                    <GridColumn
                      field="status"
                      title="Status"
                      filter="dropdown"
                      width="200px"
                      filterCell={CustomDropDownFilter}
                      filterable={false}
                      cell={CustomCell}
                    />
                    <GridColumn field="fgName" title="FG Name" filter="text" width="270px" filterable={false} />
                    <GridColumn field="numberOfRm" title="Number of RM" filter="numeric" width="230px" filterable={false} />
                    <GridColumn field="lastModifiedBy" title="Last Modified By" filter="text" width="270px" filterable={false} />
                    <GridColumn field="lastModifiedDate" title="Last Modified Date" filter="text" filterable={false} width="270px" />
                  </Grid>
                </div>
              </div>
            </div>
          </div>



        </div>
      </div >
    </>
  )
}

export default BomDraftList