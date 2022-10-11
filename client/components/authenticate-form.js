import styles from '../styles/Home.module.css'
import formStyles from '../styles/forms.module.css'

function AuthenticationForm({header, postRoute}) {
  return (
    <>
      <h2> {header} </h2>
      <form className={styles.card} method="POST" action={postRoute}>
        <label className={formStyles.label} htmlFor="username"> Username </label>
        <input id="username" name="username" className={formStyles.formInput} /><br/><br/>
        <label className={formStyles.label} htmlFor="password"> Password </label>
        <input id="password" name="password" className={formStyles.formInput} /><br/><br/>
        <button className={formStyles.button} type='submit'> {header} </button>
      </form>
    </>
  )
}

export function LoginForm() {
  return (
    <AuthenticationForm header="Login" postRoute="/login" />
  )
}

export function SignupForm() {
  return (
    <AuthenticationForm header="Sign Up" postRoute="/signup" />
  )
}

export default { LoginForm, SignupForm };