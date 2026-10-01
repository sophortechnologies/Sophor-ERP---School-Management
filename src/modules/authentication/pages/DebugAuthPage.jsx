import React from "react";
import { useSelector, useDispatch } from "react-redux";

const DebugAuthPage = () => {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const checkState = () => {
    console.log("=== CURRENT STATE ===");
    console.log("Redux Auth:", auth);
    console.log("LocalStorage:", {
      accessToken: localStorage.getItem("accessToken"),
      refreshToken: localStorage.getItem("refreshToken"),
      user: localStorage.getItem("user"),
    });
    console.log("Cookies:", document.cookie);
    console.log("====================");
  };

  const forceLogin = () => {
    const fakeUser = {
      id: 1,
      username: "debug-admin",
      role: "admin",
      email: "debug@example.com",
    };

    localStorage.setItem("accessToken", "debug-token-" + Date.now());
    localStorage.setItem("user", JSON.stringify(fakeUser));

    // dispatch(setUser(fakeUser));

    console.log("✅ Forced login with debug user");
    checkState();
  };

  const clearAll = () => {
    localStorage.clear();
    // dispatch({ type: 'auth/clearAuth' });
    console.log("🧹 Cleared all auth data");
    checkState();
    window.location.reload();
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>🔧 Auth Debug Page</h1>

      <div style={{ margin: "20px 0" }}>
        <button onClick={checkState} style={{ marginRight: "10px" }}>
          Check State
        </button>
        <button onClick={forceLogin} style={{ marginRight: "10px" }}>
          Force Login
        </button>
        <button
          onClick={clearAll}
          style={{ background: "#ff4444", color: "white" }}
        >
          Clear All & Reload
        </button>
      </div>

      <div
        style={{ background: "#f5f5f5", padding: "15px", borderRadius: "5px" }}
      >
        <h3>Current Redux State:</h3>
        <pre>{JSON.stringify(auth, null, 2)}</pre>

        <h3>LocalStorage:</h3>
        <pre>
          {JSON.stringify(
            {
              accessToken:
                localStorage.getItem("accessToken")?.substring(0, 30) + "...",
              refreshToken:
                localStorage.getItem("refreshToken")?.substring(0, 30) + "...",
              user: localStorage.getItem("user"),
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
};

export default DebugAuthPage;
