import { Axios, PrivateAxios } from "./AxiosInstance"


export const GetTaskMode = async () => {
    try {
        const response = await PrivateAxios.get("/get-task-mode");
        return response.data;
    } catch (error) {
        return error.response.status;
    }
};
export const GetTaskRemainder = async () => {
    try {
        const response = await PrivateAxios.get("/get-task-remainder");
        return response.data;
    } catch (error) {
        return error.response.status;
    }
};
export const GetTaskPriority = async () => {
    try {
        const response = await PrivateAxios.get("/get-task-priority");
        return response.data;
    } catch (error) {
        return error.response.status;
    }
};
export const GetTaskStatus = async () => {
    try {
        const response = await PrivateAxios.get("/get-task-status");
        return response.data;
    } catch (error) {
        return error.response.status;
    }
};

export const AllUser = async () => {
    try {
        const response = await PrivateAxios.get("user/all-user")
        return response.data;

    } catch (error) {
        return error.response.status;
    }
}
export const GetProductCategory = async () => {
    try {
        const response = await PrivateAxios.get("/get-product-category");
        return response.data;
    } catch (error) {
        return error.response.status;
    }
};

export const AllCategories= async () => {
    try {
        const response = await PrivateAxios.get("product-category")
        return response.data;

    } catch (error) {
        return error.response.status;
    }
}
export const Allvendors= async () => {
    try {
        const response = await PrivateAxios.get("vendor")
        return response.data;

    } catch (error) {
        return error.response.status;
    }
}
export const AllProductsData= async () => {
    try {
        const response = await PrivateAxios.get("product/list")
        return response.data;

    } catch (error) {
        return error.response.status;
    }
}
export const formatDateTimeForMySQL = (dateTimeLocal) => {
    const date = new Date(dateTimeLocal);
    return date.toISOString().slice(0, 19).replace('T', ' ');
  };


export const GeneralSettings = async () => {
    try {
        const response = await PrivateAxios.get("general_settings")
        return response.data;

    } catch (error) {
        return error.response.status;
    }
}


//send email 
// email = 'growthh.in@gmail.com';
// pass = 'ropdipfufoimwdka';
// exports.sendMail = async (to, subject, html, email, pass) => {

//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: email,
//             pass: pass
//         }
//     });

//     const mailOptions = {
//         from: `${email}`,
//         to,
//         subject,
//         html
//     };

//     try {
//         const info = await transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 return console.log(error);
//             }
//         });
//         return "success";
//     } catch (error) {
//         console.error('Error sending email:', error);
//         throw error;
//     }
// };