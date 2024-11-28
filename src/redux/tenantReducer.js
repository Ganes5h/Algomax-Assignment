import axios from "axios";

const initialState = {
  loading: false,
  token: null,
  tenant: null,
  error: null,
};

// Reducer
const tenantLoginReducer = (state = initialState, action) => {
  switch (action.type) {
    case "TENANT_LOGIN_REQUEST":
      return { ...state, loading: true, error: null };
    case "TENANT_LOGIN_SUCCESS":
      return {
        ...state,
        loading: false,
        token: action.payload.token,
        tenant: action.payload.tenant,
        error: null,
      };
    case "TENANT_LOGIN_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "TENANT_LOGOUT":
      return { ...initialState };
    default:
      return state;
  }
};

// Thunk Action for Login
export const loginTenant = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: "TENANT_LOGIN_REQUEST" });

    // Call the API
    const { data } = await axios.post(
      "http://localhost:4000/api/tanant/login",
      {
        email,
        password,
      }
    );

    // Store token and tenant in localStorage
    localStorage.setItem("tenantToken", data.token);
    localStorage.setItem("tenant", JSON.stringify(data.tenant));

    // Dispatch success action
    dispatch({
      type: "TENANT_LOGIN_SUCCESS",
      payload: { token: data.token, tenant: data.tenant },
    });
  } catch (error) {
    dispatch({
      type: "TENANT_LOGIN_FAIL",
      payload: error.response?.data?.message || "Login failed. Try again!",
    });
  }
};

// Logout Action
export const logoutTenant = () => (dispatch) => {
  localStorage.removeItem("tenantToken");
  localStorage.removeItem("tenant");
  dispatch({ type: "TENANT_LOGOUT" });
};

export default tenantLoginReducer;
