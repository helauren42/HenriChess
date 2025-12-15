import { useContext, useEffect, useState, type ReactNode } from "react"
import { Link, Outlet, useNavigate } from "react-router-dom"
import { writeFetch, type MyResp } from "../utils/requests"
import { Toast409, ToastCustomError, ToastServerError } from "../utils/toastify"
import { UserContext, type UserContextFace } from "../Contexts/User"

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

const AuthRedir = ({ path, text }: { path: string, text: string }) => {
  return (
    <div className="mt-5">
      <Link to={path}>{text}</Link>
    </div>
  )
}

export const SignupPage = () => {
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: ""
  })
  const nav = useNavigate()
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
    nav("/")
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
      <AuthRedir path={"/auth/login"} text="Login instead?" />
    </>
  )
}

export const LoginPage = () => {
  const [values, setValues] = useState({
    usernameEmail: "",
    password: ""
  })
  const nav = useNavigate()
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
    nav("/")
    location.reload()
  }
  return (
    <>
      <AuthTitle title="Login" />
      <FormWrapper onSubmit={(e) => handleSubmit(e)} submitText="Login" >
        <InputField title="Username or Email" type="text" value={values.usernameEmail} setter={(val) => setValues({ ...values, usernameEmail: val })} />
        <InputField title="Password" type="text" value={values.password} setter={(val) => setValues({ ...values, password: val })} />
      </FormWrapper>
      <AuthRedir path={"/auth/signup"} text="Signup instead?" /> </>
  )
}

export const AuthPage = () => {
  const { user } = useContext<UserContextFace>(UserContext)
  const nav = useNavigate()
  useEffect(() => {
    if (user.username.length > 0)
      nav("/")
  }, [user, nav])
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="h-fit w-fit min-h-80 min-w-50 bg-(--nav-color) rounded-3xl p-10 pt-2 shadow-(--auth-shadow)">
        <Outlet />
      </div>
    </div>
  )
}
