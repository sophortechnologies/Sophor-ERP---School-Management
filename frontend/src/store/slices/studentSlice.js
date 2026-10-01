// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { studentApi } from "../../modules/student/api/student.api";

// // =======================================================
// // 🔄 Fetch Student Dashboard Data
// // =======================================================
// export const fetchStudentDashboard = createAsyncThunk(
//   "student/fetchDashboard",
//   async (_, { rejectWithValue }) => {
//     try {
//       console.log("🔄 REDUX THUNK: Fetching student dashboard...");

//       const response = await studentApi.getDashboard();
//       console.log("✅ REDUX THUNK: Dashboard data received", response);

//       return response;
//     } catch (error) {
//       console.error("❌ REDUX THUNK: Failed to fetch dashboard", error);

//       const errorMessage =
//         error.response?.data?.message ||
//         error.message ||
//         "Failed to load student dashboard.";

//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// // =======================================================
// // 🔄 Fetch Student Profile
// // =======================================================
// export const fetchStudentProfile = createAsyncThunk(
//   "student/fetchProfile",
//   async (_, { rejectWithValue }) => {
//     try {
//       console.log("🔄 REDUX THUNK: Fetching student profile...");

//       const response = await studentApi.getProfile();
//       console.log("✅ REDUX THUNK: Profile received:", response);

//       return response;
//     } catch (error) {
//       console.error("❌ REDUX THUNK: Failed to fetch profile", error);

//       const errorMessage =
//         error.response?.data?.message ||
//         error.message ||
//         "Failed to load student profile.";

//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// // =======================================================
// // 🔄 Logout (Uses the same logic as auth but scoped here)
// // =======================================================
// export const logout = createAsyncThunk(
//   "student/logout",
//   async (_, { rejectWithValue }) => {
//     try {
//       console.log("🔄 REDUX THUNK: Logging out student...");
//       await studentApi.logout();
//     } catch (error) {
//       console.error("Logout API failed:", error);
//     } finally {
//       localStorage.removeItem("accessToken");
//       localStorage.removeItem("refreshToken");
//     }
//   }
// );

// // =======================================================
// // Slice
// // =======================================================
// const studentSlice = createSlice({
//   name: "student",
//   initialState: {
//     user: null,
//     data: null,
//     isLoading: false,
//     error: null,
//   },
//   reducers: {
//     clearStudentError: (state) => {
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // ---------------------------------------------------
//       // Fetch Dashboard
//       // ---------------------------------------------------
//       .addCase(fetchStudentDashboard.pending, (state) => {
//         console.log("🔄 REDUX: fetchStudentDashboard.pending");
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchStudentDashboard.fulfilled, (state, action) => {
//         console.log("✅ REDUX: fetchStudentDashboard.fulfilled");
//         state.isLoading = false;
//         state.data = action.payload;
//         state.error = null;
//       })
//       .addCase(fetchStudentDashboard.rejected, (state, action) => {
//         console.log("❌ REDUX: fetchStudentDashboard.rejected", action.payload);
//         state.isLoading = false;
//         state.error = action.payload;
//       })

//       // ---------------------------------------------------
//       // Fetch Profile
//       // ---------------------------------------------------
//       .addCase(fetchStudentProfile.pending, (state) => {
//         console.log("🔄 REDUX: fetchStudentProfile.pending");
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchStudentProfile.fulfilled, (state, action) => {
//         console.log("✅ REDUX: fetchStudentProfile.fulfilled");
//         state.isLoading = false;
//         state.user = action.payload;
//         state.error = null;
//       })
//       .addCase(fetchStudentProfile.rejected, (state, action) => {
//         console.log("❌ REDUX: fetchStudentProfile.rejected", action.payload);
//         state.isLoading = false;
//         state.error = action.payload;
//         state.user = null;
//       })

//       // ---------------------------------------------------
//       // Logout
//       // ---------------------------------------------------
//       .addCase(logout.fulfilled, (state) => {
//         console.log("🔌 REDUX: Student logged out");
//         state.user = null;
//         state.data = null;
//         state.isLoading = false;
//         state.error = null;
//       });
//   },
// });

// export const { clearStudentError } = studentSlice.actions;
// export const selectStudent = (state) => state.student;

// export default studentSlice.reducer;
