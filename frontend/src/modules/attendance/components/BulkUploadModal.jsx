import React, { useState } from "react";
import { X, Upload, Download, Check, AlertCircle } from "lucide-react";
import { BULK_UPLOAD_HEADERS } from "../constants";
import "./BulkUploadModal.css";

const BulkUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Result

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Check file type
    if (!selectedFile.name.endsWith('.csv')) {
      alert("Please upload a CSV file");
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (csvFile) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n').map(row => row.trim()).filter(row => row);
      
      // Extract headers from first row
      const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
      
      // Validate headers
      const missingHeaders = BULK_UPLOAD_HEADERS.filter(h => 
        !headers.includes(h.toLowerCase())
      );
      
      if (missingHeaders.length > 0) {
        setErrors([`Missing headers: ${missingHeaders.join(', ')}`]);
        setPreview([]);
        return;
      }
      
      // Parse data rows
      const data = rows.slice(1).map((row, index) => {
        const values = row.split(',').map(v => v.trim());
        const record = {};
        
        headers.forEach((header, i) => {
          record[header] = values[i] || '';
        });
        
        // Add validation errors
        const recordErrors = [];
        
        if (!record.studentid) recordErrors.push("Missing Student ID");
        if (!record.studentname) recordErrors.push("Missing Student Name");
        if (!record.date) recordErrors.push("Missing Date");
        if (!record.status) recordErrors.push("Missing Status");
        
        return {
          ...record,
          lineNumber: index + 2,
          errors: recordErrors,
        };
      });
      
      setPreview(data);
      setErrors([]);
      setStep(2);
    };
    
    reader.readAsText(csvFile);
  };

  const downloadTemplate = () => {
    const template = BULK_UPLOAD_HEADERS.join(',') + '\n' +
      'STU001,John Doe,2024-03-01,present,08:15,15:30,Present for class\n' +
      'STU002,Jane Smith,2024-03-01,absent,,,Sick leave\n' +
      'STU003,Mike Johnson,2024-03-01,late,08:45,15:30,Late due to traffic';
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_template.csv';
    a.click();
  };

  const handleUpload = async () => {
    if (preview.length === 0) return;
    
    const hasErrors = preview.some(record => record.errors.length > 0);
    if (hasErrors) {
      alert("Please fix all errors before uploading");
      return;
    }
    
    setUploading(true);
    try {
      const uploadData = preview.map(record => ({
        studentId: record.studentid,
        studentName: record.studentname,
        date: record.date,
        status: record.status,
        checkInTime: record.checkintime,
        checkOutTime: record.checkouttime,
        remarks: record.remarks,
      }));
      
      await onUpload(uploadData);
      setStep(3);
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview([]);
    setErrors([]);
    setStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className="attendance-bulkuploadmodal-modal-overlay" onClick={onClose}>
      <div className="attendance-bulkuploadmodal-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="attendance-bulkuploadmodal-modal-header">
          <h2>
            <Upload size={20} />
            Bulk Upload Attendance
          </h2>
          <button className="attendance-bulkuploadmodal-close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="attendance-bulkuploadmodal-upload-steps">
          <div className={`attendance-bulkuploadmodal-step ${step >= 1 ? 'active' : ''}`}>
            <div className="attendance-bulkuploadmodal-step-number">1</div>
            <div className="attendance-bulkuploadmodal-step-label">Upload File</div>
          </div>
          <div className={`attendance-bulkuploadmodal-step ${step >= 2 ? 'active' : ''}`}>
            <div className="attendance-bulkuploadmodal-step-number">2</div>
            <div className="attendance-bulkuploadmodal-step-label">Preview & Validate</div>
          </div>
          <div className={`attendance-bulkuploadmodal-step ${step >= 3 ? 'active' : ''}`}>
            <div className="attendance-bulkuploadmodal-step-number">3</div>
            <div className="attendance-bulkuploadmodal-step-label">Upload Complete</div>
          </div>
        </div>

        {step === 1 && (
          <div className="attendance-bulkuploadmodal-upload-section">
            <div className="attendance-bulkuploadmodal-upload-area" onClick={() => document.getElementById('file-input').click()}>
              <Upload size={48} />
              <h3>Upload CSV File</h3>
              <p>Drag & drop your file here or click to browse</p>
              <p className="attendance-bulkuploadmodal-upload-hint">Supported format: CSV (Max 5MB)</p>
              <input
                id="file-input"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
            
            {file && (
              <div className="attendance-bulkuploadmodal-file-info">
                <Check size={16} color="#10b981" />
                <span>{file.name} ({Math.round(file.size / 1024)} KB)</span>
              </div>
            )}
            
            <div className="attendance-bulkuploadmodal-template-section">
              <h4>Download Template</h4>
              <p>Use our template to ensure correct formatting</p>
              <button className="btn attendance-bulkuploadmodal-btn-secondary" onClick={downloadTemplate}>
                <Download size={16} />
                Download Template
              </button>
            </div>
            
            <div className="attendance-bulkuploadmodal-format-info">
              <h4>Required Format:</h4>
              <div className="attendance-bulkuploadmodal-format-table">
                <table>
                  <thead>
                    <tr>
                      <th>Column</th>
                      <th>Required</th>
                      <th>Format</th>
                      <th>Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BULK_UPLOAD_HEADERS.map(header => (
                      <tr key={header}>
                        <td>{header}</td>
                        <td>{['studentId', 'studentName', 'date', 'status'].includes(header) ? 'Yes' : 'No'}</td>
                        <td>
                          {header === 'date' ? 'YYYY-MM-DD' : 
                           header.includes('Time') ? 'HH:MM' : 
                           header === 'status' ? 'present/absent/late/leave/half_day' : 
                           'Text'}
                        </td>
                        <td>
                          {header === 'studentId' ? 'STU001' : 
                           header === 'studentName' ? 'John Doe' : 
                           header === 'date' ? '2024-03-01' : 
                           header === 'status' ? 'present' : 
                           header === 'checkInTime' ? '08:15' : 
                           header === 'checkOutTime' ? '15:30' : 
                           'Remark text'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="attendance-bulkuploadmodal-preview-section">
            <div className="attendance-bulkuploadmodal-preview-header">
              <h3>Preview & Validate</h3>
              <div className="attendance-bulkuploadmodal-preview-stats">
                <span className="attendance-bulkuploadmodal-stat-success">
                  <Check size={14} />
                  Valid: {preview.filter(r => r.errors.length === 0).length}
                </span>
                <span className="attendance-bulkuploadmodal-stat-error">
                  <AlertCircle size={14} />
                  Errors: {preview.filter(r => r.errors.length > 0).length}
                </span>
              </div>
            </div>
            
            {errors.length > 0 && (
              <div className="attendance-bulkuploadmodal-header-errors">
                {errors.map((error, index) => (
                  <div key={index} className="attendance-bulkuploadmodal-error-alert">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                ))}
              </div>
            )}
            
            <div className="attendance-bulkuploadmodal-preview-table-container">
              <table className="attendance-bulkuploadmodal-preview-table">
                <thead>
                  <tr>
                    <th>Line</th>
                    {BULK_UPLOAD_HEADERS.map(header => (
                      <th key={header}>{header}</th>
                    ))}
                    <th>Validation</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 10).map((record) => (
                    <tr key={record.lineNumber} className={record.errors.length > 0 ? 'attendance-bulkuploadmodal-row-error' : 'attendance-bulkuploadmodal-row-valid'}>
                      <td className="attendance-bulkuploadmodal-line-number">{record.lineNumber}</td>
                      {BULK_UPLOAD_HEADERS.map(header => (
                        <td key={header}>{record[header.toLowerCase()] || '-'}</td>
                      ))}
                      <td className="attendance-bulkuploadmodal-validation-cell">
                        {record.errors.length > 0 ? (
                          <div className="attendance-bulkuploadmodal-validation-errors">
                            {record.errors.map((error, idx) => (
                              <div key={idx} className="attendance-bulkuploadmodal-error-item">
                                <AlertCircle size={12} />
                                {error}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="attendance-bulkuploadmodal-validation-success">
                            <Check size={12} />
                            Valid
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {preview.length > 10 && (
                <div className="attendance-bulkuploadmodal-preview-more">
                  ... and {preview.length - 10} more records
                </div>
              )}
            </div>
            
            <div className="attendance-bulkuploadmodal-preview-actions">
              <button className="btn attendance-bulkuploadmodal-btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleUpload}
                disabled={uploading || preview.some(r => r.errors.length > 0)}
              >
                {uploading ? 'Uploading...' : `Upload ${preview.length} Records`}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="attendance-bulkuploadmodal-result-section">
            <div className="attendance-bulkuploadmodal-result-icon success">
              <Check size={48} />
            </div>
            <h3>Upload Successful!</h3>
            <p className="attendance-bulkuploadmodal-result-message">
              {preview.length} attendance records have been uploaded successfully.
            </p>
            <div className="attendance-bulkuploadmodal-result-stats">
              <div className="stat-card">
                <div className="stat-value">{preview.length}</div>
                <div className="stat-label">Total Records</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {preview.filter(r => r.status === 'present').length}
                </div>
                <div className="stat-label">Present</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {preview.filter(r => r.status === 'absent').length}
                </div>
                <div className="stat-label">Absent</div>
              </div>
            </div>
            <div className="attendance-bulkuploadmodal-result-actions">
              <button className="btn attendance-bulkuploadmodal-btn-secondary" onClick={resetForm}>
                Upload Another File
              </button>
              <button className="btn btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUploadModal;