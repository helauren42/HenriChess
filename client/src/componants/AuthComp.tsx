import { useContext, useEffect, useState, type ReactNode } from "react"
import { writeFetch, type MyResp } from "../utils/requests"
import { Toast409, ToastCustomError, ToastServerError } from "../utils/toastify"
import { UserContext, type UserContextFace } from "../Contexts/User"
import { AuthCompContext } from "../Contexts/AuthComp"

const AuthTitle = ({ title }: { title: string }) => {
  return (
    <h2 className="w-full text-center">{title}</h2>
  )
}

const InputField = ({ title, type, value, setter }: { title: string, type: React.HTMLInputTypeAttribute, value: string, setter: (val: string) => void }) => {
  return (
    <div className="flex flex-col items-start gap-2">
      <h4>{title}:</h4>
      <input className="text-[1.4rem]" type={type} value={value} onChange={(e) => {
        setter(e.target.value)
      }} />
    </div>
  )
}

const FormWrapper = ({ onSubmit, submitText, children }:
  { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void, submitText: string, children: ReactNode }) => {
  return (
    <div className="flex flex-col justify-start text-left gap-6 mt-10">
      <form className="flex flex-col gap-6" onSubmit={(e) => onSubmit(e)}>
        {children}
        <div className="grid place-items-center">
          <button >{submitText}</button>
        </div>
      </form>
    </div>
  )
}

const AuthRedir = ({ onClick, text }: { onClick: () => void, text: string }) => {
  return (
    <div className="mt-5">
      <p className="cursor-pointer" onClick={() => onClick()}>{text}</p>
    </div>
  )
}

export const SignupPage = () => {
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: ""
  })
  const { openAuth } = useContext(AuthCompContext)
  const [loading, setLoading] = useState<boolean>(false)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading)
      return
    setLoading(true)
    const resp: MyResp | null = await writeFetch("/auth/signup", "POST", values)
    if (!resp)
      return setLoading(false)
    if (!resp.ok) {
      switch (resp.status) {
        case 401:
          ToastCustomError(resp.message)
          break
        case 409:
          Toast409(resp.message)
          break
        case 500:
          ToastServerError(resp.message)
          break
      }
      return setLoading(false)
    }
    setLoading(false)
    location.reload()
  }
  return (
    <>
      <AuthTitle title="Signup" />
      <FormWrapper onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e)} submitText={loading ? "loading" : "Signup"}>
        <InputField title="Username" type="text" value={values.username} setter={(val) => setValues({ ...values, username: val })} />
        <InputField title="Email" type="text" value={values.email} setter={(val) => setValues({ ...values, email: val })} />
        <InputField title="Password" type="password" value={values.password} setter={(val) => setValues({ ...values, password: val })} />
      </FormWrapper>
      <AuthRedir onClick={() => openAuth("login")} text="Login instead?" />
    </>
  )
}

export const LoginPage = () => {
  const [values, setValues] = useState({
    usernameEmail: "",
    password: ""
  })
  const { openAuth } = useContext(AuthCompContext)
  const [loading, setLoading] = useState<boolean>(false)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading)
      return
    setLoading(true)
    const resp: MyResp | null = await writeFetch("/auth/login", "POST", values)
    if (!resp)
      return setLoading(false)
    if (!resp.ok) {
      switch (resp.status) {
        case 401:
          ToastCustomError(resp.message)
          break
        case 409:
          Toast409(resp.message)
          break
        case 500:
          ToastServerError(resp.message)
          break
      }
      return setLoading(false)
    }
    setLoading(false)
    location.reload()
  }
  return (
    <>
      <AuthTitle title="Login" />
      <FormWrapper onSubmit={(e) => handleSubmit(e)} submitText="Login" >
        <InputField title="Username or Email" type="text" value={values.usernameEmail} setter={(val) => setValues({ ...values, usernameEmail: val })} />
        <InputField title="Password" type="text" value={values.password} setter={(val) => setValues({ ...values, password: val })} />
      </FormWrapper>
      <AuthRedir onClick={() => openAuth("signup")} text="Signup instead?" />
    </>
  )
}

export const Unauthorized = () => {
  const { openAuth } = useContext(AuthCompContext)
  return (
    <div className="flex flex-col justify-between gap-5 max-w-[350px]">
      <AuthTitle title="Unauthorized" />
      <h4>You need to signin to view the page</h4>
      <div className="grid place-items-center">
        <button onClick={() => {
          openAuth("login")
        }} >Signin</button>
      </div>
    </div>
  )
}

export const AuthPage = () => {
  const { authComp
  } = useContext(AuthCompContext)
  useEffect(() => {
    const elem = document.getElementById("auth-page")
    if (!elem)
      return
    if (authComp.on)
      elem.style.display = "flex"
    else
      elem.style.display = "none"
  }, [authComp.on])
  return (
    <div id="auth-page" className={`absolute w-full h-full flex items-center justify-center z-10 pointer-events-none`}>
      < div className="h-fit w-fit min-h-80 min-w-50 bg-(--nav-color) rounded-3xl p-10 pt-2 shadow-(--auth-shadow) pointer-events-auto">
        {
          authComp.section == "login" ? <LoginPage />
            : authComp.section == "signup" ? <SignupPage />
              : <Unauthorized />
        }
      </div >
    </div >
  )
}
