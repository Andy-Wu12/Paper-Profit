import styles from '../styles/Home.module.css'
import formStyles from '../styles/forms.module.css'

export function LoginForm() {
  return (
    <>
      <h2> Login </h2>
      <form className={styles.card} method="POST" action="/login">
        <label className={formStyles.label} htmlFor="username"> Username </label>
        <input name="username" className={formStyles.formInput} /><br/><br/>
        <label className={formStyles.label} htmlFor="password"> Password </label>
        <input name="password" className={formStyles.formInput} /><br/><br/>
        <button className={formStyles.button} type='submit'> Login </button>
      </form>
    </>
  )
}

export default LoginForm;