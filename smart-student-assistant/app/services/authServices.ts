import { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  User 
} from "firebase/auth";
import { auth } from "./firebase";

export function useEmailLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Email sign-in successful");
      return { success: true };
    } catch (err: any) {
      console.error("❌ Email sign-in error:", err);
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ Email sign-up successful");
      return { success: true };
    } catch (err: any) {
      console.error("❌ Email sign-up error:", err);
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      console.log("✅ Password reset email sent");
      return { success: true };
    } catch (err: any) {
      console.error("❌ Password reset error:", err);
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { signIn, signUp, resetPassword, loading, error };
}

function getErrorMessage(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered";
    case "auth/invalid-email":
      return "Invalid email address";
    case "auth/user-not-found":
      return "No account found with this email";
    case "auth/wrong-password":
      return "Incorrect password";
    case "auth/weak-password":
      return "Password should be at least 6 characters";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later";
    default:
      return "An error occurred. Please try again";
  }
}