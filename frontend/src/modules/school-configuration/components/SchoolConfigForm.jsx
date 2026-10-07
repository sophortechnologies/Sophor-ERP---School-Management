import React, { useState, useEffect } from "react";
import Button from "@/shared/components/UI/Button";
import Input from "@/shared/components/UI/Input";

export const SchoolConfigForm = ({ initialData, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    schoolName: "",
    email: "",
    phone: "",
    address: "",
    currency: "",
    academicYear: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        schoolName: initialData.schoolName || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        currency: initialData.currency || "",
        academicYear: initialData.academicYear || "",
        startDate: initialData.startDate || "",
        endDate: initialData.endDate || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="School Name *"
        name="schoolName"
        value={formData.schoolName}
        onChange={handleChange}
        required
      />
      <Input
        label="Official Email *"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <Input
        label="Phone"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
      />
      <Input
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
      />
      <Input
        label="Currency (Max 3 chars, e.g., ETB, USD)"
        name="currency"
        maxLength={3}
        value={formData.currency}
        onChange={handleChange}
        required
      />
      <Input
        label="Academic Year (e.g., 2025/2026)"
        name="academicYear"
        value={formData.academicYear}
        onChange={handleChange}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start Date"
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          required
        />
        <Input
          label="End Date"
          name="endDate"
          type="date"
          value={formData.endDate}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </form>
  );
};
