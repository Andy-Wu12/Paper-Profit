import styles from '../styles/Home.module.css'
import formStyles from '../styles/forms.module.css'

function AuthenticationForm({header, postRoute, fields}) {
  const formFields = fields.map((field) => {
    return (
    <>
      <label className={formStyles.label} htmlFor={field}> {field} </label>
      <input id={field} name={field} className={formStyles.formInput} /><br/><br/>
    </>);
  });

  console.log(formFields);
  return (
    <>
      <h2> {header} </h2>
      <form className={styles.card} method="POST" action={postRoute}>
        {formFields}
        <button className={formStyles.button} type='submit'> {header} </button>
      </form>
    </>
  )
}

export function LoginForm() {
  const fields = ["Email", "Password"];

  return (
    <AuthenticationForm header="Login" postRoute="/login" fields={fields} />
  )
}

export function SignupForm() {
  const fields = ["Username", "Email", "Password"]
  return (
    <AuthenticationForm header="Sign Up" postRoute="/signup" fields={fields} />
  )
}

export default { LoginForm, SignupForm };