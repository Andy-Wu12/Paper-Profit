import { useContext } from "react";
import AuthContext from "./authContext";

import formStyles from '../styles/forms.module.css';

export default function LogoutForm() {
  const user = useContext(AuthContext);

  return (
    <>
      {user.name && <LogoutButton />}
    </>
  )
}

function LogoutButton() {
  const logout = async () => {
    console.log('logging out!')
  }

  return (
    <div className={formStyles.button}>
      <button type="button" onClick={logout}>
        Log Out
      </button>
    </div>
  )
}