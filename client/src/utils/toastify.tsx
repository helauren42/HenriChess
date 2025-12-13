import { toast } from "react-toastify";

export const ToastServerError = (errorLog: string) => {
  console.error(errorLog)
  toast.error("Sorry a Server Error Occured ", {
    toastId: "input-error",
    position: "top-right",
    autoClose: 2000
  })
}

export const ToastInputError = (msg: string) => {
  toast.error("You already have an account: " + msg, {
    toastId: "input-error",
    position: "top-right",
    autoClose: 2000
  })
}

export const ToastCustomError = (msg: string) => {
  toast.error("Input error: " + msg, {
    toastId: "input-error",
    position: "top-right",
    autoClose: 2000
  })
}
