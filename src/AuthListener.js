import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "./redux/authSlice"; // Adjust the path as necessary

const AuthListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "isAuthenticated" || e.key === "user") {
        const isAuthenticated =
          localStorage.getItem("isAuthenticated") === "true";
        const user = JSON.parse(localStorage.getItem("user"));
        if (!isAuthenticated || !user) {
          dispatch(logout()); // Dispatch logout action if no authentication data
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch]);

  return null; // This component does not need to render anything
};

export default AuthListener;
