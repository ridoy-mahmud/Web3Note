import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import {
  auth,
  googleProvider,
  isFirebaseConfigured,
} from "@/integrations/firebase/client";
import { FirebaseError } from "firebase/app";
import { Zap, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

function getFirebaseAuthErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return "Authentication failed";
  }

  if (error.code === "auth/operation-not-allowed") {
    return "This sign-in method is disabled in Firebase Console. Enable Email/Password and Google providers in Authentication -> Sign-in method.";
  }

  return error.message || "Authentication failed";
}

const Auth = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured || !auth) {
      toast.error(
        "Firebase is not configured. Set VITE_FIREBASE_* values in your .env file.",
      );
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );
        if (fullName.trim()) {
          await updateProfile(cred.user, { displayName: fullName.trim() });
        }
        toast.success("Account created successfully!");
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        toast.success("Welcome back!");
      }
    } catch (err) {
      toast.error(getFirebaseAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured || !auth) {
      toast.error(
        "Firebase is not configured. Set VITE_FIREBASE_* values in your .env file.",
      );
      return;
    }

    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Signed in with Google");
    } catch (err) {
      toast.error(getFirebaseAuthErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center neon-glow">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Web3<span className="text-primary neon-text">NoteApp</span>
          </h1>
        </div>

        <div className="glass-panel rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {mode === "login"
                ? "Sign in to access your notes"
                : "Start capturing your ideas"}
            </p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border bg-secondary/50 hover:bg-secondary text-foreground font-medium transition-all duration-200 disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              or
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-muted rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-muted rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-muted rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 neon-glow text-sm"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-primary font-medium hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
