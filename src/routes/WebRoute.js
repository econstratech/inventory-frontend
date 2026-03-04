import React from 'react'


export const WebRoute = [
    {
        path: '/',
        element: <LandingMain />,
        index: true
    },
    {
        path: '/login',
        element: <Login />,

    },
    {
        path: '/reset-password',
        element: <ForgotPassword />,
    },
    {
        path: '/register',
        element: <Register />,
    },

]