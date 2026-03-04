import React, { useState } from 'react'
// import { Button } from 'react-bootstrap';
import { 
  // Form, 
  // Link, 
  // Navigate, 
  useNavigate 
} from 'react-router-dom'
import { Axios } from '../../environment/AxiosInstance';
import { ErrorMessage, SuccessMessage } from '../../environment/ToastMessage';
import "./login.min.css"
import { UserAuth } from './Auth';
// import { ToastContainer } from 'react-toastify';


function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
    // const navigate = useNavigate();

  // const [rememberMe, setRememberMe] = useState(false);
  // useEffect(() => {
  //   const storedUsername = localStorage.getItem('username');
  //   const storedPassword = localStorage.getItem('password');
  //   const storedRememberMe = localStorage.getItem('rememberMe') === 'true';

  //   if (storedRememberMe) {
  //     setUsername(storedUsername);
  //     setPassword(storedPassword);
  //     setRememberMe(storedRememberMe);
  //   }
  // }, []);




  const LoginData = (e) => {
    var name = e.target.name;
    setLoginUserData({ ...loginUserData, [name]: e.target.value })
  }

  const [loginUserData, setLoginUserData] = useState({ email: '', password: '' });
  const [error, setError] = useState({});
  const { setAuthUser } = UserAuth();

  const LoginSubmit = (e) => {
    e.preventDefault();
    Axios.post('user/login', loginUserData)
      .then((res) => {
        if (res.status === 200) {
          setAuthUser(res.data); // set auth token as well as auth user data
          SuccessMessage(res.data.message)
          navigate("/welcome");
        }
      })
      .catch((err) => {
        // console.log("Login failed", err);
        const userError = {};
        if (err.response && err.response.data && err.response.data.details) {
          err.response.data.details.forEach((error) => {
            userError[error.context.label] = error.message;
          });
        } else {
          ErrorMessage("Login failed. Please try again.")
        }
        setError(userError);
      });
  };

  return (
    <>
      <div className='login-auth-wrap'>
        <div className='container'>
          <div className='row justify-content-evenly align-items-center'>
            <div className='col-lg-5 col-md-6 col-sm-12'>
              <div className='loginBox'>
                <div className="logo-wrap" style={{ display: "none" }}>
                  <img src={process.env.PUBLIC_URL + 'assets/images/logo-navy.png'} alt="automybizz" className='img-fluid' />
                </div>
                <h1 className='login-title'>
                  Welcome Back! <br />
                  <span className='position-relative sign-in me-2'>
                    <span>SIGN IN!</span>
                    <svg viewBox="0 0 156 59" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-blue login-svg"><path d="M156 41C156 50.9411 147.89 58.735 138.408 55.7499C135.073 54.7001 131.284 53.8018 124.799 53.8018C109.2 53.8018 109.197 59 93.598 59C77.9988 59 77.9987 53.8018 62.3995 53.8018C46.8003 53.8018 46.7977 59 31.1985 59C24.7151 59 20.9263 58.102 17.5923 57.0526C8.1099 54.0677 0 45.7429 0 35.8018V18C0 8.05888 8.1099 0.265901 17.5923 3.2508C20.9263 4.30029 24.7151 5.19824 31.1985 5.19824C46.7977 5.19824 46.7977 0 62.3995 0C78.0013 0 77.9988 5.19824 93.598 5.19824C109.197 5.19824 109.197 0 124.799 0C131.284 0 135.073 0.898168 138.408 1.94782C147.89 4.93288 156 13.2571 156 23.1982V41Z" ></path></svg>
                  </span>
                  with your credentials.
                </h1>
                <div className='form-wrap'>
                  <form className='w-100' onSubmit={LoginSubmit}>
                    <div className="mb-4">
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <div className="input-group-text"><i className="bi bi-person-fill" /></div>
                        </div>
                        <input type="email" value={loginUserData.email} className={error.email ? "form-control is-invalid" : "form-control"} placeholder="Enter email" name='email' required onChange={LoginData} />
                      </div>
                      {error.email ? <span className="field-invalid"><i class="bi bi-exclamation-triangle-fill me-1"></i>{error.email}</span> : ""}
                    </div>

                    <div className="mb-4">
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <div className="input-group-text"><i className="bi bi-key-fill" /></div>
                        </div>
                        <input className={error.password ? "form-control border-right-0 is-invalid" : "form-control border-right-0"} value={loginUserData.password} type={showPassword ? "text" : "password"} name="password" placeholder="Enter Password" onChange={LoginData} autoComplete="current-password" required id="password" style={{ paddingRight: 20, }} />
                        <div className="input-group-text bg-white">
                          <i className={`bi ${showPassword ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`} onClick={togglePasswordVisibility} style={{ marginRight: 5, cursor: 'pointer', color: '#777' }} />
                        </div>
                      </div>
                      {error.password ? <span className="field-invalid"><i class="bi bi-exclamation-triangle-fill me-1"></i>{error.password}</span> : ""}

                    </div>

                    <div className="mb-4 d-flex flex-wrap justify-content-between align-items-center">
                      <label className="custom-checkbox mb-0">
                        Remember Password
                        <input type="checkbox" />
                        <span className="checkmark" />
                      </label>
                      <span className="d-inline-block my-2 f-w-medium">
                        <a href="/reset-password" className='text-exp-blue1'>Forgot Password ?</a>
                      </span>
                    </div>
                    <button type="submit" name="submit" className="btn btn-exp-primary-dark w-100 f-s-18">Sign In</button>
                  </form>
                  {/* <h6 className='mt-4 mb-0 text-center text-muted f-w-medium'>
                    Don't have an account yet ? <a href="/register" className='text-exp-blue1'>Create an account</a>
                  </h6> */}
                </div>
                {/* <div className='or-sign my-4'>
                  <span>Or, Sign in with</span>
                </div> 
                <div className='other-login'>
                  <a href="#" className='other-login-wrap'>
                    <svg stroke="currentColor" fill="currentColor" strokeWidth={0} version="1.1" x="0px" y="0px" viewBox="0 0 48 48" enableBackground="new 0 0 48 48" className="other-login-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" /><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" /><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" /><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" /></svg>

                    <span className="other-login-name">Google</span>
                  </a>
                  <a href="#" className='other-login-wrap'>
                    <svg stroke="currentColor" fill="#1877f2" strokeWidth={0} viewBox="0 0 256 256" className="other-login-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm12,191.13V156h20a12,12,0,0,0,0-24H140V112a12,12,0,0,1,12-12h16a12,12,0,0,0,0-24H152a36,36,0,0,0-36,36v20H96a12,12,0,0,0,0,24h20v55.13a84,84,0,1,1,24,0Z" /></svg>

                    <span className="other-login-name">Facebook</span>
                  </a>
                  <a href="#" className='other-login-wrap'>
                    <svg stroke="currentColor" fill="#0a66c2" strokeWidth="0" viewBox="0 0 256 256" className="other-login-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M216,20H40A20,20,0,0,0,20,40V216a20,20,0,0,0,20,20H216a20,20,0,0,0,20-20V40A20,20,0,0,0,216,20Zm-4,192H44V44H212ZM112,176V120a12,12,0,0,1,21.43-7.41A40,40,0,0,1,192,148v28a12,12,0,0,1-24,0V148a16,16,0,0,0-32,0v28a12,12,0,0,1-24,0ZM96,120v56a12,12,0,0,1-24,0V120a12,12,0,0,1,24,0ZM68,80A16,16,0,1,1,84,96,16,16,0,0,1,68,80Z"></path></svg>

                    <span className="other-login-name">LinkedIn</span>
                  </a>
                </div>*/}
              </div>
            </div>
            <div className='col-lg-5 col-md-6 col-sm-12 login-right-col'>
              <div className='login-right-wrap'>
                <div className='login-quote-block'>
                  <p className='login-quote-text'>
                    Adeya offers powerful features to simplify inventory management to track stock levels,
                    improve efficiency, and support smarter business decisions.
                  </p>
                </div>
                <div className='login-features-grid'>
                  <div className='login-feature-card'>
                    <div className='login-feature-icon login-feature-icon--procurement'>
                      <i className='bi bi-cart-check' />
                    </div>
                    <h3 className='login-feature-title'>Procurement</h3>
                    <ul className='login-feature-list'>
                      <li>Optimizes purchase plans</li>
                      <li>Prevents excess buying</li>
                      <li>Avoids material stock-outs</li>
                    </ul>
                  </div>
                  <div className='login-feature-card login-feature-card--accent'>
                    <div className='login-feature-icon login-feature-icon--operations'>
                      <i className='bi bi-gear-wide-connected' />
                    </div>
                    <h3 className='login-feature-title'>Operations</h3>
                    <ul className='login-feature-list'>
                      <li>Highlights WIP accumulation</li>
                      <li>Detects movement delays</li>
                      <li>Identifies material shortages</li>
                    </ul>
                  </div>
                  <div className='login-feature-card login-feature-card--accent'>
                    <div className='login-feature-icon login-feature-icon--location'>
                      <i className='bi bi-geo-alt' />
                    </div>
                    <h3 className='login-feature-title'>Location</h3>
                    <ul className='login-feature-list'>
                      <li>Tracks RM / SGF / FG across locations</li>
                      <li>Detects mismatch & pilferage signs</li>
                    </ul>
                  </div>
                  <div className='login-feature-card'>
                    <div className='login-feature-icon login-feature-icon--trends'>
                      <i className='bi bi-graph-up-arrow' />
                    </div>
                    <h3 className='login-feature-title'>Trends</h3>
                    <ul className='login-feature-list'>
                      <li>Tracks consumption patterns</li>
                      <li>Shows SKU-wise trends</li>
                    </ul>
                  </div>
                  {/* <div className='login-feature-card'>
                    <div className='login-feature-icon login-feature-icon--constraint'>
                      <i className='bi bi-funnel' />
                    </div>
                    <h3 className='login-feature-title'>Constraint Detection</h3>
                    <ul className='login-feature-list'>
                      <li>Identifies daily bottlenecks</li>
                      <li>Shows effect on dispatch & cash</li>
                    </ul>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* <div className="auth-wrapper">      
        <div className="logBox">
          <div className="card-body">
            <div className="triangle-left"><h4>Login</h4></div>
            <div className="row">
              <div className="col-md-12">
                <div className="text-center">
                  <img src={process.env.PUBLIC_URL + 'assets/images/logo-econstra.png'} alt="EconStra" style={{ display: 'inline-block', maxWidth: '150px' }} />
                  <p className="login-box-msg" style={{ color: 'red' }}></p>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <form >
                  <div className="input-container">
                    <i className="bi bi-person-fill icon" />
                    <input className="input-field" type="text" name="username" defaultValue placeholder="User Name" />
                  </div>
                  <div className="input-container">
                    <i className="bi bi-key-fill icon" />
                    <input className="input-field" type={showPassword ? "text" : "password"} name="password" placeholder="Password" autoComplete="current-password" required id="password" style={{ paddingRight: 20, }} />
                    <i className={`bi ${showPassword ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`} onClick={togglePasswordVisibility} style={{ marginRight: 5, cursor: 'pointer', color: '#777' }} />
                  </div>
                  <div className="row">
                    <div className="col-xs-12 d-flex flex-wrap justify-content-between align-items-center">                    
                      <div className='me-2'>
                        <label className="custom-checkbox mb-0" style={{ fontSize: 12 }}>
                          Remember Password
                          <input type="checkbox" />
                          <span className="checkmark" />
                        </label>
                        <br />
                        <span className="d-inline-block my-2">
                          <Link to="/reset-password" className='text-exp-blue1'>Forgot Password ?</Link>
                        </span>
                      </div>
                      <button type="submit" name="submit" className="btn btn-exp-primary float-end">Sign In</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <h5 className='mt-3 mb-0 text-center border-top pt-3 pb-3 bg-light'>
              Don't have an account yet ? <br/><Link to="/register" className='text-exp-blue1'>Create an account</Link>
            </h5>
          </div>
        </div>
      </div> */}
    </ >

  )
}

export default Login