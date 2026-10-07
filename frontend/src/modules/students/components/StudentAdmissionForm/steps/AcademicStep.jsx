import React, { useState, useEffect } from "react";
import { School } from "lucide-react";
import { studentAPI } from "../../../api"; // Make sure to import the API

const AcademicStep = ({ 
  formData, 
  errors, 
  handleChange, 
  academicSessions, 
  classes, 
  sections, 
  loadingClasses, 
  loadingSections 
}) => {
  const [filteredSections, setFilteredSections] = useState([]);
  const [sectionLoading, setSectionLoading] = useState(false);

  // Fetch sections for the selected class
  useEffect(() => {
    const fetchSectionsForClass = async () => {
      if (!formData.academicInfo.className) {
        setFilteredSections([]);
        return;
      }
      
      setSectionLoading(true);
      try {
        // Use the correct API endpoint to get sections by class
        const response = await studentAPI.getSectionsByClass(formData.academicInfo.className);
        console.log("Fetched sections for class:", formData.academicInfo.className, response);
        
        if (response.success && response.data.length > 0) {
          setFilteredSections(response.data);
        } else {
          // Fallback to all sections if no specific sections found for class
          setFilteredSections(sections);
        }
      } catch (error) {
        console.error("Error fetching sections for class:", error);
        // Fallback to all sections
        setFilteredSections(sections);
      } finally {
        setSectionLoading(false);
      }
    };

    fetchSectionsForClass();
  }, [formData.academicInfo.className, sections]);

  // Reset section when class changes
  useEffect(() => {
    if (formData.academicInfo.className && formData.academicInfo.section) {
      // Clear section if class changes
      handleChange("academicInfo", "section", "");
    }
  }, [formData.academicInfo.className]);

  return (
    <div className="mb-6">
      <div className="sticky -top-px z-20 bg-white -mx-6 px-6 pt-4 pb-2 border-b-2 border-gray-100 mb-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-primary mb-2">
          <School size={20} />
          <h3>Academic Information</h3>
        </div>
      </div>

      {(loadingClasses || loadingSections) && (
        <p className="text-sm text-gray-500 mb-4">Loading classes and sections...</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Session - REQUIRED */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-secondary mb-2">Academic Session *</label>
          <select
            value={formData.academicInfo.academicSession}
            onChange={(e) =>
              handleChange("academicInfo", "academicSession", e.target.value)
            }
            className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white ${
              errors["academicInfo.academicSession"] ? "border-[#ef4444]" : "border-gray-300"
            }`}
            required
          >
            <option value="">Select session</option>
            {academicSessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name} {session.isActive && "(Current)"}
              </option>
            ))}
          </select>
          {errors["academicInfo.academicSession"] && (
            <p className="text-xs text-[#ef4444] mt-1">{errors["academicInfo.academicSession"]}</p>
          )}
        </div>

        {/* Class - Required */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-secondary mb-2">Class *</label>
          <select
            value={formData.academicInfo.className || ""}
            onChange={(e) =>
              handleChange("academicInfo", "className", e.target.value)
            }
            disabled={loadingClasses}
            className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white ${
              errors["academicInfo.className"] ? "border-[#ef4444]" : "border-gray-300"
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            required
          >
            <option value="">Select class</option>
            {loadingClasses ? (
              <option value="" disabled>Loading classes...</option>
            ) : classes.length === 0 ? (
              <option value="" disabled>No classes available</option>
            ) : (
              classes.map((cls) => (
                <option key={cls.id || cls._id || cls} value={cls.id || cls._id || cls}>
                  {cls.name || cls.className || cls.grade || `Class ${cls.id}`}
                </option>
              ))
            )}
          </select>
          {errors["academicInfo.className"] && (
            <p className="text-xs text-[#ef4444] mt-1">{errors["academicInfo.className"]}</p>
          )}
        </div>


{/* Section - Required, filtered by class */}
<div className="flex flex-col">
  <label className="text-sm font-medium text-secondary mb-2">Section *</label>
  <select
    value={formData.academicInfo.section || ""}
    onChange={(e) =>
      handleChange("academicInfo", "section", e.target.value)
    }
    disabled={!formData.academicInfo.className}
    className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white ${
      errors["academicInfo.section"] ? "border-[#ef4444]" : "border-gray-300"
    } disabled:bg-gray-100 disabled:cursor-not-allowed`}
    required
  >
    <option value="">Select section</option>
    {!formData.academicInfo.className ? (
      <option value="" disabled>Select class first</option>
    ) : (
      // Show ALL sections as fallback
      sections.map((sec) => (
        <option key={sec.id || sec._id || sec} value={sec.id || sec._id || sec}>
          {sec.name || sec.sectionName || sec.code || `Section ${sec.id}`}
        </option>
      ))
    )}
  </select>
  {errors["academicInfo.section"] && (
    <p className="text-xs text-[#ef4444] mt-1">{errors["academicInfo.section"]}</p>
  )}
  <p className="text-xs text-gray-500 mt-1">Showing all available sections</p>
</div>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Admission category defaults to General, and admission date and roll number are assigned automatically by the system — none of these are collected here.
      </p>
    </div>
  );
};

export default AcademicStep;