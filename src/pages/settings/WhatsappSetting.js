import React, { useEffect, useState } from 'react'
import { PrivateAxios } from '../../environment/AxiosInstance'
import { SuccessMessage, WaringMessage } from '../../environment/ToastMessage'

import { UserAuth } from '../auth/Auth'
import SettingsPageTopBar from './SettingsPageTopBar'
function WhatsappSetting() {
  const [tab, setTab] = useState('')
  const { Logout, userDetails } = UserAuth();
  const [data, setData] = useState({
    type: tab,
    greenapi_instance_id: "",
    greenapi_apitoken_instance: "",
    maytapi_product_id: "",
    maytapi_phone_id: "",
    maytapi_api_token: "",
    meta_phone_id: "",
    meta_token: "",
    gupshup_phone: "",
    gupshup_token: ""
  })

  const getData = () => {
    PrivateAxios.get("get-whatsapp-setting")
      .then((res) => {

        setData({
          ...data,
          type: res.data.data.which_whatsapp,
          greenapi_instance_id: res.data.data.greenapi_instance_id,
          greenapi_apitoken_instance: res.data.data.greenapi_apitoken_instance,
          maytapi_product_id: res.data.data.maytapi_product_id,
          maytapi_phone_id: res.data.data.maytapi_phone_id,
          maytapi_api_token: res.data.data.maytapi_api_token,
          meta_phone_id: res.data.data.meta_phone_id,
          meta_token: res.data.data.meta_token,
          gupshup_phone: res.data.data.gupshup_phone,
          gupshup_token: res.data.data.gupshup_token,
        });
        setTab(res.data.data.which_whatsapp)
      }).catch((err) => {
     
      })
  }
  useEffect(() => {
    getData();
  }, [])

  const submit = (e) => {
    e.preventDefault();
    
    PrivateAxios.post("whatsapp-credential", data)
      .then((res) => {
        SuccessMessage(res.data.msg)
      }).catch((err) => {
        if (err.response.status == 401) {
          Logout();
        }
      })
  }

  
  return (
    <>
      <SettingsPageTopBar />
     <div className="p-4">
      <form class="col-12" onSubmit={submit} id="users_details_section">
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h6 class="fw-bold mb-0">Your WhatsApp</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-12 col-sm-12 mb-12">
                    <label for="planned_date">Which One You Want To Used <span class="text-danger">*</span></label>
                    <select name="which_whatsapp" required class="form-select" onChange={(e) => { setTab(e.target.value); setData({ ...data, type: e.target.value }) }}>
                      <option value="GupShup" selected={tab == "GupShup"}>GupShup</option>
                      <option value="greenapi" selected={tab == "greenapi"}>Green API</option>
                      <option value="Maytapi" selected={tab == "Maytapi"}>Maytapi</option>
                      {/* <option value="Meta" selected={tab == "Meta"}>Meta</option> */}
                     
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div className='col-12'>
            <div class="card">
              {tab == "greenapi" ?
                <>
                  <div class="card-header">
                    <h6 class="fw-bold mb-0">WhatsApp Settings (Green Api)</h6>
                  </div>
                  <div class="card-body">
                    <div class="row">
                      <div class="col-md-12 col-sm-12 mb-12">
                        <div className='form-group'>
                          <label for="planned_date">IdInstance <span class="text-danger">*</span></label>
                          <input required type="text" name="greenapi_instance_id" value={data.greenapi_instance_id ? data.greenapi_instance_id : ""} class="form-control" onChange={(e) => setData({ ...data, greenapi_instance_id: e.target.value })} />
                        </div>
                      </div>
                      <div class="col-md-12 col-sm-12 mb-12">
                        <div className='form-group mb-0'>
                          <label for="planned_date">ApiTokenInstance <span class="text-danger">*</span></label>
                          <input type="text" required name="greenapi_apitoken_instance" value={data.greenapi_apitoken_instance ? data.greenapi_apitoken_instance : ""} class="form-control" onChange={(e) => setData({ ...data, greenapi_apitoken_instance: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
                : tab == "GupShup" ?
                  <>
                    <div class="card-header">
                      <h6 class="fw-bold mb-0">WhatsApp Settings (GupShup)</h6>
                    </div>
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-12 col-sm-12 mb-12">
                          <div className='form-group'>
                            <label for="planned_date">Token<span class="text-danger">*</span></label>
                            <input type="text" name="gupshup_token" class="form-control" value={data.gupshup_token ? data.gupshup_token : ""} required="required" onChange={(e) => setData({ ...data, gupshup_token: e.target.value })} />
                          </div>
                          {/* userDetails.position == "Owner" ? data.gupshup_token : "**********************" + data.gupshup_token.slice(-5)  */}
                        </div>
                        <div class="col-md-12 col-sm-12 mb-12">
                          <div className='form-group'>
                            <label for="planned_date">Phone Number <span class="text-danger">*</span></label>
                            <input type="text" name="gupshup_phone" value={data.gupshup_phone ? data.gupshup_phone : ""} class="form-control" required="required" onChange={(e) => setData({ ...data, gupshup_phone: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </> :
                  tab == "Maytapi" ?
                    <>
                      <div class="card-header">
                        <h6 class="fw-bold mb-0">WhatsApp Settings (Maytapi)</h6>
                      </div>
                      <div class="card-body">
                        <div class="row">
                          <div class="col-md-12 col-sm-12 mb-12">
                            <div className='form-group'>
                              <label for="planned_date">PRODUCT ID <span class="text-danger">*</span></label>
                              <input type="text" name="maytapi_product_id" value={data.maytapi_product_id ? data.maytapi_product_id : ""} class="form-control" required="required" onChange={(e) => setData({ ...data, maytapi_product_id: e.target.value })} />
                            </div>

                          </div>
                          <div class="col-md-12 col-sm-12 mb-12">
                            <div className='form-group'>
                              <label for="planned_date">PHONE ID <span class="text-danger">*</span></label>
                              <input type="text" name="maytapi_phone_id" value={data.maytapi_phone_id ? data.maytapi_phone_id : ""} class="form-control" required="required" onChange={(e) => setData({ ...data, maytapi_phone_id: e.target.value })} />
                            </div>
                          </div>
                          <div class="col-md-12 col-sm-12 mb-12">
                            <div className='form-group mb-0'>
                              <label for="planned_date">API TOKEN <span class="text-danger">*</span></label>
                              <input type="text" name="maytapi_api_token" value={data.maytapi_api_token ? data.maytapi_api_token : ""} class="form-control" required="required" onChange={(e) => setData({ ...data, maytapi_api_token: e.target.value })} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </> : ""
              }
              {/* {userDetails.position == "Owner" ? */}
              <div class="card-footer text-end">
                <button type="submit" name="submit_button" class="btn btn-exp-green ms-auto">Update</button>
              </div>
              {/* : ""
              } */}
            </div>
          </div>
        </div>
        {/* <div class="row">
          <div class="col-12">
            <div class="card card-info card-outline card-outline-tabs">
              <div class="card-header p-0 border-bottom-0">
                <ul class="nav nav-tabs" id="custom-tabs-four-tab" role="tablist">
                  <li class="nav-item">
                    <a class="nav-link active" id="custom-tabs-four-home-tab" data-bs-toggle="pill" href="#custom-tabs-four-home" role="tab" aria-controls="custom-tabs-four-home" aria-selected="true">{tab == "greenapi" ? "GREEN API" : "Maytapi"}</a>
                  </li>

                </ul>
              </div>
              <div class="card-body">
                <div class="tab-content" id="custom-tabs-four-tabContent">
                  <div class="tab-pane fade active show" id="custom-tabs-four-home" role="tabpanel" aria-labelledby="custom-tabs-four-home-tab">
                    <div class="row">
                      <div class="col-12">
                        {tab == "greenapi" ?
                          <div class="card">
                            <div class="card-header">
                              <h3 class="card-title">WHATSAPP SETTINGS (GREENAPI)</h3>
                            </div>
                            <form >
                              <div class="card-body">
                                <div class="row">
                                  <div class="col-md-12 col-sm-12 mb-12">
                                    <label for="planned_date">IdInstance <span class="text-danger">*</span></label>
                                    <input type="text" name="greenapi_instance_id" value={data.greenapi_instance_id} class="form-control" onChange={(e) => setData({ ...data, greenapi_instance_id: e.target.value })} />

                                  </div>
                                  <div class="col-md-12 col-sm-12 mb-12">
                                    <label for="planned_date">ApiTokenInstance <span class="text-danger">*</span></label>
                                    <input type="text" name="greenapi_apitoken_instance" value={data.greenapi_apitoken_instance} class="form-control" onChange={(e) => setData({ ...data, greenapi_apitoken_instance: e.target.value })} />

                                  </div>
                                </div>
                              </div>
                              <div class="card-footer">
                                <div class="col-md-4 col-sm-12 mb-4">
                                  <button type="submit" name="submit_button" class="btn btn-md btn-primary float-start me-2">Update</button>
                                </div>
                                <div class="col-md-8 col-sm-12 mb-8"></div>
                              </div>
                            </form>
                          </div>
                          :
                          <div class="card">
                            <div class="card-header">
                              <h3 class="card-title">WHATSAPP SETTINGS (Maytapi)</h3>
                            </div>
                            <form >
                              <div class="card-body">
                                <div class="row">
                                  <div class="col-md-12 col-sm-12 mb-12">
                                    <label for="planned_date">PRODUCT ID <span class="text-danger">*</span></label>
                                    <input type="text" name="maytapi_product_id" value={data.maytapi_product_id} class="form-control" required="required" onChange={(e) => setData({ ...data, maytapi_product_id: e.target.value })} />
                                  </div>
                                  <div class="col-md-12 col-sm-12 mb-12">
                                    <label for="planned_date">PHONE ID <span class="text-danger">*</span></label>
                                    <input type="text" name="maytapi_phone_id" value={data.maytapi_phone_id} class="form-control" required="required" onChange={(e) => setData({ ...data, maytapi_phone_id: e.target.value })} />
                                  </div>
                                  <div class="col-md-12 col-sm-12 mb-12">
                                    <label for="planned_date">API TOKEN <span class="text-danger">*</span></label>
                                    <input type="text" name="maytapi_api_token" value={data.maytapi_api_token} class="form-control" required="required" onChange={(e) => setData({ ...data, maytapi_api_token: e.target.value })} />

                                  </div>
                                </div>
                              </div>
                              <div class="card-footer">
                                <div class="col-md-4 col-sm-12 mb-4">
                                  <button type="submit" name="submit_button" class="btn btn-md btn-primary float-start me-2" onClick={submit}>Update</button>
                                </div>
                                <div class="col-md-8 col-sm-12 mb-8"></div>
                              </div>
                            </form>
                          </div>
                        }

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div > */}

      </form>
    </div >
    </>
  )
}

export default WhatsappSetting