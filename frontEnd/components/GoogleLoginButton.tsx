"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export function GoogleLoginButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return <button disabled>Loading...</button>;

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <span>Signed in as {session.user?.email}</span>
        <button className="btn" onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }
  return (
    <button className="btn" onClick={() => signIn("google")}>Sign in with Google</button>
  );
}
