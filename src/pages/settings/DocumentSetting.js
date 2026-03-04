import React, { useEffect, useState } from "react";
import { Button, Form, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { PrivateAxios } from "../../environment/AxiosInstance";
import Loader from "../landing/loder/Loader";
import { SuccessMessage } from "../../environment/ToastMessage";
import SettingsInventoryTopBar from "./settingsInventory/SettingsInventoryTopBar";
// Import the CSS for styling

function DocumentSetting() {
  return (
    <>
     <SettingsInventoryTopBar />
    <div className="p-4">
      <div className="card mb-0">
        <div className="card-header border-bottom-0">
          <h3 className="card-title">Document Settings</h3>
          <p className="mb-0">
            Setting to select on which document creation you need to update the Inventory
          </p>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive mb-0">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th colSpan={2}>
                    <span className="fw-medium">Following documents will add / reduce stock from your
                    inventory (settings cannot be edited)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="fw-medium">Sub-con Inward (+ Add)</span></td>
                  <td>
                    <label className="custom-switch m-0">
                      <input type="checkbox" disabled />
                      <div className="switch-slider switch-round" />
                    </label>
                  </td>
                </tr>
                <tr>
                  <td><span className="fw-medium">Sub-con GRN / QIR (+ Add)</span></td>
                  <td>
                    <label className="custom-switch m-0">
                      <input type="checkbox" checked disabled />
                      <div className="switch-slider switch-round" />
                    </label>
                  </td>
                </tr>
                <tr>
                  <td><span className="fw-medium">Purchase Return Delivery Challan (-Reduce)</span></td>
                  <td>
                    <label className="custom-switch">
                      <input type="checkbox" checked disabled />
                      <div className="switch-slider switch-round" />
                    </label>
                  </td>
                </tr>
                <tr>
                  <td><span className="fw-medium">Ad-hoc Invoice (-Reduce)</span></td>
                  <td>
                    <label className="custom-switch m-0">
                      <input type="checkbox" checked disabled />
                      <div className="switch-slider switch-round" />
                    </label>
                  </td>
                </tr>
                <tr>
                  <td><span className="fw-medium">Service Delivery Challan (- Reduce)</span></td>
                  <td>
                    <label className="custom-switch m-0">
                      <input type="checkbox" checked disabled />
                      <div className="switch-slider switch-round" />
                    </label>
                  </td>
                </tr>
                <tr>
                  <td><span className="fw-medium">Sales Return Delivery Challan (+ Add)</span></td>
                  <td>
                    <label className="custom-switch m-0">
                      <input type="checkbox" checked disabled />
                      <div className="switch-slider switch-round" />
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default DocumentSetting;
