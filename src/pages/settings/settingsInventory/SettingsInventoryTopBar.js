import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const SettingsInventoryTopBar = () => {
  const location = useLocation();

  return (
    <>
      <div className="gthh-controller-bar">
        <ul className="gth-controller-view-block">
          <li><Link className={`gth-controller-view-item ${location.pathname === "/settings/inventory/warehouses"


            ? "active" : ""
            } `} to="/settings/inventory/warehouses">
            <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width={14}
              height={14}
              fill="currentColor"
              className='me-1'><path d="M19,17a5.994,5.994,0,0,1-3-.806A5.994,5.994,0,0,1,13,17H11a5.938,5.938,0,0,1-3-.818A5.936,5.936,0,0,1,5,17H4a5.949,5.949,0,0,1-3-.813V21a3,3,0,0,0,3,3H20a3,3,0,0,0,3-3V16.188A5.958,5.958,0,0,1,20,17Z" /><path d="M17,0V6H15V0H9V6H7V0H2.2L.024,9.783,0,11a4,4,0,0,0,4,4H5a3.975,3.975,0,0,0,3-1.382A3.975,3.975,0,0,0,11,15h2a3.99,3.99,0,0,0,3-1.357A3.99,3.99,0,0,0,19,15h1a4,4,0,0,0,4-4V10L21.8,0Z" /></svg>
            Store</Link></li>



          {/* <li><Link className={`gth-controller-view-item ${location.pathname === "/settings/inventory/barcode"

            ? "active" : ""
            } `} to="/settings/inventory/barcode">
            <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width={14}
              height={14}
              fill="currentColor"
              className='me-1'><path d="M3.5,19h3.5v3H3.5c-1.93,0-3.5-1.57-3.5-3.5v-3.5H3v3.5c0,.276,.224,.5,.5,.5Zm17.5-.5c0,.276-.224,.5-.5,.5h-3.5v3h3.5c1.93,0,3.5-1.57,3.5-3.5v-3.5h-3v3.5Zm-.5-16.5h-3.5v3h3.5c.276,0,.5,.224,.5,.5v3.5h3v-3.5c0-1.93-1.57-3.5-3.5-3.5ZM3,5.5c0-.276,.224-.5,.5-.5h3.5V2H3.5C1.57,2,0,3.57,0,5.5v3.5H3v-3.5Zm2,11.5h4V7H5v10Zm8,0h3V7h-3v10Zm-1-10h-2v10h2V7Zm7,0h-2v10h2V7Z" /></svg>
            Barcode</Link></li> */}


          <li><Link className={`gth-controller-view-item ${location.pathname === "/settings/inventory/master-uom"

            ? "active" : ""
            } `} to="/settings/inventory/master-uom">
            <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width={14}
              height={14}
              fill="currentColor"
              className='me-1'><path d="M24,5c0-2.206-1.794-4-4-4s-4,1.794-4,4c0,1.858,1.28,3.411,3,3.858v8.142c0,.551-.449,1-1,1h-4.996l2.203-2.203-1.414-1.414-3.256,3.256c-.774,.775-.774,2.037,0,2.812l3.256,3.256,1.414-1.414-2.304-2.293h5.097c1.654,0,3-1.346,3-3V8.858c1.72-.447,3-2,3-3.858Zm-13.838,4.662l3.256-3.255c.775-.775,.775-2.037,0-2.812L10.162,.338l-1.414,1.414,2.259,2.248H6c-1.654,0-3,1.346-3,3V15.142c-1.72,.447-3,2-3,3.858,0,2.206,1.794,4,4,4s4-1.794,4-4c0-1.858-1.28-3.411-3-3.858V7c0-.551,.449-1,1-1h4.995l-2.248,2.248,1.414,1.414Z" /></svg>
            Unit of Measurement</Link></li>
          {/* <li><Link className={`gth-controller-view-item ${location.pathname === "/settings/inventory/entry-into-store"

            ? "active" : ""
            } `} to="/settings/inventory/entry-into-store">
            <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width={14}
              height={14}
              fill="currentColor"
              className='me-1'>
              <path d="M18,7c0-2.757-2.243-5-5-5h-.171c-.413-1.164-1.525-2-2.829-2h-2c-1.304,0-2.416,.836-2.829,2h-.171C2.243,2,0,4.243,0,7v12c0,2.757,2.243,5,5,5H13c.068,0,.131-.017,.199-.02-1.652-1.466-2.699-3.598-2.699-5.98,0-.34,.029-.672,.07-1H5c-.552,0-1-.447-1-1s.448-1,1-1h6.083c.295-.727,.697-1.398,1.181-2H5c-.552,0-1-.447-1-1s.448-1,1-1H14.657c1.004-.551,2.135-.9,3.343-.975v-3.025Zm-5,2H5c-.552,0-1-.447-1-1s.448-1,1-1H13c.552,0,1,.447,1,1s-.448,1-1,1Zm10.332,10.63l-.55-.317c.129-.418,.218-.853,.218-1.312s-.089-.895-.218-1.312l.55-.317c.479-.276,.643-.887,.367-1.366-.276-.478-.887-.643-1.365-.367l-.544,.314c-.605-.652-1.393-1.126-2.289-1.331v-.621c0-.552-.448-1-1-1h0c-.552,0-1,.448-1,1v.621c-.896,.205-1.685,.678-2.289,1.331l-.544-.314c-.478-.276-1.09-.111-1.365,.367-.276,.479-.112,1.09,.367,1.366l.55,.317c-.129,.418-.218,.853-.218,1.312s.089,.895,.218,1.312l-.55,.317c-.479,.276-.643,.887-.367,1.366,.276,.478,.887,.643,1.365,.367l.544-.314c.605,.652,1.393,1.126,2.289,1.331v.621c0,.552,.448,1,1,1h0c.552,0,1-.448,1-1v-.621c.896-.205,1.685-.678,2.289-1.331l.544,.314c.478,.276,1.09,.111,1.365-.367,.276-.479,.112-1.09-.367-1.366Zm-4.832-.13c-.827,0-1.5-.673-1.5-1.5s.673-1.5,1.5-1.5,1.5,.673,1.5,1.5-.673,1.5-1.5,1.5Z" />
            </svg>
            Document Settings</Link></li>
          <li><Link className={`gth-controller-view-item ${location.pathname === "/settings/inventory/default-approval"

            ? "active" : ""
            } `} to="/settings/inventory/default-approval">

            <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width={14}
              height={14}
              fill="currentColor"
              className='me-1'><path d="m18,12c-3.314,0-6,2.686-6,6s2.686,6,6,6,6-2.686,6-6-2.686-6-6-6Zm3.192,6.202l-2.213,2.124c-.452.446-1.052.671-1.653.671s-1.203-.225-1.663-.674l-1.132-1.109c-.395-.387-.4-1.02-.014-1.414.386-.396,1.019-.401,1.414-.014l1.131,1.108c.144.142.379.139.522-.002l2.223-2.134c.397-.382,1.031-.371,1.414.029.382.398.369,1.031-.029,1.414Zm-11.192-.202c0-2.39,1.048-4.534,2.709-6h-7.709c-.553,0-1-.447-1-1s.447-1,1-1h8c.553,0,1,.447,1,1,0,.024-.001.048-.003.072,1.177-.682,2.544-1.072,4.003-1.072v-5c0-2.757-2.243-5-5-5H5C2.243,0,0,2.243,0,5v14c0,2.757,2.243,5,5,5h7.709c-1.661-1.466-2.709-3.61-2.709-6ZM5,5h8c.553,0,1,.447,1,1s-.447,1-1,1H5c-.553,0-1-.447-1-1s.447-1,1-1Zm2,12h-2c-.553,0-1-.447-1-1s.447-1,1-1h2c.553,0,1,.447,1,1s-.447,1-1,1Z" /></svg>

            Default Approval</Link></li> */}


      </ul>
    </div >
    </>
  )
}

export default SettingsInventoryTopBar