"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() { const router = useRouter(); const [error, setError] = useState(""); const [loading, setLoading] = useState(false); async function signIn(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(""); const data = new FormData(event.currentTarget); const { error } = await createClient().auth.signInWithPassword({ email: String(data.get("email")), password: String(data.get("password")) }); setLoading(false); if (error) return setError(error.message); router.push("/admin"); router.refresh(); } return <main className="auth-page"><form onSubmit={signIn}><p className="eyebrow">Private area</p><h1>Welcome back.</h1><label>Email<input required name="email" type="email" autoComplete="email" /></label><label>Password<input required name="password" type="password" autoComplete="current-password" /></label>{error && <p className="form-error">{error}</p>}<button className="button" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button></form></main>; }

