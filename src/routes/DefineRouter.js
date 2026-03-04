import React from 'react';
import ProtectedRoute from './ProtectedRoute';


//all admin panel component call
const Dashboard = React.lazy(() => import('../pages/Dashboard'));

const { createBrowserRouter } = require("react-router-dom");


const router = createBrowserRouter(
    [
       
        {
            element: <ProtectedRoute />,
            children: [
                {
                    path: '/dashboard',
                    element: <Dashboard />
                },
                // {
                //     path: '/employees-kpi',
                //     element: <EmployeesKpi />
                // },
                // {
                //     path: '/bottle-neck-report',
                //     element: <BottleNeckReport />
                // },
                // {
                //     path: '/my-workflow-task',
                //     element: <MyTaskWorkflow />
                // },
                // {
                //     path: '/my-workflow-task-details',
                //     element: <MyWorkflowTaskDetails />
                // },
                // {
                //     path: '/my-checklist-task',
                //     element: <MyChecklistTask />
                // },
                // {
                //     path: '/my-task-tracker',
                //     element: <MyTaskTrackerList />
                // },

                // {
                //     path: '/workflow',
                //     element: <TaskManagerWorkflow />
                // },
                // {
                //     path: '/new-workflow-template',
                //     element: <NewWorkflowTemplate />
                // },
                // {
                //     path: '/create-new-workflow-task',
                //     element: <NewWorkflowTask />
                // },
                // {
                //     path: '/edit-workflow-task',
                //     element: <EditWorkflowTask />
                // },
                // {
                //     path: '/checksheet',
                //     element: <TaskManagerChecksheet />
                // },
                // {
                //     path: '/add-new-checksheet',
                //     element: <AddNewChecksheet />
                // },
                {
                    path: '*',
                    element: <Dashboard />
                }
            ]
            
        },
        {
            path: '*',
            element: <p>404 Error - Nothing here...</p>
        }
    ],
    {
        basename: '/plesk-site-preview/gyanmartindia.in/https/159.89.160.9/', // Set this to the correct base path if your app is in a subdirectory
      }
);

export default router;