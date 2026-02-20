export const removeWaitCursor = () => {
  document.getElementById("root")!.classList.remove("wait-cursor")
  document.getElementById("root")!.style.cursor = "auto"
}

export const addWaitCursor = () => {
  document.getElementById("root")!.style.cursor = "wait"
  document.getElementById("root")!.classList.add("wait-cursor")
}

export const trimUsername = (username: string) => {
  if (username.length <= 12)
    return username
  return username.substring(0, 11) + "."
}
