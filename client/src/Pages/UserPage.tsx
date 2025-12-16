import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { readFetch, type MyResp } from "../utils/requests"

export const UserPage = () => {
  const addr = useLocation()
  const splits = addr.pathname.split("/")
  const username = splits[splits.length - 1]
  const fetchUser = async () => {
    const resp: MyResp = await readFetch(`/account/${username}`)
    // if (resp.status == 401) {
    //
    // }
  }
  useEffect(() => {
    if (username)
      fetchUser()
  }, [username])
  useEffect(() => {
  }, [addr])
  return (
    <div>
    </div>
  )
}
