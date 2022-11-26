import { useContext } from "react";
import { useRouter } from "next/router";

import AuthContext, { AuthContextProps } from "./authContext";
import ActionButton, { ActionButtonProps } from "../generic/action-button";
import formStyles from '../../styles/forms.module.css';

export default function LogoutForm(): React.ReactElement {
  const user: AuthContextProps = useContext(AuthContext);

  return (
    <>
      {user.name && <LogoutButton username={user.name} />}
    </>
  )
}

function LogoutButton({username}: {username: string}): React.ReactElement {
  const router = useRouter();
  
  const logout = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
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
    if(response.ok) {
      localStorage.removeItem('user');
    }
    router.reload();
  }

  return (
    <div className={formStyles.button}>
      <ActionButton onClick={logout} buttonText='Log Out' />
    </div>
  )
}