import forms from './authenticate-form'

export interface ToggleableFormProps {
  isLogin: boolean,
  handleClick: React.ChangeEventHandler<HTMLButtonElement>
}

export default function ToggleableForm({isLogin, handleClick}: ToggleableFormProps): React.ReactElement {
  return (
    <>
      <div className='toggleSwitch'>
        <label htmlFor="toggleForm"> Already Signed Up? </label>
        <input id="toggleForm" type="checkbox" checked={isLogin} onChange={handleClick} />
      </div>

      {isLogin ? <forms.LoginForm /> : <forms.SignupForm />}
    </>
  )
}
