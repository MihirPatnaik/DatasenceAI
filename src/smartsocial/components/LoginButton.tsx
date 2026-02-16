import React, { useState } from "react";
import { signInWithGoogle, logout, auth } from "../utils/firebaseAuth";
import { onAuthStateChanged } from "firebase/auth";

const LoginButton: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  React.useEffect(() => {
    onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full" />
        <span>{user.displayName}</span>
        <button onClick={logout} className="px-3 py-1 bg-red-500 text-white rounded-md">
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg"
    >
      Sign in with Google
    </button>
  );
};

export default LoginButton;
