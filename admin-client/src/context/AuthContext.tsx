import {
  createContext,
  Dispatch,
  ReactElement,
  SetStateAction,
  useContext,
  useState,
} from 'react';

type AuthProviderType = {
  children: ReactElement;
};

type AuthContextType = {
  token: string | null;
  setToken: Dispatch<SetStateAction<string | null>>;
};

const ctxDefaultValue: AuthContextType = {
  token: null,
  setToken: () => {},
};

const AuthContext = createContext(ctxDefaultValue);

export const useAuthToken = () => {
  const { token, setToken } = useContext(AuthContext);
  return { token, setToken };
};

const AuthProvider = ({ children }: AuthProviderType) => {
  const [token, setToken] = useState(ctxDefaultValue.token);

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
