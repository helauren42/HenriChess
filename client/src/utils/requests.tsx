import { SERVER_URL } from "./const"
import { ToastNetworkError } from "./toastify"

export interface MyResp {
  status: number
  ok: boolean
  message: string | null
  data: object | null
}

export const readFetch = async (path: string): Promise<MyResp | null> => {
  try {
    const resp = await fetch(SERVER_URL + path, {
      method: "GET",
      credentials: "same-origin",
    })
    console.log(resp)
    if (resp.status == 204) {
      return {
        status: resp.status,
        ok: resp.ok,
        message: null,
        data: null
      }
    }
    const jsonResp: object = await resp.json()
    return {
      status: resp.status,
      ok: resp.ok,
      message: Object.hasOwn(jsonResp, "message") ? jsonResp["message"] : null,
      data: Object.hasOwn(jsonResp, "data") ? jsonResp["data"] : null,
    }
  }
  catch (e) {
    console.error("request error ", path, ": ", e)
    ToastNetworkError()
    return null
  }
}

export const writeFetch = async (path: string, method: "POST" | "PUT" | "PATCH" | "DELETE", body: object): Promise<MyResp | null> => {
  try {
    const resp = await fetch(SERVER_URL + path, {
      method: method,
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body)
    })
    if (resp.status == 204) {
      return {
        status: resp.status,
        ok: resp.ok,
        message: null,
        data: null
      }
    }
    const jsonResp: object = await resp.json()
    return {
      status: resp.status,
      ok: resp.ok,
      message: Object.hasOwn(jsonResp, "message") ? jsonResp["message"] : null,
      data: Object.hasOwn(jsonResp, "data") ? jsonResp["data"] : null,
    }
  }
  catch (e) {
    console.error("request error ", path, ": ", e)
    ToastNetworkError()
    return null
  }
}
