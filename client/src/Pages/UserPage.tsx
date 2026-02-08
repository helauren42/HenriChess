import { useContext, useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { readFetch, writeFetch, type MyResp } from "../utils/requests"
import { AuthCompContext } from "../Contexts/AuthComp"
import { ToastCustomError } from "../utils/toastify"

import "./UserPage.css"
import { HotseatHistory, type HotseatHistoryFace } from "../componants/HotseatHistory"

interface UserData {
  username: ""
  email: ""
  creation: ""
}

const UserDataDisplay = ({ userData }: { userData: UserData }) => {
  const logout = async () => {
    const resp: MyResp | null = await writeFetch("/auth/logout", "DELETE", {})
    if (!resp || !resp.ok) {
      ToastCustomError("Failed to logout")
    }
    else {
      location.reload()
    }
  }
  console.log("user data: ", userData)
  return (
    <div id="user-data-display" className="flex ">
      <div id="left-side" className="flex flex-col gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="fill-(--button-color)" width="100px" height="100px" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>
        <button onClick={() => {
          localStorage.removeItem("username")
          localStorage.removeItem("email")
          logout()
        }}>Logout</button>
      </div>
      <div className="flex flex-col pt-3">
        <h3>{userData.username}</h3>
        <p>Joined {userData.creation}</p>
      </div>
    </div>
  )
}

export const UserPage = () => {
  const { openAuth, authComp } = useContext(AuthCompContext)
  const [userData, setUserData] = useState<UserData>({
    username: "",
    email: "",
    creation: ""
  })
  const [hotseatHistory, setHotseatHistory] = useState<HotseatHistoryFace[]>([])
  const addr = useLocation()
  const splits = addr.pathname.split("/")
  const username = splits[splits.length - 1]
  const fetchUser = async () => {
    const resp: MyResp = await readFetch(`/user/${username}`)
    if (resp.status == 200 && resp.data) {
      setUserData(resp.data as UserData)
    }
    if (resp.status == 401) {
      openAuth("unauthorized")
    }
  }
  const fetchHotseatHistory = async () => {
    const resp: MyResp = await readFetch(`/user/hotseat-history/${username}`)
    if (resp.status == 200 && resp.data) {
      const data = resp.data as HotseatHistoryFace[]
      console.log("fetchHotseatHistory data: ", data)
      setHotseatHistory(data)
    }
  }
  useEffect(() => {
    // if (localStorage.getItem("username") == null)
    //   openAuth("unauthorized")
    if (username) {
      document.getElementById("root")!.style.cursor = "wait"
      fetchUser()
      fetchHotseatHistory()
    }
  }, [username])
  return (
    <>
      {
        authComp.on ? null :
          <div className="flex flex-col items-center w-full gap-10 mt-15">
            <div className="w-full flex justify-around" >
              <UserDataDisplay userData={userData} />
            </div >
            <HotseatHistory hotseatHistory={hotseatHistory} />
          </div>
      }
    </>
  )
}
