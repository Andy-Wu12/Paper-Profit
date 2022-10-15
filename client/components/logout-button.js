import { useContext } from "react";
import AuthContext from "./authContext";
import { useRouter } from "next/router";

import formStyles from '../styles/forms.module.css';

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
    router.reload();
  }

  return (
    <div className={formStyles.button}>
      <button type="button" onClick={logout}>
        Log Out
      </button>
    </div>
  )
}