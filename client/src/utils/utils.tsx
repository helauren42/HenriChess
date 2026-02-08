export const removeWaitCursor = () => {
  console.log("removeWaitCursor")
  document.getElementById("root")!.classList.remove("wait-cursor")
  document.getElementById("root")!.style.cursor = "auto"
}

export const addWaitCursor = () => {
  console.log("addWaitCurosr")
  document.getElementById("root")!.style.cursor = "wait"
  document.getElementById("root")!.classList.add("wait-cursor")
}
