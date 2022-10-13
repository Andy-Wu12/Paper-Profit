import styles from '../styles/Home.module.css'
import formStyles from '../styles/forms.module.css'

import { Fragment } from 'react';

function AuthenticationForm({header, postRoute, fields}) {
  const formFields = fields.map((field) => {
    return (
    <Fragment key={`form-${field}`}>
      <label className={formStyles.label} htmlFor={field}> {field} </label>
      <input id={field} name={field} className={formStyles.formInput} /><br/><br/>
    </Fragment>);
  });

  const passwordLabel = 'password';

  return (
    <>
      <h2> {header} </h2>
      <form className={styles.card} method="POST" action={postRoute}>
        {formFields}
        <label className={formStyles.label} htmlFor={passwordLabel}> {passwordLabel} </label>
        <input type='password' id={passwordLabel} name={passwordLabel} className={formStyles.formInput} /><br/><br/>
        <button className={formStyles.button} type='submit'> {header} </button>
      </form>
    </>
  )
}

export function LoginForm() {
  const fields = ["email"];

  return (
    <AuthenticationForm header="Login" postRoute="/users/login" fields={fields} />
  )
}

export function SignupForm() {
  const fields = ["username", "email"]
  return (
    <AuthenticationForm header="Sign Up" postRoute="http://localhost:3011/users/signup" fields={fields} />
  )
}

export default { LoginForm, SignupForm };