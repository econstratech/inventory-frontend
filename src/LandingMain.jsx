import React, { useEffect, useState } from 'react'
//import './landingAssets/css/bootstrap.min.css';
import './landingAssets/css/custom-animated.css';
import './landingAssets/css/default.css';
import './landingAssets/css/font-awesome.min.css';
import './landingAssets/css/magnific-popup.css';
import './landingAssets/css/magnific.dark.css';
import './landingAssets/css/magnific.rtl.css';
import './landingAssets/css/main.css';
import './landingAssets/css/style.css';
import Landing from './pages/landing/Home/Index';
import Loader from './pages/landing/loder/Loader';

function LandingMain() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  });
  return (
    <>
      {loading && (
        <div className={`appie-loader ${loading ? 'active' : ''}`}>
          <Loader />
        </div>
      )}
      <div className={`appie-visible ${loading === false ? 'active' : ''}`}>

        <Landing />

      </div>

    </>
  )
}

export default LandingMain