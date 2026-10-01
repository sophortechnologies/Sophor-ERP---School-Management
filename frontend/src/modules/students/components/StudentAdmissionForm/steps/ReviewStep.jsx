import React from "react";
import { Save, Printer, Download, CheckCircle } from "lucide-react";

const ReviewStep = ({
  formData,
  classes = [],
  sections = [],
  loading,
  generatedStudentId,
  studentName,
  showSuccess,
  onPrint,
  onClose,
  onPrev,
  onReset,
}) => {
  const { personalInfo, guardianInfo, academicInfo, educationBackground } = formData;

  // Helper to get class display name
  const getClassDisplayName = () => {
    if (!academicInfo.className) return "Not selected";
    
    const classObj = classes.find(cls => {
      if (!cls) return false;
      if (cls.id === parseInt(academicInfo.className) || 
          cls._id === academicInfo.className ||
          cls.id?.toString() === academicInfo.className ||
          cls._id?.toString() === academicInfo.className) {
        return true;
      }
      if (cls.name === academicInfo.className || 
          cls.className === academicInfo.className ||
          cls.grade === academicInfo.className) {
        return true;
      }
      return false;
    });
    
    if (classObj) {
      if (classObj.name) return classObj.name;
      if (classObj.className) return classObj.className;
      if (classObj.grade) return `Grade ${classObj.grade}`;
      if (classObj.level) return `Class ${classObj.level}`;
      return `Class ${classObj.id || classObj._id}`;
    }
    
    return academicInfo.className;
  };

  // Helper to get section display name
  const getSectionDisplayName = () => {
    if (!academicInfo.section) return "Not selected";
    
    const sectionObj = sections.find(sec => {
      if (!sec) return false;
      if (sec.id === parseInt(academicInfo.section) || 
          sec._id === academicInfo.section ||
          sec.id?.toString() === academicInfo.section ||
          sec._id?.toString() === academicInfo.section) {
        return true;
      }
      if (sec.name === academicInfo.section || 
          sec.sectionName === academicInfo.section ||
          sec.code === academicInfo.section) {
        return true;
      }
      return false;
    });
    
    if (sectionObj) {
      if (sectionObj.name) return sectionObj.name;
      if (sectionObj.sectionName) return sectionObj.sectionName;
      if (sectionObj.code) return `Section ${sectionObj.code}`;
      return `Section ${sectionObj.id || sectionObj._id}`;
    }
    
    return academicInfo.section;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Professional print function
  const handleProfessionalPrint = () => {
    // Determine if we should show separate father/mother sections
    const showSeparateFather = guardianInfo.fatherName && guardianInfo.guardianRelation !== 'FATHER';
    const showSeparateMother = guardianInfo.motherName && guardianInfo.guardianRelation !== 'MOTHER';
    
    // Create print content with professional layout
    const printContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admission Confirmation - ${personalInfo.firstName} ${personalInfo.lastName}</title>
        <style>
          @page {
            margin: 0.5in;
            size: A4 portrait;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.4;
            color: #333;
            background: white;
            margin: 0;
            font-size: 12pt;
          }
          
          .print-container {
            max-width: 8.5in;
            margin: 0 auto;
            padding: 20px;
          }
          
          /* Header Styles */
          .print-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            border-bottom: 3px solid #1b633b;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          
          .logo-section {
            flex: 0 0 200px;
          }
          
          .logo {
            height: 80px;
            width: auto;
          }
          
          .school-name {
            font-size: 14pt;
            color: #172b4c;
            font-weight: bold;
            margin-top: 5px;
          }
          
          .school-tagline {
            font-size: 10pt;
            color: #666;
            margin-top: 2px;
          }
          
          .header-content {
            flex: 1;
            text-align: center;
            padding: 0 20px;
          }
          
          .header-content h1 {
            color: #172b4c;
            font-size: 22pt;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .header-content .subtitle {
            color: #1b633b;
            font-size: 14pt;
            font-weight: 600;
          }
          
          .header-right {
            flex: 0 0 200px;
            text-align: right;
            font-size: 11pt;
          }
          
          .student-id-badge {
            display: inline-block;
            background: #1b633b;
            color: white;
            padding: 8px 15px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 12pt;
            margin-top: 10px;
          }
          
          /* Main Content Styles */
          .print-content {
            margin: 20px 0;
          }
          
          .print-section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          
          .print-section h3 {
            color: #172b4c;
            background: #f8f9fa;
            padding: 10px 15px;
            margin: 0 0 15px 0;
            border-left: 4px solid #1b633b;
            font-size: 16pt;
            font-weight: bold;
            border-radius: 3px 0 0 3px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px 30px;
            margin-bottom: 15px;
          }
          
          .info-item {
            margin-bottom: 12px;
          }
          
          .info-label {
            font-weight: 600;
            color: #172b4c;
            display: inline-block;
            min-width: 160px;
            font-size: 11pt;
          }
          
          .info-value {
            font-size: 11pt;
            color: #333;
          }
          
          /* Signature Section */
          .signature-section {
            margin-top: 40px;
            page-break-inside: avoid;
          }
          
          .signature-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 40px;
            margin-top: 50px;
          }
          
          .signature-box {
            text-align: center;
            padding-top: 60px;
            position: relative;
            min-height: 100px;
          }
          
          .signature-box::before {
            content: "";
            position: absolute;
            top: 0;
            left: 20%;
            right: 20%;
            border-top: 1px solid #333;
            padding-top: 20px;
          }
          
          .signature-label {
            font-weight: 600;
            color: #172b4c;
            font-size: 11pt;
          }
          
          .signature-role {
            font-size: 10pt;
            color: #666;
            margin-top: 5px;
          }
          
          /* Footer Styles */
          .print-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #1b633b;
            text-align: center;
            color: #666;
            font-size: 10pt;
            page-break-inside: avoid;
          }
          
          .footer-content {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 15px;
          }
          
          .footer-section {
            text-align: center;
          }
          
          .footer-section h5 {
            color: #172b4c;
            margin: 0 0 5px 0;
            font-size: 11pt;
            font-weight: bold;
          }
          
          .footer-note {
            font-style: italic;
            color: #888;
            margin-top: 20px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 4px;
            font-size: 9pt;
            line-height: 1.4;
          }
          
          /* Print-specific styles */
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .no-print {
              display: none !important;
            }
            
            .print-container {
              padding: 0.5in;
            }
            
            /* Prevent page breaks in sections */
            .print-section {
              page-break-inside: avoid;
            }
            
            .signature-section {
              page-break-inside: avoid;
            }
            
            /* Remove print headers/footers */
            @page {
              @top-left { content: none; }
              @top-center { content: none; }
              @top-right { content: none; }
              @bottom-left { content: none; }
              @bottom-center { content: none; }
              @bottom-right { content: none; }
            }
          }
          
          /* Watermark */
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80pt;
            color: rgba(0, 0, 0, 0.05);
            z-index: -1;
            pointer-events: none;
            font-weight: bold;
            white-space: nowrap;
          }
        </style>
      </head>
      <body>
        <div class="watermark">SOPHOR ACADEMY</div>
        
        <div class="print-container">
          <!-- Header -->
          <div class="print-header">
            <div class="logo-section">
              <div style="font-size: 9pt; color: #666; margin-bottom: 5px;">Official Document</div>
              <img src="/images/sophor-logo.jpg" alt="Sophor Academy Logo" class="logo" />
              <div class="school-name">Sophor Academy</div>
              <div class="school-tagline">Excellence in Education Since 2005</div>
            </div>
            
            <div class="header-content">
              <h1>STUDENT ADMISSION CONFIRMATION</h1>
              <div class="subtitle">Official Registration Document</div>
              <div style="margin-top: 10px; font-size: 11pt; color: #666;">
                Document No: ADM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}
              </div>
            </div>
            
            <div class="header-right">
              <div style="margin-bottom: 10px;">
                <strong>Date:</strong> ${new Date().toLocaleDateString()}
              </div>
              <div class="student-id-badge">
                Student ID: ${generatedStudentId || "PENDING"}
              </div>
            </div>
          </div>
          
          <!-- Student Information -->
          <div class="print-content">
            
            <!-- Personal Information -->
            <div class="print-section">
              <h3>Student Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Full Name:</span>
                  <span class="info-value">${personalInfo.firstName} ${personalInfo.lastName}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Date of Birth:</span>
                  <span class="info-value">${formatDate(personalInfo.dateOfBirth)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Gender:</span>
                  <span class="info-value">${personalInfo.gender || "N/A"}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Nationality:</span>
                  <span class="info-value">${personalInfo.nationality || "N/A"}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Phone Number:</span>
                  <span class="info-value">+251 ${personalInfo.phone || "N/A"}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${personalInfo.email || "N/A"}</span>
                </div>
              </div>
              ${personalInfo.address ? `
              <div class="info-item">
                <span class="info-label">Address:</span>
                <span class="info-value">${personalInfo.address}${personalInfo.city ? `, ${personalInfo.city}` : ''}${personalInfo.state ? `, ${personalInfo.state}` : ''}${personalInfo.pincode ? ` - ${personalInfo.pincode}` : ''}</span>
              </div>
              ` : ''}
            </div>
            
            <!-- Guardian Information -->
            ${guardianInfo.guardianName || showSeparateFather || showSeparateMother ? `
            <div class="print-section">
              <h3>Guardian Information</h3>
              ${guardianInfo.guardianName ? `
              <div style="margin-bottom: 20px;">
                <h4 style="color: #1b633b; margin-bottom: 10px; font-size: 14pt;">
                  ${guardianInfo.guardianRelation === 'FATHER' ? 'Father / ' : ''}
                  ${guardianInfo.guardianRelation === 'MOTHER' ? 'Mother / ' : ''}
                  Guardian Information
                </h4>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${guardianInfo.guardianName}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Relation:</span>
                    <span class="info-value">${guardianInfo.guardianRelation || "N/A"}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">+251 ${guardianInfo.guardianPhone || "N/A"}</span>
                  </div>
                  ${guardianInfo.guardianEmail ? `
                  <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${guardianInfo.guardianEmail}</span>
                  </div>
                  ` : ''}
                  ${guardianInfo.guardianOccupation ? `
                  <div class="info-item">
                    <span class="info-label">Occupation:</span>
                    <span class="info-value">${guardianInfo.guardianOccupation}</span>
                  </div>
                  ` : ''}
                </div>
              </div>
              ` : ''}
              
              <!-- Only show separate father section if guardian is NOT father -->
              ${showSeparateFather ? `
              <div style="margin-bottom: 20px;">
                <h4 style="color: #1b633b; margin-bottom: 10px; font-size: 14pt;">Father's Information</h4>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${guardianInfo.fatherName}</span>
                  </div>
                  ${guardianInfo.fatherOccupation ? `
                  <div class="info-item">
                    <span class="info-label">Occupation:</span>
                    <span class="info-value">${guardianInfo.fatherOccupation}</span>
                  </div>
                  ` : ''}
                  ${guardianInfo.fatherPhone ? `
                  <div class="info-item">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${guardianInfo.fatherPhone}</span>
                  </div>
                  ` : ''}
                  ${guardianInfo.fatherEmail ? `
                  <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${guardianInfo.fatherEmail}</span>
                  </div>
                  ` : ''}
                </div>
              </div>
              ` : ''}
              
              <!-- Only show separate mother section if guardian is NOT mother -->
              ${showSeparateMother ? `
              <div style="margin-bottom: 20px;">
                <h4 style="color: #1b633b; margin-bottom: 10px; font-size: 14pt;">Mother's Information</h4>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${guardianInfo.motherName}</span>
                  </div>
                  ${guardianInfo.motherOccupation ? `
                  <div class="info-item">
                    <span class="info-label">Occupation:</span>
                    <span class="info-value">${guardianInfo.motherOccupation}</span>
                  </div>
                  ` : ''}
                  ${guardianInfo.motherPhone ? `
                  <div class="info-item">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${guardianInfo.motherPhone}</span>
                  </div>
                  ` : ''}
                  ${guardianInfo.motherEmail ? `
                  <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${guardianInfo.motherEmail}</span>
                  </div>
                  ` : ''}
                </div>
              </div>
              ` : ''}
            </div>
            ` : ''}
            
            <!-- Academic Information -->
            <div class="print-section">
              <h3>Academic Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Academic Session:</span>
                  <span class="info-value">${academicInfo.academicSession || "N/A"}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Class:</span>
                  <span class="info-value">${getClassDisplayName()}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Section:</span>
                  <span class="info-value">${getSectionDisplayName()}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Admission Date:</span>
                  <span class="info-value">${formatDate(academicInfo.admissionDate) || formatDate(new Date().toISOString())}</span>
                </div>
                ${academicInfo.rollNumber ? `
                <div class="info-item">
                  <span class="info-label">Roll Number:</span>
                  <span class="info-value">${academicInfo.rollNumber}</span>
                </div>
                ` : ''}
              </div>
            </div>
            
            <!-- Educational Background -->
            ${educationBackground.lastSchool ? `
            <div class="print-section">
              <h3>Educational Background</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Previous School:</span>
                  <span class="info-value">${educationBackground.lastSchool}</span>
                </div>
                ${educationBackground.lastClass ? `
                <div class="info-item">
                  <span class="info-label">Last Class:</span>
                  <span class="info-value">${educationBackground.lastClass}</span>
                </div>
                ` : ''}
                ${educationBackground.lastBoard ? `
                <div class="info-item">
                  <span class="info-label">Board/University:</span>
                  <span class="info-value">${educationBackground.lastBoard}</span>
                </div>
                ` : ''}
                ${educationBackground.lastPercentage ? `
                <div class="info-item">
                  <span class="info-label">Percentage/GPA:</span>
                  <span class="info-value">${educationBackground.lastPercentage}</span>
                </div>
                ` : ''}
                ${educationBackground.admissionTestScore ? `
                <div class="info-item">
                  <span class="info-label">Admission Test Score:</span>
                  <span class="info-value">${educationBackground.admissionTestScore}</span>
                </div>
                ` : ''}
                ${educationBackground.admissionTestDate ? `
                <div class="info-item">
                  <span class="info-label">Test Date:</span>
                  <span class="info-value">${formatDate(educationBackground.admissionTestDate)}</span>
                </div>
                ` : ''}
              </div>
              ${educationBackground.remarks ? `
              <div class="info-item">
                <span class="info-label">Remarks:</span>
                <span class="info-value">${educationBackground.remarks}</span>
              </div>
              ` : ''}
            </div>
            ` : ''}
            
            <!-- Signature Section -->
            <div class="signature-section">
              <div class="signature-grid">
                <div class="signature-box">
                  <div class="signature-label">Admission Officer</div>
                  <div class="signature-role">Sophor Academy</div>
                </div>
                <div class="signature-box">
                  <div class="signature-label">Principal</div>
                  <div class="signature-role">Sophor Academy</div>
                </div>
                <div class="signature-box">
                  <div class="signature-label">Parent/Guardian</div>
                  <div class="signature-role">Acknowledgement</div>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="print-footer">
              <div class="footer-content">
                <div class="footer-section">
                  <h5>Contact Information</h5>
                  <div>Adi-Haqi, Mekelle</div>
                  <div>+251 11 123 4567</div>
                  <div>http://sophortechnologies.com/</div>
                </div>
                <div class="footer-section">
                  <h5>School Hours</h5>
                  <div>Mon - Fri: 8:00 AM - 4:00 PM</div>
                  <div>Saturday: 9:00 AM - 1:00 PM</div>
                  <div>Sunday: Closed</div>
                </div>
                <div class="footer-section">
                  <h5>Website</h5>
                  <div>http://sophortechnologies.com/</div>
                  <div>Follow us on social media</div>
                </div>
              </div>
              <div class="footer-note">
                This is an official document generated by Sophor Academy Admission System. 
                Any unauthorized duplication or distribution is prohibited. 
                For verification, please contact the admission office.
              </div>
            </div>
            
          </div>
        </div>
        
        <script>
          // Auto-print when document loads
          window.onload = function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 100);
            }, 250);
          };
          
          // Fallback for browsers that block window.close()
          window.onafterprint = function() {
            setTimeout(function() {
              window.close();
            }, 100);
          };
        </script>
      </body>
      </html>
    `;

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=900,height=650');
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Fallback for browsers that block window.print()
    printWindow.onload = function() {
      setTimeout(function() {
        printWindow.print();
      }, 250);
    };
  };

  if (showSuccess) {
    return (
      <div className="p-6">
        {/* Success Section */}
        <div className="bg-[#f8f9fa] rounded-lg p-8 mb-6">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h4 className="text-[#28a745] text-xl font-semibold mb-3">Admission Successful!</h4>
            <p className="text-gray-600 mb-4">Student has been successfully registered in the system.</p>
            <div className="bg-white border-2 border-[#28a745] rounded-lg p-4 inline-block">
              <strong className="text-lg">Student ID: {generatedStudentId}</strong>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 mb-6 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
            <h4 className="text-[#2c3e50] text-lg font-semibold mb-5 pb-3 border-b-2 border-[#f0f0f0]">Admission Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex flex-col">
                <label className="font-semibold text-gray-600 text-sm mb-2">Name:</label>
                <span className="text-gray-800">{studentName}</span>
              </div>
              <div className="flex flex-col">
                <label className="font-semibold text-gray-600 text-sm mb-2">Class:</label>
                <span className="text-gray-800">{getClassDisplayName()}</span>
              </div>
              <div className="flex flex-col">
                <label className="font-semibold text-gray-600 text-sm mb-2">Section:</label>
                <span className="text-gray-800">{getSectionDisplayName()}</span>
              </div>
              <div className="flex flex-col">
                <label className="font-semibold text-gray-600 text-sm mb-2">Session:</label>
                <span className="text-gray-800">{academicInfo.academicSession}</span>
              </div>
              <div className="flex flex-col">
                <label className="font-semibold text-gray-600 text-sm mb-2">Admission Date:</label>
                <span className="text-gray-800">{academicInfo.admissionDate || new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              className="px-6 py-3 bg-[#172b4c] text-white rounded-lg font-medium hover:bg-[#5a6268] transition-all duration-200 flex items-center gap-2 justify-center min-w-[200px]"
              onClick={handleProfessionalPrint}
            >
              <Printer size={16} />
              Print Confirmation
            </button>
            <button 
              type="button" 
              className="px-6 py-3 bg-[#1b633b] text-white rounded-lg font-medium hover:bg-[#2980b9] transition-all duration-200 flex items-center gap-2 justify-center min-w-[200px]"
              onClick={onClose}
            >
              Done
            </button>
            <button 
              type="button" 
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 justify-center min-w-[200px]"
              onClick={onReset}
            >
              <Download size={16} />
              New Admission
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Review Section */}
      <div className="bg-white rounded-lg p-8 mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
        <div className="text-center mb-8">
          <h4 className="text-[#2c3e50] text-xl font-semibold">Please review the information before submission</h4>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-[#f8f9fa] rounded-lg p-6 border-l-4 border-[#3498db]">
            <h5 className="text-[#2c3e50] text-lg font-semibold mb-4">Personal Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-gray-600">Name:</strong> 
                <span className="ml-2 text-gray-800">{personalInfo.firstName} {personalInfo.lastName}</span>
              </div>
              <div>
                <strong className="text-gray-600">DOB:</strong> 
                <span className="ml-2 text-gray-800">{personalInfo.dateOfBirth}</span>
              </div>
              <div>
                <strong className="text-gray-600">Gender:</strong> 
                <span className="ml-2 text-gray-800">{personalInfo.gender}</span>
              </div>
              {personalInfo.nationality && (
                <div>
                  <strong className="text-gray-600">Nationality:</strong> 
                  <span className="ml-2 text-gray-800">{personalInfo.nationality}</span>
                </div>
              )}
              <div>
                <strong className="text-gray-600">Phone:</strong> 
                <span className="ml-2 text-gray-800">+251{personalInfo.phone}</span>
              </div>
              {personalInfo.email && (
                <div>
                  <strong className="text-gray-600">Email:</strong> 
                  <span className="ml-2 text-gray-800">{personalInfo.email}</span>
                </div>
              )}
              <div className="md:col-span-2">
                <strong className="text-gray-600">Address:</strong> 
                <span className="ml-2 text-gray-800">{personalInfo.address}, {personalInfo.city}, {personalInfo.state} - {personalInfo.pincode}</span>
              </div>
            </div>
          </div>

          {/* Guardian Information */}
          {(guardianInfo.guardianName || 
            (guardianInfo.fatherName && guardianInfo.guardianRelation !== 'FATHER') || 
            (guardianInfo.motherName && guardianInfo.guardianRelation !== 'MOTHER')) && (
            <div className="bg-[#f8f9fa] rounded-lg p-6 border-l-4 border-[#1b633b]">
              <h5 className="text-[#2c3e50] text-lg font-semibold mb-4">Guardian Information</h5>
              <div className="space-y-4">
                {guardianInfo.guardianName && (
                  <div>
                    <h6 className="font-semibold text-gray-700 mb-2">
                      {guardianInfo.guardianRelation === 'FATHER' ? 'Father / ' : ''}
                      {guardianInfo.guardianRelation === 'MOTHER' ? 'Mother / ' : ''}
                      Guardian:
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-4">
                      <div><strong className="text-gray-600">Name:</strong> {guardianInfo.guardianName}</div>
                      {guardianInfo.guardianRelation && <div><strong className="text-gray-600">Relation:</strong> {guardianInfo.guardianRelation}</div>}
                      {guardianInfo.guardianPhone && <div><strong className="text-gray-600">Phone:</strong> +251{guardianInfo.guardianPhone}</div>}
                      {guardianInfo.guardianEmail && <div><strong className="text-gray-600">Email:</strong> {guardianInfo.guardianEmail}</div>}
                      {guardianInfo.guardianOccupation && <div><strong className="text-gray-600">Occupation:</strong> {guardianInfo.guardianOccupation}</div>}
                    </div>
                  </div>
                )}
                
                {/* Only show separate father if guardian is NOT father */}
                {guardianInfo.fatherName && guardianInfo.guardianRelation !== 'FATHER' && (
                  <div>
                    <h6 className="font-semibold text-gray-700 mb-2">Father:</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-4">
                      <div><strong className="text-gray-600">Name:</strong> {guardianInfo.fatherName}</div>
                      {guardianInfo.fatherOccupation && <div><strong className="text-gray-600">Occupation:</strong> {guardianInfo.fatherOccupation}</div>}
                      {guardianInfo.fatherPhone && <div><strong className="text-gray-600">Phone:</strong> {guardianInfo.fatherPhone}</div>}
                      {guardianInfo.fatherEmail && <div><strong className="text-gray-600">Email:</strong> {guardianInfo.fatherEmail}</div>}
                    </div>
                  </div>
                )}
                
                {/* Only show separate mother if guardian is NOT mother */}
                {guardianInfo.motherName && guardianInfo.guardianRelation !== 'MOTHER' && (
                  <div>
                    <h6 className="font-semibold text-gray-700 mb-2">Mother:</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-4">
                      <div><strong className="text-gray-600">Name:</strong> {guardianInfo.motherName}</div>
                      {guardianInfo.motherOccupation && <div><strong className="text-gray-600">Occupation:</strong> {guardianInfo.motherOccupation}</div>}
                      {guardianInfo.motherPhone && <div><strong className="text-gray-600">Phone:</strong> {guardianInfo.motherPhone}</div>}
                      {guardianInfo.motherEmail && <div><strong className="text-gray-600">Email:</strong> {guardianInfo.motherEmail}</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Academic Information */}
          <div className="bg-[#f8f9fa] rounded-lg p-6 border-l-4 border-[#e74c3c]">
            <h5 className="text-[#2c3e50] text-lg font-semibold mb-4">Academic Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><strong className="text-gray-600">Academic Session:</strong> {academicInfo.academicSession}</div>
              <div><strong className="text-gray-600">Class:</strong> {getClassDisplayName()}</div>
              <div><strong className="text-gray-600">Section:</strong> {getSectionDisplayName()}</div>
              <div><strong className="text-gray-600">Admission Date:</strong> {academicInfo.admissionDate || new Date().toLocaleDateString()}</div>
              {academicInfo.rollNumber && <div><strong className="text-gray-600">Roll Number:</strong> {academicInfo.rollNumber}</div>}
            </div>
          </div>

          {/* Educational Background */}
          {educationBackground.lastSchool && (
            <div className="bg-[#f8f9fa] rounded-lg p-6 border-l-4 border-[#9b59b6]">
              <h5 className="text-[#2c3e50] text-lg font-semibold mb-4">Educational Background</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong className="text-gray-600">Previous School:</strong> {educationBackground.lastSchool}</div>
                {educationBackground.lastClass && <div><strong className="text-gray-600">Last Class:</strong> {educationBackground.lastClass}</div>}
                {educationBackground.lastBoard && <div><strong className="text-gray-600">Board/University:</strong> {educationBackground.lastBoard}</div>}
                {educationBackground.lastPercentage && <div><strong className="text-gray-600">Percentage/GPA:</strong> {educationBackground.lastPercentage}</div>}
                {educationBackground.admissionTestScore && <div><strong className="text-gray-600">Admission Test Score:</strong> {educationBackground.admissionTestScore}</div>}
                {educationBackground.admissionTestDate && <div><strong className="text-gray-600">Test Date:</strong> {educationBackground.admissionTestDate}</div>}
                {educationBackground.remarks && (
                  <div className="md:col-span-2">
                    <strong className="text-gray-600">Remarks:</strong> 
                    <span className="ml-2 text-gray-800">{educationBackground.remarks}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
          <button 
            type="button" 
            className="px-6 py-3 bg-[#172b4c] text-white rounded-lg font-medium hover:bg-[#5a6268] transition-all duration-200 flex items-center gap-2"
            onClick={onPrev}
          >
            Back
          </button>
          <button 
            type="submit" 
            className="px-6 py-3 bg-[#1b633b] text-white rounded-lg font-medium hover:bg-[#2980b9] transition-all duration-200 flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Processing Admission...
              </>
            ) : (
              <>
                <Save size={16} />
                Submit Admission
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;