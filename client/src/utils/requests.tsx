import { SERVER_URL } from "./const"

export interface writeResp {
  status: number
  ok: boolean
  message: string
  data: object
}

export const writeFetch = async (path: string, method: "POST" | "PUT" | "PATCH" | "DELETE", body: object): Promise<writeResp | null> => {
  try {
    const resp = await fetch(SERVER_URL + path, {
      method: method,
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body)
    })
    const jsonResp = await resp.json()
    return {
      status: resp.status,
      ok: resp.ok,
      message: jsonResp["message"],
      data: jsonResp["data"],
    }
  }
  catch (e) {
    console.error("request error ", path, ": ", e)
    return null
  }
}
