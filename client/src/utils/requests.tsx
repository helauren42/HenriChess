import { SERVER_URL } from "./const"

export const writeFetch = (path: string, method: "POST" | "PUT" | "PATCH" | "DELETE", body: object) => {
  try {
    fetch(SERVER_URL + path, {
      method: method,
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body)
    })
  }
  catch (e) {
    console.error("request error ", path, ": ", e)
  }
}
