import styles from '../styles/Home.module.css'
import formStyles from '../styles/forms.module.css'

import { Fragment } from 'react';

const baseAPI_URL = 'http://localhost:3011';
const passwordLabel = 'password';

function AuthenticationForm({header, onSubmit, fields}) {
  const formFields = fields.map((field) => {
    return (
    <Fragment key={`form-${field}`}>
      <label className={formStyles.label} htmlFor={field}> {field} </label>
      <input id={field} name={field} className={formStyles.formInput} /><br/><br/>
    </Fragment>);
  });

  return (
    <>
      <h2> {header} </h2>
      <form className={styles.card} method="POST" onSubmit={onSubmit}>
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

  async function handleSubmit(e) {
    e.preventDefault();
    const response = await fetch(`${baseAPI_URL}/auth/login`, {
      method: "POST",
      mode: "cors",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "email": e.target.elements.email.value, 
        "password": e.target.elements.password.value
      })
    });
    
  }

  return (
    <AuthenticationForm header="Login" onSubmit={handleSubmit} fields={fields} />
  )
}

export function SignupForm() {
  const fields = ["username", "email"];

  async function handleSubmit(e) {
    e.preventDefault();
    const response = await fetch(`${baseAPI_URL}/auth/signup`, {
      method: "POST",
      mode: "cors",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "email": e.target.elements.email.value, 
        "password": e.target.elements.password.value,
        "username": e.target.elements.username.value
      })
    });
    
  }

  return (
    <AuthenticationForm header="Sign Up" onSubmit={handleSubmit} fields={fields} />
  )
}

export default { LoginForm, SignupForm };