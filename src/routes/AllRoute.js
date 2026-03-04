import React from 'react'
import { RouterProvider } from 'react-router-dom'
import router from './DefineRouter'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { UserAuth } from '../pages/auth/Auth';
import { WebRoute } from './WebRoute';

export const AllRoute = () => {
  const { isLoggedIn } = UserAuth();
  // console.log(isLoggedIn);
  // if (isLoggedIn) {
  //   <>
  //     <RouterProvider router={router} />
  //     <ToastContainer />
  //   </>
  // }
  return (
    <>
      <RouterProvider router={WebRoute} />
      <ToastContainer />
    </>
  )
}
