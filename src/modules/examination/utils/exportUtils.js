// src/modules/examination/utils/exportUtils.js
export const generateCSV = (data, headers) => {
  if (!data || data.length === 0) return "";

  const headerRow = headers
    ? headers.join(",")
    : Object.keys(data[0]).join(",");
  const dataRows = data.map((row) => {
    const values = headers ? headers.map((h) => row[h]) : Object.values(row);
    return values
      .map((value) => {
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(",");
  });

  return [headerRow, ...dataRows].join("\n");
};

export const downloadCSV = (data, filename = "export.csv", headers = null) => {
  const csvContent = generateCSV(data, headers);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
};

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const formatDataForExport = (data, type = "results") => {
  switch (type) {
    case "exams":
      return data.map((exam) => ({
        "Exam Name": exam.name,
        Type: exam.examType,
        Class: exam.className || exam.classId,
        Date: exam.examDate,
        "Total Marks": exam.totalMarks,
        "Passing Marks": exam.passingMarks,
        Status: exam.status,
        Description: exam.description || "",
      }));

    case "grades":
      return data.map((grade) => ({
        "Student ID": grade.studentId,
        "Student Name": grade.studentName,
        Exam: grade.examName || grade.examId,
        Subject: grade.subjectName || grade.subjectId,
        "Marks Obtained": grade.marksObtained,
        "Total Marks": grade.totalMarks,
        Percentage:
          grade.percentage ||
          ((grade.marksObtained / grade.totalMarks) * 100).toFixed(2),
        Grade: grade.grade,
        Remarks: grade.remarks || "",
      }));

    case "results":
      return data.map((result) => ({
        "Student ID": result.studentId,
        "Student Name": result.studentName,
        "Roll Number": result.rollNumber,
        Class: result.className,
        Exam: result.examName,
        "Total Marks": result.totalMarks,
        "Obtained Marks": result.obtainedMarks,
        Percentage: result.percentage,
        Grade: result.grade,
        Rank: result.rank,
        Status: result.status,
      }));

    default:
      return data;
  }
};

export const generatePDFContent = (data, title = "Report") => {
  const content = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #f5f5f5; text-align: left; padding: 10px; border: 1px solid #ddd; }
          td { padding: 8px 10px; border: 1px solid #ddd; }
          .footer { margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <p>Total Records: ${data.length}</p>
        <div class="footer">
          This is an automatically generated report.
        </div>
      </body>
    </html>
  `;

  return content;
};
