import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/integrations/firebase/client";

type AuthUser = {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

interface AuthContextType {
  session: AuthUser | null;
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setSession(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (nextSession) => {
        setSession(nextSession);
        setLoading(false);
      },
      () => {
        setSession(null);
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
  };

  const user: AuthUser | null = session
    ? {
        id: session.uid,
        email: session.email,
        displayName: session.displayName,
        photoURL: session.photoURL,
      }
    : null;

  return (
    <AuthContext.Provider value={{ session: user, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
