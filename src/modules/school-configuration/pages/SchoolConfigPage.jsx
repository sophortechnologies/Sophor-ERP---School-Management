import React, { useState, useEffect } from "react";
import { useSchoolConfig } from "../hooks";
import { SchoolConfigForm } from "../components";
import Button from "@/shared/components/UI/Button";

export const SchoolConfigPage = () => {
  const { config: apiConfig, loading, error, updateConfig } = useSchoolConfig();

  // Fallback to localStorage so data never mysteriously vanishes across navigation/logouts
  const [persistedConfig, setPersistedConfig] = useState(() => {
    const saved = localStorage.getItem("school_configuration_cache");
    return saved ? JSON.parse(saved) : null;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Sync API config to state and local cache when fetched successfully
  useEffect(() => {
    if (apiConfig && apiConfig.schoolName) {
      setPersistedConfig(apiConfig);
      localStorage.setItem(
        "school_configuration_cache",
        JSON.stringify(apiConfig),
      );
    }
  }, [apiConfig]);

  const handleFormSubmit = async (formData) => {
    setFeedback({ type: "", message: "" });
    const result = await updateConfig(formData);

    if (result.success && result.data) {
      setPersistedConfig(result.data);
      localStorage.setItem(
        "school_configuration_cache",
        JSON.stringify(result.data),
      );
      setFeedback({
        type: "success",
        message: "School configuration saved permanently!",
      });
      setIsEditing(false);
    } else {
      setFeedback({
        type: "error",
        message: result.error || "Failed to save configuration.",
      });
    }
  };

  if (loading && !persistedConfig) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading saved school configuration...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          School Configuration
        </h1>

        {persistedConfig && !isEditing && (
          <Button
            onClick={() => {
              setIsEditing(true);
              setFeedback({ type: "", message: "" });
            }}
          >
            Edit Configuration
          </Button>
        )}
      </div>

      {feedback.message && (
        <div
          className={`mb-4 p-4 rounded-md text-sm font-medium ${
            feedback.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {error && !feedback.message && !persistedConfig && (
        <div className="mb-4 p-4 bg-red-50 text-red-800 border border-red-200 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
        {!isEditing && persistedConfig ? (
          <div className="space-y-4">
            <div className="border-b pb-3">
              <span className="text-sm font-semibold text-gray-500 block">
                School Name
              </span>
              <p className="text-lg font-medium text-gray-900">
                {persistedConfig.schoolName}
              </p>
            </div>
            <div className="border-b pb-3">
              <span className="text-sm font-semibold text-gray-500 block">
                Official Email
              </span>
              <p className="text-lg text-gray-900">{persistedConfig.email}</p>
            </div>
            <div className="border-b pb-3">
              <span className="text-sm font-semibold text-gray-500 block">
                Phone
              </span>
              <p className="text-lg text-gray-900">
                {persistedConfig.phone || "Not Set"}
              </p>
            </div>
            <div className="border-b pb-3">
              <span className="text-sm font-semibold text-gray-500 block">
                Address
              </span>
              <p className="text-lg text-gray-900">
                {persistedConfig.address || "Not Set"}
              </p>
            </div>
            <div className="border-b pb-3">
              <span className="text-sm font-semibold text-gray-500 block">
                Currency
              </span>
              <p className="text-lg text-gray-900">
                {persistedConfig.currency || "Not Set"}
              </p>
            </div>
            <div className="border-b pb-3">
              <span className="text-sm font-semibold text-gray-500 block">
                Academic Year
              </span>
              <p className="text-lg text-gray-900">
                {persistedConfig.academicYear || "Not Set"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pb-2">
              <div>
                <span className="text-sm font-semibold text-gray-500 block">
                  Start Date
                </span>
                <p className="text-md text-gray-900">
                  {persistedConfig.startDate || "Not Set"}
                </p>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-500 block">
                  End Date
                </span>
                <p className="text-md text-gray-900">
                  {persistedConfig.endDate || "Not Set"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-semibold text-gray-700">
                {persistedConfig
                  ? "Edit School Details"
                  : "Initialize School Configuration"}
              </h2>
              {persistedConfig && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Cancel
                </button>
              )}
            </div>
            <SchoolConfigForm
              initialData={persistedConfig}
              onSubmit={handleFormSubmit}
              loading={loading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolConfigPage;
