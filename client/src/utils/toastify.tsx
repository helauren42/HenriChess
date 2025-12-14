import { toast } from "react-toastify";

export const ToastNetworkError = () => {
  toast.error("Request failed, please verify your internet connection", {
    toastId: "network-error",
    position: "top-right",
    autoClose: 4000
  })
}
export const ToastServerError = (errorLog: string) => {
  console.error(errorLog)
  toast.error("Sorry a Server Error Occured ", {
    toastId: "input-error",
    position: "top-right",
    autoClose: 2000
  })
}


export const Toast422 = (msg: string) => {
  toast.error("Invalid Input: " + msg, {
    toastId: "error422",
    position: "top-right",
    autoClose: 2000
  })
}


export const Toast409 = (msg: string) => {
  toast.error("Could not create account: " + msg, {
    toastId: "error409",
    position: "top-right",
    autoClose: 2000
  })
}

export const ToastCustomError = (msg: string) => {
  toast.error(msg, {
    toastId: "custom",
    position: "top-right",
    autoClose: 2000
  })
}
