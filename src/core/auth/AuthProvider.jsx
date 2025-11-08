import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../shared/components/UI/Loader/Loader";

const AuthProvider = ({ children }) => {
  const { isLoading } = useSelector((state) => state.auth);
  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    // Simple initialization without fetching user
    setIsInitialized(true);
  }, []);

  if (!isInitialized || isLoading) {
    return <Loader fullScreen text="Loading..." />;
  }

  return children;
};

export default AuthProvider;
