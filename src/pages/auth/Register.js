import React, { useState } from 'react'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FormWizard from "react-form-wizard-component";
import "react-form-wizard-component/dist/style.css";
import { Link } from 'react-router-dom';

function Register() {
  const [openTime, setOpenTime] = useState(new Date());
  const [closeTime, setCloseTime] = useState(new Date());

  const handleComplete = () => {
    console.log("Form completed!");
    // Handle form completion logic here
  };
  const handleSkip = () => {
    console.log("Skip!");
    // Handle form completion logic here
  };

  const backTemplate = (handlePrevious) => {
    return (
      <button type='button' className="action-btn back-button" onClick={handlePrevious}>
        Back
      </button>
    );
  };

  return (
    <>
      <div className='login-auth-wrap'>
        <div className='container'>
          <div className='row justify-content-between align-items-center'>
            <div className='col-lg-5 col-md-6 col-sm-12'>
              <div className='loginBox'>
                <div className="logo-wrap">
                  <a href="/"><img src={process.env.PUBLIC_URL + 'assets/images/logo-navy.png'} alt="Growthh" className='img-fluid' /></a>
                </div>
                <h1 className='login-title'>
                  Join our community and unlock a world of possibilities -
                  <span className='position-relative sign-in me-2'>
                    <span>SIGN UP!</span>
                    <svg viewBox="0 0 156 59" fill="none" xmlns="http://www.w3.org/2000/svg" class="fill-blue login-svg"><path d="M156 41C156 50.9411 147.89 58.735 138.408 55.7499C135.073 54.7001 131.284 53.8018 124.799 53.8018C109.2 53.8018 109.197 59 93.598 59C77.9988 59 77.9987 53.8018 62.3995 53.8018C46.8003 53.8018 46.7977 59 31.1985 59C24.7151 59 20.9263 58.102 17.5923 57.0526C8.1099 54.0677 0 45.7429 0 35.8018V18C0 8.05888 8.1099 0.265901 17.5923 3.2508C20.9263 4.30029 24.7151 5.19824 31.1985 5.19824C46.7977 5.19824 46.7977 0 62.3995 0C78.0013 0 77.9988 5.19824 93.598 5.19824C109.197 5.19824 109.197 0 124.799 0C131.284 0 135.073 0.898168 138.408 1.94782C147.89 4.93288 156 13.2571 156 23.1982V41Z" ></path></svg>
                  </span>
                </h1>
                <div className="multi-step-form">                 
                  <FormWizard
                    onComplete={handleComplete}
                    onSkip={handleSkip}
                    //onTabChange={tabChanged}
                    color="#00c875"
                    backButtonTemplate={backTemplate}

                    nextButtonTemplate={(handleNext) => (
                      <button type='button' className="action-btn continue-btn" onClick={handleNext}>
                        Continue
                      </button>
                    )}
                    finishButtonTemplate={(handleComplete) => (
                      <button type='button' className="action-btn finish-button" onClick={handleComplete}>
                        Finish
                      </button>
                    )}
                  >
                    <FormWizard.TabContent title="Company Info" icon="bi bi-1-circle-fill">
                      <div className='row'>
                        <div div className='col-12'>
                          <h5 className='mb-3 text-center'>Company Info</h5>
                        </div>
                        <div className='col-12'>
                          <div className="form-group">
                            <label className="form-label">Company Name <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" placeholder="Company Name" />
                          </div>
                        </div>
                        <div className='col-12'>
                          <div className="form-group">
                            <label className="form-label">Company Email <span className="text-danger">*</span></label>
                            <input type="email" className="form-control" placeholder="Company Email" />
                          </div>
                        </div>
                        <div className='col-12'>
                          <div className="form-group">
                            <label className="form-label">Phone Number <span className="text-danger">*</span></label>
                            <input type="tel" class="form-control" placeholder="Phone Number" />
                          </div>
                        </div>
                        <div className='col-12'>
                          <div className="form-group">
                            <label className="form-label">Address</label>
                            <input type="text" className="form-control mb-2" placeholder="Address Line 1" />
                            <input type="text" className="form-control" placeholder="Address Line 2" />
                          </div>
                        </div>
                        <div className='col-12'>
                          <div className="form-group">
                            <label className="form-label">Company Logo</label>
                            <input type="file" className="form-control" placeholder="Upload Logo" />
                          </div>
                        </div>
                      </div>
                    </FormWizard.TabContent>

                    <FormWizard.TabContent title="Office Timing" icon="bi bi-2-circle-fill">
                      <div className='row'>
                        <div div className='col-12'>
                          <h5 className='mb-3 text-center'>Office Timing</h5>
                        </div>
                        <div className='col-md-6'>
                          <div className="form-group">
                            <label className="form-label">Open Time</label>
                            <div className="exp-datepicker-cont">
                              <span className="cal-icon"><i class="bi bi-clock" /></span>
                              <DatePicker
                                selected={openTime}
                                onChange={(date) => setOpenTime(date)}
                                placeholderText='Select Time'
                                showTimeSelect
                                showTimeSelectOnly
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="h:mm"
                              />
                            </div>
                          </div>
                        </div>
                        <div className='col-md-6'>
                          <div className="form-group">
                            <label className="form-label">Close Time</label>
                            <div className="exp-datepicker-cont">
                              <span className="cal-icon"><i class="bi bi-clock" /></span>
                              <DatePicker
                                selected={closeTime}
                                onChange={(date) => setCloseTime(date)}
                                placeholderText='Select Time'
                                showTimeSelect
                                showTimeSelectOnly
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="h:mm"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="form-group mb-1 text-start">
                            <label htmlFor className="form-label  ">Working Days</label>
                            <div className="d-flex flex-wrap">
                              <label class="custom-checkbox me-3">
                                Sunday
                                <input type="checkbox" />
                                <span class="checkmark"></span>
                              </label>
                              <label class="custom-checkbox me-3">
                                Monday
                                <input type="checkbox" />
                                <span class="checkmark"></span>
                              </label>
                              <label class="custom-checkbox me-3">
                                Tuesday
                                <input type="checkbox" />
                                <span class="checkmark"></span>
                              </label>
                              <label class="custom-checkbox me-3">
                                Wednesday
                                <input type="checkbox" />
                                <span class="checkmark"></span>
                              </label>
                              <label class="custom-checkbox me-3">
                                Thursday
                                <input type="checkbox" />
                                <span class="checkmark"></span>
                              </label>
                              <label class="custom-checkbox me-3">
                                Friday
                                <input type="checkbox" />
                                <span class="checkmark"></span>
                              </label>
                              <label class="custom-checkbox me-3">
                                Saturday
                                <input type="checkbox" />
                                <span class="checkmark"></span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </FormWizard.TabContent>

                    <FormWizard.TabContent title="Notification Setting" icon="bi bi-3-circle-fill">
                      <div className='row'>
                        <div className='col-12'>
                          <h5 className='mb-3 text-center'>Notification Setting</h5>
                        </div>
                        <div className="col-12">
                          <div className="form-group text-start">
                            <label htmlFor className="form-label ">Checklist Notification</label>
                            <div className="d-flex flex-wrap">
                              <label class="custom-checkbox me-3">
                                Email
                                <input type="checkbox" />
                                <span class="checkmark"></span>
                              </label>
                              <label class="custom-checkbox me-3">
                                WhatsApp
                                <input type="checkbox" />
                                <span class="checkmark"></span>
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="form-group text-start">
                            <label htmlFor className="form-label ">Delegation Notification</label>
                            <div className="d-flex flex-wrap">
                              <label class="custom-checkbox me-3">
                                Email
                                <input type="checkbox" />
                                <span class="checkmark"></span>
                              </label>
                              <label class="custom-checkbox me-3">
                                WhatsApp
                                <input type="checkbox" />
                                <span class="checkmark"></span>
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="form-group text-start">
                            <label htmlFor className="form-label ">Help Ticket Notification</label>
                            <div className="d-flex flex-wrap">
                              <label class="custom-checkbox me-3">
                                Email
                                <input type="checkbox" />
                                <span class="checkmark"></span>
                              </label>
                              <label class="custom-checkbox me-3">
                                WhatsApp
                                <input type="checkbox" />
                                <span class="checkmark"></span>
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="form-group mb-1 text-start">
                            <label htmlFor className="form-label ">User Notification</label>
                            <div className="d-flex flex-wrap">
                              <label class="custom-checkbox me-3">
                                Email
                                <input type="checkbox" />
                                <span class="checkmark"></span>
                              </label>
                              <label class="custom-checkbox me-3">
                                WhatsApp
                                <input type="checkbox" />
                                <span class="checkmark"></span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </FormWizard.TabContent>
                  </FormWizard>
                  <h6 className='mt-4 mb-0 text-center text-muted f-w-medium border-top pt-5'>
                    Already have an account ? <Link to="/login" className='text-exp-blue1'>Sign In</Link>
                  </h6>
                </div>

              </div>
            </div>
            <div className='col-lg-5 col-md-6 col-sm-12 login-right-col'>
              <div className='login-right-wrap'>
                <div className='text-end imgBx'>
                  <img src={process.env.PUBLIC_URL + 'assets/images/login-right.webp'} alt="login" />
                </div>
                <div className='textBx'>
                  "Before Growthh, my to-do lists were scattered all around! Now, everything is in order and in one place."
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="auth-wrapper">
        <div className="multi-step-form">
          <div className="text-center pt-4">
            <img src={process.env.PUBLIC_URL + 'assets/images/logo-econstra.png'} alt="EconStra" style={{ display: 'inline-block', maxWidth: '150px' }} />
          </div>
          <FormWizard
            onComplete={handleComplete}
            onSkip={handleSkip}
            //onTabChange={tabChanged}
            color="#00c875"
            backButtonTemplate={backTemplate}

            nextButtonTemplate={(handleNext) => (
              <button className="action-btn continue-btn" onClick={handleNext}>
                Continue
              </button>
            )}
            finishButtonTemplate={(handleComplete) => (
              <button className="action-btn finish-button" onClick={handleComplete}>
                Finish
              </button>
            )}
          >
            <FormWizard.TabContent title="Company Info" icon="bi bi-1-circle-fill">
              <div className='row'>
                <div div className='col-12'>
                  <h5 className='mb-3 text-center'>Company Info</h5>
                </div>
                <div className='col-12'>
                  <div className="form-group">
                    <label className="form-label">Company Name <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" placeholder="Company Name" />
                  </div>
                </div>
                <div className='col-12'>
                  <div className="form-group">
                    <label className="form-label">Company Email <span className="text-danger">*</span></label>
                    <input type="email" className="form-control" placeholder="Company Email" />
                  </div>
                </div>
                <div className='col-12'>
                  <div className="form-group">
                    <label className="form-label">Phone Number <span className="text-danger">*</span></label>
                    <input type="tel" class="form-control" placeholder="Phone Number" />
                  </div>
                </div>
                <div className='col-12'>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input type="text" className="form-control mb-2" placeholder="Address Line 1" />
                    <input type="text" className="form-control" placeholder="Address Line 2" />
                  </div>
                </div>
                <div className='col-12'>
                  <div className="form-group">
                    <label className="form-label">Company Logo</label>
                    <input type="file" className="form-control" placeholder="Upload Logo" />
                  </div>
                </div>
              </div>
            </FormWizard.TabContent>

            <FormWizard.TabContent title="Office Timing" icon="bi bi-2-circle-fill">
              <div className='row'>
                <div div className='col-12'>
                  <h5 className='mb-3 text-center'>Office Timing</h5>
                </div>
                <div className='col-md-6'>
                  <div className="form-group">
                    <label className="form-label">Open Time</label>
                    <div className="exp-datepicker-cont">
                      <span className="cal-icon"><i class="bi bi-clock" /></span>
                      <DatePicker
                        selected={openTime}
                        onChange={(date) => setOpenTime(date)}
                        placeholderText='Select Time'
                        showTimeSelect
                        showTimeSelectOnly
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="h:mm"
                      />
                    </div>
                  </div>
                </div>
                <div className='col-md-6'>
                  <div className="form-group">
                    <label className="form-label">Close Time</label>
                    <div className="exp-datepicker-cont">
                      <span className="cal-icon"><i class="bi bi-clock" /></span>
                      <DatePicker
                        selected={closeTime}
                        onChange={(date) => setCloseTime(date)}
                        placeholderText='Select Time'
                        showTimeSelect
                        showTimeSelectOnly
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="h:mm"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="form-group mb-1 text-start">
                    <label htmlFor className="form-label  ">Working Days</label>
                    <div className="d-flex flex-wrap">
                      <label class="custom-checkbox me-3">
                        Sunday
                        <input type="checkbox" />
                        <span class="checkmark"></span>
                      </label>
                      <label class="custom-checkbox me-3">
                        Monday
                        <input type="checkbox" />
                        <span class="checkmark"></span>
                      </label>
                      <label class="custom-checkbox me-3">
                        Tuesday
                        <input type="checkbox" />
                        <span class="checkmark"></span>
                      </label>
                      <label class="custom-checkbox me-3">
                        Wednesday
                        <input type="checkbox" />
                        <span class="checkmark"></span>
                      </label>
                      <label class="custom-checkbox me-3">
                        Thursday
                        <input type="checkbox" />
                        <span class="checkmark"></span>
                      </label>
                      <label class="custom-checkbox me-3">
                        Friday
                        <input type="checkbox" />
                        <span class="checkmark"></span>
                      </label>
                      <label class="custom-checkbox me-3">
                        Saturday
                        <input type="checkbox" />
                        <span class="checkmark"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </FormWizard.TabContent>

            <FormWizard.TabContent title="Notification Setting" icon="bi bi-3-circle-fill">
              <div className='row'>
                <div className='col-12'>
                  <h5 className='mb-3 text-center'>Notification Setting</h5>
                </div>
                <div className="col-12">
                  <div className="form-group text-start">
                    <label htmlFor className="form-label ">Checklist Notification</label>
                    <div className="d-flex flex-wrap">
                      <label class="custom-checkbox me-3">
                        Email
                        <input type="checkbox" />
                        <span class="checkmark"></span>
                      </label>
                      <label class="custom-checkbox me-3">
                        WhatsApp
                        <input type="checkbox" />
                        <span class="checkmark"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="form-group text-start">
                    <label htmlFor className="form-label ">Delegation Notification</label>
                    <div className="d-flex flex-wrap">
                      <label class="custom-checkbox me-3">
                        Email
                        <input type="checkbox" />
                        <span class="checkmark"></span>
                      </label>
                      <label class="custom-checkbox me-3">
                        WhatsApp
                        <input type="checkbox" />
                        <span class="checkmark"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="form-group text-start">
                    <label htmlFor className="form-label ">Help Ticket Notification</label>
                    <div className="d-flex flex-wrap">
                      <label class="custom-checkbox me-3">
                        Email
                        <input type="checkbox" />
                        <span class="checkmark"></span>
                      </label>
                      <label class="custom-checkbox me-3">
                        WhatsApp
                        <input type="checkbox" />
                        <span class="checkmark"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="form-group mb-1 text-start">
                    <label htmlFor className="form-label ">User Notification</label>
                    <div className="d-flex flex-wrap">
                      <label class="custom-checkbox me-3">
                        Email
                        <input type="checkbox" />
                        <span class="checkmark"></span>
                      </label>
                      <label class="custom-checkbox me-3">
                        WhatsApp
                        <input type="checkbox" />
                        <span class="checkmark"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </FormWizard.TabContent>
          </FormWizard>
          <h5 className='mb-0 text-center border-top p-3 bg-light rounded-bottom-left-10 rounded-bottom-right-10'>
            Already have an account ? <br /><Link to="/login" className='text-exp-blue1'>Sign In</Link>
          </h5>
        </div>
      </div> */}
    </>
  )
}

export default Register