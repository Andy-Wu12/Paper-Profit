import { useContext } from "react";
import AuthContext from "./authContext";
import { useRouter } from "next/router";

import ActionButton from "../generic/action-button";

import formStyles from '../../styles/forms.module.css';

export default function LogoutForm() {
  const user = useContext(AuthContext);

  return (
    <>
      {user.name && <LogoutButton username={user.name} />}
    </>
  )
}

function LogoutButton({username}) {
  const router = useRouter();
  
  const logout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "username": username
      })
    });
    // TODO: Trigger redirect to signup / login page
    router.reload();
  }

  return (
    <ActionButton onClick={logout} buttonText='Log Out' className={formStyles.button} />
  )
}