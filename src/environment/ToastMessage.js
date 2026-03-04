import { toast } from 'react-toastify';

export const SuccessMessage = (message) => {
    toast.success(message);
}
export const ErrorMessage = (message) => {
    toast.error(message);
}