// import { useState } from "react";
// import { attendanceApi } from "../api";
// import { attendanceValidators } from "../utils";

// export const useBulkUpload = () => {
//   const [uploading, setUploading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [error, setError] = useState(null);
//   const [result, setResult] = useState(null);

//   const uploadFile = async (file, options = {}) => {
//     setUploading(true);
//     setError(null);
//     setProgress(0);
//     setResult(null);

//     // Validate file
//     const validationErrors = attendanceValidators.validateCSVFile(file);
//     if (validationErrors.length > 0) {
//       setError(validationErrors.join(", "));
//       setUploading(false);
//       return;
//     }

//     try {
//       // Simulate progress
//       const progressInterval = setInterval(() => {
//         setProgress((prev) => {
//           if (prev >= 90) {
//             clearInterval(progressInterval);
//             return prev;
//           }
//           return prev + 10;
//         });
//       }, 200);

//       const uploadResult = await attendanceApi.bulkUploadAttendance(
//         file,
//         options
//       );

//       clearInterval(progressInterval);
//       setProgress(100);
//       setResult(uploadResult);

//       return uploadResult;
//     } catch (err) {
//       setError(err.message || "Failed to upload file");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const reset = () => {
//     setUploading(false);
//     setProgress(0);
//     setError(null);
//     setResult(null);
//   };

//   return {
//     uploading,
//     progress,
//     error,
//     result,
//     uploadFile,
//     reset,
//   };
// };
