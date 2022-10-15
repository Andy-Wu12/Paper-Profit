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
  return (
    <div className={formStyles.button}>
      <button type="button">
        Log Out
      </button> 
    </div>
  )
}