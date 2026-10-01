import React from "react";
import { GraduationCap, FileText, CreditCard } from "lucide-react";

const EducationStep = ({ formData, handleChange, handleFileInputChange }) => {
  return (
    <div className="mb-6">
      <div className="sticky -top-px z-20 bg-white -mx-6 px-6 pt-4 pb-2 border-b-2 border-gray-100 mb-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-primary mb-2">
          <GraduationCap size={20} />
          <h3>Educational Background</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-secondary mb-2">Previous School</label>
          <input
            type="text"
            value={formData.educationBackground.lastSchool}
            onChange={(e) =>
              handleChange("educationBackground", "lastSchool", e.target.value)
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white"
            placeholder="Name of previous school"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-secondary mb-2">Last Class Completed</label>
          <input
            type="text"
            value={formData.educationBackground.lastClass}
            onChange={(e) =>
              handleChange("educationBackground", "lastClass", e.target.value)
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white"
            placeholder="Last class attended"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-secondary mb-2">Previous Academic Year</label>
          <input
            type="text"
            value={formData.educationBackground.previousAcademicYear || ""}
            onChange={(e) =>
              handleChange("educationBackground", "previousAcademicYear", e.target.value)
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white"
            placeholder="e.g., 2023-2024"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-secondary mb-2">Percentage/GPA</label>
          <input
            type="text"
            value={formData.educationBackground.lastPercentage}
            onChange={(e) =>
              handleChange(
                "educationBackground",
                "lastPercentage",
                e.target.value
              )
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white"
            placeholder="Percentage or GPA"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-secondary mb-2">Admission Test Score</label>
          <input
            type="number"
            value={formData.educationBackground.admissionTestScore}
            onChange={(e) =>
              handleChange(
                "educationBackground",
                "admissionTestScore",
                e.target.value
              )
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white"
            placeholder="Test score"
            min="0"
            max="100"
            step="0.1"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-secondary mb-2">Test Date</label>
          <input
            type="date"
            value={formData.educationBackground.admissionTestDate}
            onChange={(e) =>
              handleChange(
                "educationBackground",
                "admissionTestDate",
                e.target.value
              )
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white"
          />
        </div>

        <div className="col-span-full flex flex-col">
          <label className="text-sm font-medium text-secondary mb-2">Remarks</label>
          <textarea
            value={formData.educationBackground.remarks}
            onChange={(e) =>
              handleChange("educationBackground", "remarks", e.target.value)
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white"
            placeholder="Any additional remarks"
            rows="3"
          />
        </div>
      </div>

      <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h4 className="text-base font-semibold text-secondary mb-4">Supporting Documents</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <input
              type="file"
              id="birthCertificate"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileInputChange("birthCertificate", e)}
              className="hidden"
            />
            <label htmlFor="birthCertificate" className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-blue-50 transition-all duration-200">
              <FileText size={20} className="text-gray-600" />
              <span className="text-sm">
                {formData.documents.birthCertificate
                  ? `Selected: ${formData.documents.birthCertificate.name}`
                  : "Birth Certificate"}
              </span>
            </label>
          </div>

          <div className="flex flex-col">
            <input
              type="file"
              id="aadharCard"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileInputChange("aadharCard", e)}
              className="hidden"
            />
            <label htmlFor="aadharCard" className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-blue-50 transition-all duration-200">
              <CreditCard size={20} className="text-gray-600" />
              <span className="text-sm">
                {formData.documents.aadharCard
                  ? `Selected: ${formData.documents.aadharCard.name}`
                  : "Aadhar Card"}
              </span>
            </label>
          </div>

          <div className="flex flex-col">
            <input
              type="file"
              id="transferCertificate"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileInputChange("transferCertificate", e)}
              className="hidden"
            />
            <label htmlFor="transferCertificate" className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-blue-50 transition-all duration-200">
              <FileText size={20} className="text-gray-600" />
              <span className="text-sm">
                {formData.documents.transferCertificate
                  ? `Selected: ${formData.documents.transferCertificate.name}`
                  : "Transfer Certificate"}
              </span>
            </label>
          </div>

          <div className="flex flex-col">
            <input
              type="file"
              id="marksheet"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileInputChange("marksheet", e)}
              className="hidden"
            />
            <label htmlFor="marksheet" className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-blue-50 transition-all duration-200">
              <FileText size={20} className="text-gray-600" />
              <span className="text-sm">
                {formData.documents.marksheet
                  ? `Selected: ${formData.documents.marksheet.name}`
                  : "Last Marksheet"}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationStep;