import forms from '../components/authenticate-form'

export default function ToggleableForm({isLogin, handleClick}) {
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
