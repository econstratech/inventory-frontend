import React, { useEffect, useState } from 'react'
import { PrivateAxios } from '../../environment/AxiosInstance'
import { SuccessMessage } from '../../environment/ToastMessage';
import SettingsPageTopBar from './SettingsPageTopBar';
import { Table } from 'react-bootstrap';

function NotificationSetting() {
  const [data, setData] = useState('');
  const GetNotification = async () => {
    PrivateAxios.get("get-notification")
      .then((res) => {
        // console.log(res.data.data);
        setData(res.data.data);
      }).catch((err) => {
        console.log(err);
      })
  }
  useEffect(() => {
    GetNotification()
  }, [])

  const handleChange = (e) => {
    if (e.target.checked) {
      setData({ ...data, [e.target.name]: e.target.value });
    } else {
      setData({ ...data, [e.target.name]: null });
    }
  }
  const submit = (e) => {
    e.preventDefault();
    PrivateAxios.post('edit-notification', data)
      .then((res) => {
        SuccessMessage(res.data.message)
      }).catch((err) => {
        console.log(err);
      })
  }
  return (
    <>
      <SettingsPageTopBar />
      <div id="fms_list_section" className="p-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <form onSubmit={submit}>
                <div className="card-header">
                  <h3 className="card-title">Notification Settings</h3>
                </div>
                <div className="card-body pb-0 compare_price_view_table">
                  <Table responsive id="example1" className="table-bordered primary-table-head">
                    <thead>
                      <tr>
                        <th nowrap>Function Name</th>
                        <th nowrap className="text-center">Email</th>
                        <th nowrap className="text-center">Whatsapp</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><h6>FMS Notification</h6></td>
                        <td className="text-center"><input name="fms_email_notification" className="form-check-input" type="checkbox" defaultValue={1} checked={data.fms_email_notification == 1} onChange={handleChange} /></td>
                        <td className="text-center">
                          <input name="fms_whatsapp_notification" className="form-check-input" type="checkbox" checked={data.fms_whatsapp_notification == 1} defaultValue={1} onChange={handleChange} />
                        </td>
                      </tr>
                      <tr>
                        <td><h6>Checklist Notification</h6></td>
                        <td className="text-center"><input name="checklist_email_notification" checked={data.checklist_email_notification == 1} className="form-check-input" type="checkbox" defaultValue={1} onChange={handleChange} /></td>
                        <td className="text-center"><input name="checklist_whatsapp_notification" checked={data.checklist_whatsapp_notification == 1} className="form-check-input" type="checkbox" defaultValue={1} onChange={handleChange} /></td>
                      </tr>
                      <tr>
                        <td><h6>Delegation Notification</h6></td>
                        <td className="text-center"><input name="delegation_email_notification" checked={data.delegation_email_notification == 1} className="form-check-input" type="checkbox" defaultValue={1} onChange={handleChange} /></td>
                        <td className="text-center"><input name="delegation_whatsapp_notification" checked={data.delegation_whatsapp_notification == 1} className="form-check-input" type="checkbox" defaultValue={1} onChange={handleChange} /></td>
                      </tr>
                      <tr>
                        <td><h6>Help Ticket Notification</h6></td>
                        <td className="text-center"><input name="ticket_email_notification" checked={data.ticket_email_notification == 1} className="form-check-input" type="checkbox" defaultValue={1} onChange={handleChange} /></td>
                        <td className="text-center"><input name="ticket_whatsapp_notification" checked={data.ticket_whatsapp_notification == 1} className="form-check-input" type="checkbox" defaultValue={1} onChange={handleChange} /></td>
                      </tr>
                      <tr>
                        <td><h6>User Notification</h6></td>
                        <td className="text-center"><input name="user_email_notification" checked={data.user_email_notification == 1} className="form-check-input" type="checkbox" defaultValue={1} onChange={handleChange} /></td>
                        <td className="text-center"><input name="user_whatsapp_notification" checked={data.user_whatsapp_notification == 1} className="form-check-input" type="checkbox" defaultValue={1} onChange={handleChange} /></td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
                <div className="card-footer d-flex justify-content-end">
                  <input type="submit" name="submit-button" className="btn btn btn-success ms-auto" defaultValue="Save" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>

  )
}

export default NotificationSetting