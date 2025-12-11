import { useState, type ReactNode } from "react"
import { Link, Outlet } from "react-router-dom"
import { writeFetch } from "../utils/requests"

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
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    writeFetch("/auth/signup", "POST", values)
  }
  return (
    <>
      <AuthTitle title="Signup" />
      <FormWrapper onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e)} submitText="Signup" >
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
    username: "",
    password: ""
  })
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

  }
  return (
    <>
      <AuthTitle title="Login" />
      <FormWrapper onSubmit={(e) => handleSubmit(e)} submitText="Login" >
        <InputField title="Username" type="text" value={values.username} setter={(val) => setValues({ ...values, username: val })} />
        <InputField title="Password" type="text" value={values.password} setter={(val) => setValues({ ...values, password: val })} />
      </FormWrapper>
      <AuthRedir path={"/auth/signup"} text="Signup instead?" /> </>
  )
}

export const AuthPage = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="h-fit w-fit min-h-80 min-w-50 bg-(--nav-color) rounded-3xl p-10 pt-2 shadow-(--auth-shadow)">
        <Outlet />
      </div>
    </div>
  )
}
