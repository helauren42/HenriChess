import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { readFetch } from "../utils/requests"

export const UserPage = () => {
  const addr = useLocation()
  const splits = addr.pathname.split("/")
  const username = splits[splits.length - 1]
  useEffect(() => {
    if (username)
      readFetch(`/account/${username}`)
  }, [username])
  useEffect(() => {
  }, [addr])
  return (
    <div>
    </div>
  )
}
