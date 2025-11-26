import { useState, type ReactNode } from "react"
import { Link, Outlet } from "react-router-dom"

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

const FieldsWrapper = ({ children }: { children: ReactNode }) => {
	return (
		<div className="flex flex-col justify-start text-left gap-6 mt-10">
			{children}
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
	return (
		<>
			<AuthTitle title="Signup" />
			<FieldsWrapper>
				<InputField title="Username" type="text" value={values.username} setter={(val) => setValues({ ...values, username: val })} />
				<InputField title="Email" type="text" value={values.email} setter={(val) => setValues({ ...values, email: val })} />
				<InputField title="Password" type="password" value={values.password} setter={(val) => setValues({ ...values, password: val })} />
			</FieldsWrapper>
			<AuthRedir path={"/auth/login"} text="Login instead?" />
		</>
	)
}

export const LoginPage = () => {
	const [values, setValues] = useState({
		username: "",
		password: ""
	})
	return (
		<>
			<AuthTitle title="Login" />
			<FieldsWrapper>
				<InputField title="Username" type="text" value="" setter={(val) => setValues({ ...values, username: val })} />
				<InputField title="Password" type="text" value="" setter={(val) => setValues({ ...values, password: val })} />
			</FieldsWrapper>
			<AuthRedir path={"/auth/signup"} text="Signup instead?" />
		</>
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
