import React from "react";
import { Users } from "lucide-react";

// NOTE: The backend's Student model (and CreateStudentDto) only stores ONE
// flat guardian record — guardianName/Phone/Email/Relation/Occupation/Address.
// There is no separate father/mother storage on the admission endpoint, so
// this step intentionally only collects a single "Primary Guardian." An
// earlier version of this step also had separate Father's/Mother's
// Information sections, but whichever parent wasn't picked as the primary
// guardian had their data silently discarded on submit — it was never sent
// anywhere. If the backend later adds real multi-guardian support, this step
// can be extended again to match.
const GuardianInfoStep = ({ formData, errors, handleChange }) => {
  return (
    <div className="mb-6">
      <div className="sticky -top-px z-20 bg-white -mx-6 px-6 pt-4 pb-2 border-b-2 border-gray-100 mb-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-primary mb-2">
          <Users size={20} />
          <h3>Guardian Information</h3>
        </div>
        <p className="text-sm text-gray-600">
          Provide details for the student's primary guardian (Father, Mother, or Guardian)
        </p>
      </div>

      <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h4 className="text-base font-semibold text-secondary mb-4">Primary Guardian</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-secondary mb-2">Guardian's Name *</label>
            <input
              type="text"
              value={formData.guardianInfo.guardianName || ""}
              onChange={(e) =>
                handleChange("guardianInfo", "guardianName", e.target.value)
              }
              className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white ${
                errors["guardianInfo.guardianName"] ? "border-[#ef4444]" : "border-gray-300"
              }`}
              placeholder="Full name"
              maxLength="100"
            />
            {errors["guardianInfo.guardianName"] && (
              <p className="text-xs text-[#ef4444] mt-1">{errors["guardianInfo.guardianName"]}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-secondary mb-2">Relation *</label>
            <select
              value={formData.guardianInfo.guardianRelation || ""}
              onChange={(e) =>
                handleChange("guardianInfo", "guardianRelation", e.target.value)
              }
              className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white ${
                errors["guardianInfo.guardianRelation"] ? "border-[#ef4444]" : "border-gray-300"
              }`}
            >
              <option value="">Select relation</option>
              <option value="FATHER">Father</option>
              <option value="MOTHER">Mother</option>
              <option value="GUARDIAN">Guardian</option>
              <option value="OTHER">Other</option>
            </select>
            {errors["guardianInfo.guardianRelation"] && (
              <p className="text-xs text-[#ef4444] mt-1">{errors["guardianInfo.guardianRelation"]}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-secondary mb-2">Phone *</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-lg">
                +251
              </span>
              <input
                type="tel"
                value={formData.guardianInfo.guardianPhone || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 9);
                  handleChange("guardianInfo", "guardianPhone", value);
                }}
                className={`flex-1 px-3 py-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white ${
                  errors["guardianInfo.guardianPhone"] ? "border-[#ef4444]" : "border-gray-300"
                }`}
                placeholder="9XXXXXXX"
                maxLength="9"
              />
            </div>
            {errors["guardianInfo.guardianPhone"] && (
              <p className="text-xs text-[#ef4444] mt-1">{errors["guardianInfo.guardianPhone"]}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-secondary mb-2">Email</label>
            <input
              type="email"
              value={formData.guardianInfo.guardianEmail || ""}
              onChange={(e) =>
                handleChange("guardianInfo", "guardianEmail", e.target.value)
              }
              className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white ${
                errors["guardianInfo.guardianEmail"] ? "border-[#ef4444]" : "border-gray-300"
              }`}
              placeholder="Email address"
            />
            {errors["guardianInfo.guardianEmail"] && (
              <p className="text-xs text-[#ef4444] mt-1">{errors["guardianInfo.guardianEmail"]}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-secondary mb-2">Occupation</label>
            <input
              type="text"
              value={formData.guardianInfo.guardianOccupation || ""}
              onChange={(e) =>
                handleChange("guardianInfo", "guardianOccupation", e.target.value)
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white"
              placeholder="Occupation"
            />
          </div>

          <div className="col-span-full flex flex-col">
            <label className="text-sm font-medium text-secondary mb-2">Guardian Address</label>
            <textarea
              value={formData.guardianInfo.guardianAddress || ""}
              onChange={(e) =>
                handleChange("guardianInfo", "guardianAddress", e.target.value)
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white"
              placeholder="Leave blank to use the student's address"
              rows="2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuardianInfoStep;
