import { useContext, useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { readFetch, writeFetch, type MyResp } from "../utils/requests"
import { AuthCompContext } from "../Contexts/AuthComp"
import { ToastCustomError, ToastFeatureNotImplemented } from "../utils/toastify"

import "./UserPage.css"
import { HotseatHistory, type HotseatHistoryFace } from "../componants/HotseatHistory"
import { OnlineHistory, type OnlineHistoryFace } from "../componants/OnlineHistory"
import { addWaitCursor } from "../utils/utils"
import { SvgAccount } from "../svgs/svgs"

interface UserData {
  username: ""
  email: ""
  creation: ""
  visibility: "Public" | "Private"
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
    <div id="user-data-display" className="flex flex-col gap-5">
      <div className="row-block">
        <div id="profile-pic" className="flex flex-col gap-3">
          <SvgAccount />
        </div>
        <div className="flex flex-col pt-3">
          <h3>{userData.username}</h3>
          <p>Joined {userData.creation}</p>
          <p>Visibility: {userData.visibility}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => {
          localStorage.removeItem("username")
          localStorage.removeItem("email")
          logout()
        }}>Logout</button>
        <button onClick={() => ToastFeatureNotImplemented()}>Go {userData.visibility == "Private" ? "Public" : "Private"}</button>
      </div>
    </div>
  )
}

export const UserPage = () => {
  const { openAuth, authComp } = useContext(AuthCompContext)
  const [dataFetched, setDataFetched] = useState<boolean>(false)
  const [userData, setUserData] = useState<UserData>({
    username: "",
    email: "",
    creation: "",
    visibility: "Public"
  })
  const [hotseatHistory, setHotseatHistory] = useState<HotseatHistoryFace[]>([])
  const [onlineHistory, setOnlineHistory] = useState<OnlineHistoryFace[]>([])
  const addr = useLocation()
  const splits = addr.pathname.split("/")
  const username = splits[splits.length - 1]
  const fetchUser = async () => {
    const resp: MyResp = await readFetch(`/user/${username}`)
    if (resp.status == 200 && resp.data) {
      resp.data["visibility"] = "Public"
      setUserData(resp.data as UserData)
    }
    if (resp.status == 401) {
      openAuth("unauthorized")
    }
  }
  const fetchOnlineHistory = async () => {
    const resp: MyResp = await readFetch(`/user/online-history/${username}`)
    if (resp.status == 200 && resp.data) {
      const data = resp.data as OnlineHistoryFace[]
      console.log("fetchHotseatHistory data: ", data)
      setOnlineHistory(data)
    }
  }
  const fetchHotseatHistory = async () => {
    const resp: MyResp = await readFetch(`/user/hotseat-history/${username}`)
    if (resp.status == 200 && resp.data) {
      const data = resp.data as HotseatHistoryFace[]
      console.log("fetchHotseatHistory data: ", data)
      setHotseatHistory(data)
    }
    setDataFetched(true)
  }
  useEffect(() => {
    // if (localStorage.getItem("username") == null)
    //   openAuth("unauthorized")
    if (username) {
      addWaitCursor()
      fetchUser()
      fetchOnlineHistory()
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
            <OnlineHistory onlineHistory={onlineHistory} />
            <HotseatHistory hotseatHistory={hotseatHistory} dataFetched={dataFetched} />
          </div>
      }
    </>
  )
}
