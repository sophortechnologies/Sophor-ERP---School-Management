import React from "react";
import { User, Upload } from "lucide-react";
import { GENDERS } from "../../../constants/formConstants";

const PersonalInfoStep = ({
  formData,
  errors,
  handleChange,
  handleFileInputChange,
}) => {
  return (
    <div className="mb-6">
      <div className="sticky -top-px z-20 bg-white -mx-6 px-6 pt-4 pb-2 border-b-2 border-gray-100 mb-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-primary mb-2">
          <User size={20} />
          <h3>Personal Information</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-secondary mb-2">First Name *</label>
          <input
            type="text"
            value={formData.personalInfo.firstName}
            onChange={(e) =>
              handleChange("personalInfo", "firstName", e.target.value)
            }
            className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white ${
              errors["personalInfo.firstName"] ? "border-[#ef4444]" : "border-gray-300"
            }`}
            placeholder="Enter first name"
            maxLength="50"
          />
          {errors["personalInfo.firstName"] && (
            <p className="text-xs text-[#ef4444] mt-1">{errors["personalInfo.firstName"]}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-secondary mb-2">Last Name *</label>
          <input
            type="text"
            value={formData.personalInfo.lastName}
            onChange={(e) =>
              handleChange("personalInfo", "lastName", e.target.value)
            }
            className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white ${
              errors["personalInfo.lastName"] ? "border-[#ef4444]" : "border-gray-300"
            }`}
            placeholder="Enter last name"
            maxLength="50"
          />
          {errors["personalInfo.lastName"] && (
            <p className="text-xs text-[#ef4444] mt-1">{errors["personalInfo.lastName"]}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-secondary mb-2">Date of Birth *</label>
          <input
            type="date"
            value={formData.personalInfo.dateOfBirth}
            onChange={(e) =>
              handleChange("personalInfo", "dateOfBirth", e.target.value)
            }
            className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white ${
              errors["personalInfo.dateOfBirth"] ? "border-[#ef4444]" : "border-gray-300"
            }`}
          />
          {errors["personalInfo.dateOfBirth"] && (
            <p className="text-xs text-[#ef4444] mt-1">{errors["personalInfo.dateOfBirth"]}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-secondary mb-2">Gender *</label>
          <select
            value={formData.personalInfo.gender}
            onChange={(e) =>
              handleChange("personalInfo", "gender", e.target.value)
            }
            className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white ${
              errors["personalInfo.gender"] ? "border-[#ef4444]" : "border-gray-300"
            }`}
          >
            <option value="">Select gender</option>
            {GENDERS.map((gender) => (
              <option key={gender} value={gender}>
                {gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          {errors["personalInfo.gender"] && (
            <p className="text-xs text-[#ef4444] mt-1">{errors["personalInfo.gender"]}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-secondary mb-2">Nationality *</label>
          <input
            type="text"
            value={formData.personalInfo.nationality || ""}
            onChange={(e) =>
              handleChange("personalInfo", "nationality", e.target.value)
            }
            className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white ${
              errors["personalInfo.nationality"] ? "border-[#ef4444]" : "border-gray-300"
            }`}
            placeholder="e.g., Ethiopian"
            required
          />
          {errors["personalInfo.nationality"] && (
            <p className="text-xs text-[#ef4444] mt-1">{errors["personalInfo.nationality"]}</p>
          )}
          <small className="text-xs text-gray-500 mt-1">Enter your nationality (e.g., Ethiopian)</small>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-secondary mb-2">Phone *</label>
          <div className="flex">
            <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-lg">
              +251
            </span>
            <input
              type="tel"
              value={formData.personalInfo.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 9);
                handleChange("personalInfo", "phone", value);
              }}
              className={`flex-1 px-3 py-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white ${
                errors["personalInfo.phone"] ? "border-[#ef4444]" : "border-gray-300"
              }`}
              placeholder="9XXXXXXX"
              maxLength="9"
            />
          </div>
          {errors["personalInfo.phone"] && (
            <p className="text-xs text-[#ef4444] mt-1">{errors["personalInfo.phone"]}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-secondary mb-2">Email</label>
          <input
            type="email"
            value={formData.personalInfo.email}
            onChange={(e) =>
              handleChange("personalInfo", "email", e.target.value)
            }
            className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white ${
              errors["personalInfo.email"] ? "border-[#ef4444]" : "border-gray-300"
            }`}
            placeholder="student@email.com"
          />
          {errors["personalInfo.email"] && (
            <p className="text-xs text-[#ef4444] mt-1">{errors["personalInfo.email"]}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-secondary mb-2">National ID / Identification Number</label>
          <input
            type="text"
            value={formData.personalInfo.identificationNumber || ""}
            onChange={(e) =>
              handleChange("personalInfo", "identificationNumber", e.target.value)
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white"
            placeholder="Optional"
          />
        </div>

        <div className="col-span-full flex flex-col">
          <label className="text-sm font-medium text-secondary mb-2">Address</label>
          <textarea
            value={formData.personalInfo.address}
            onChange={(e) =>
              handleChange("personalInfo", "address", e.target.value)
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white"
            placeholder="Enter complete address"
            rows="3"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-secondary mb-2">City</label>
          <input
            type="text"
            value={formData.personalInfo.city}
            onChange={(e) =>
              handleChange("personalInfo", "city", e.target.value)
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white"
            placeholder="City"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-secondary mb-2">State</label>
          <input
            type="text"
            value={formData.personalInfo.state}
            onChange={(e) =>
              handleChange("personalInfo", "state", e.target.value)
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white"
            placeholder="State"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-secondary mb-2">Pincode</label>
          <input
            type="text"
            value={formData.personalInfo.pincode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              handleChange("personalInfo", "pincode", value);
            }}
            className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all duration-200 bg-white ${
              errors["personalInfo.pincode"] ? "border-[#ef4444]" : "border-gray-300"
            }`}
            placeholder="6-digit pincode"
            maxLength="6"
          />
          {errors["personalInfo.pincode"] && (
            <p className="text-xs text-[#ef4444] mt-1">{errors["personalInfo.pincode"]}</p>
          )}
        </div>
      </div>

      {/* Optional: Profile Photo Upload */}
      <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h4 className="text-base font-semibold text-secondary mb-4">Profile Photo (Optional)</h4>
        <div className="flex flex-col max-w-md">
          <input
            type="file"
            id="photo"
            accept=".jpg,.jpeg,.png"
            onChange={(e) => handleFileInputChange("photo", e)}
            className="hidden"
          />
          <label htmlFor="photo" className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-blue-50 transition-all duration-200">
            <Upload size={20} className="text-gray-600" />
            <span className="text-sm">
              {formData.documents.photo
                ? `Selected: ${formData.documents.photo.name}`
                : "Upload Profile Photo"}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;