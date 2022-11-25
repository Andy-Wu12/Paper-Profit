import styles from '../../styles/Home.module.css'
import formStyles from '../../styles/forms.module.css'

import React, { FormEventHandler, Fragment } from 'react';
import { useRouter } from 'next/router';

const baseAPI_URL: string = process.env.NEXT_PUBLIC_API_BASE_URL;
const passwordLabel = 'password';

type AuthenticationFormProps = {
  header: string,
  onSubmit: FormEventHandler<HTMLFormElement>,
  fields: string[]
}

function AuthenticationForm({header, onSubmit, fields}: AuthenticationFormProps): React.ReactElement {
  const formFields: React.ReactElement[] = fields.map((field: string) => {
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

export function LoginForm(): React.ReactElement {
  const fields = ["username"];
  const router = useRouter();

  async function handleSubmit(e: any): Promise<void> {
    e.preventDefault();
    const username: string = e.target.elements.username.value;
    const response = await fetch(`${baseAPI_URL}/auth/login`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "username": username, 
        "password": e.target.elements.password.value
      })
    });
    if(response.ok) {
      localStorage.setItem("user", JSON.stringify({user: username}));
    }
    router.reload(); 
  }

  return (
    <AuthenticationForm header="Login" onSubmit={handleSubmit} fields={fields} />
  )
}

export function SignupForm() {
  const fields = ["username", "email"];
  const router = useRouter();

  async function handleSubmit(e: any) {
    e.preventDefault();
    const username = e.target.elements.username.value;
    const response = await fetch(`${baseAPI_URL}/auth/signup`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "email": e.target.elements.email.value, 
        "password": e.target.elements.password.value,
        "username": username
      })
    });
    if(response.ok) {
      localStorage.setItem("user", JSON.stringify({user: username}));
    }
    router.reload();
    
  }

  return (
    <AuthenticationForm header="Sign Up" onSubmit={handleSubmit} fields={fields} />
  )
}

export default { LoginForm, SignupForm };