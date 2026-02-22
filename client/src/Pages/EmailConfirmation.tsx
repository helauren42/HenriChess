import { useLocation, useNavigate } from "react-router-dom"
import { writeFetch } from "../utils/requests"
import { ToastCustomError } from "../utils/toastify"
import { useEffect } from "react"

export const VerifyEmail = () => {
  const nav = useNavigate()
  const MakeVerification = async () => {
    const paths = location.pathname.split("/")
    const username = paths[paths.length - 2]
    const token = paths[paths.length - 1]
    const resp = await writeFetch("/auth/verify/" + token, "POST", {})
    if (resp == null)
      return ToastCustomError("Unexpeted Error")
    if (resp.ok) {
      nav("/user/" + username)
      location.reload()
      return
    }
    else {
      if (resp.status == 410)
        ToastCustomError("Token has expired")
      else {
        if (resp.message && resp.message.length > 0)
          ToastCustomError(resp.message)
        else
          ToastCustomError("Unknown error failed to create account")
      }
      setTimeout(() => {
        nav("/")
      }, 3000)
    }
  }
  useEffect(() => {
    MakeVerification()
  }, [])
  return (
    <div className="w-full h-full bg-black"></div>
  )
}
