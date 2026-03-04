import React, { useState } from "react";
import { Offcanvas } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import AutoCompleteDropdown from "../../CommonComponent/AutoCompleteDropdown";
import Select from "react-select";

import Filter from "../../CommonComponent/Filter";
import { UserAuth } from "../../auth/Auth";

const SalesQuotationStatusBar = () => {
  const location = useLocation();
  const {  MatchPermission } = UserAuth();

  //filter modal
  const [filterShow, setFilterShow] = useState(false);
  const filterModalClose = () => setFilterShow(false);
  const filterModalShow = () => setFilterShow(true);

  return (
    <>
      <div className="bg-white border-bottom">
        <div className="d-flex gap-3 px-4 justify-content-between align-items-center">
          <ul className="top_listing">
          <li className="list_item">
              <Link
                to="/sales/quotation"
                className={`listMenu status-successBg ${
                  location.pathname === "/sales/quotation" ? "active" : ""
                } `}
              >
                Quotation
              </Link>
            </li>
            <li className="list_item">
              <Link
                to="/sales/quotation/reviewing"
                className={`listMenu status-yellowGreenBg ${
                  location.pathname === "/sales/quotation/reviewing"
                    ? "active"
                    : ""
                } `}
              >
                Reviewing
              </Link>
            </li>
            <li className="list_item">
              <Link
                to="/sales/quotation/rejected"
                className={`listMenu status-dangerBg ${
                  location.pathname === "/sales/quotation/rejected"
                    ? "active"
                    : ""
                } `}
              >
                Rejected
              </Link>
            </li>
          
           
          </ul>
          {/* <div className="d-flex ms-auto gap-3">
            <div className="line"></div>
            <div className="d-flex justify-content-center align-items-center gap-2">
            {MatchPermission(["Quotation Create Sales"]) ?
              <Link to="/sales/new" className="btn btn-exp-primary btn-sm">
                <i className="fas fa-plus"></i>
                <span className="ms-2">Create Sale Order</span>
              </Link>
              :""}
            </div>
          </div> */}
        </div>
      </div>

      {/* <ManagementFilter /> */}
      {["end"].map((placement, idx) => (
        <Filter
          show={filterShow}
          handleClose={filterModalClose}
          key={idx}
          placement={placement.end}
          name={placement}
        />
      ))}
    </>
  );
};

export default SalesQuotationStatusBar;
