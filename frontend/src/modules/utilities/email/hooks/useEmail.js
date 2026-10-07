import { useState, useEffect, useCallback } from "react";
import { emailApi } from "../api/email.api";

export const useEmail = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    try {
      const data = await emailApi.getEmails();
      setEmails(data);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load email history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const sendNewEmail = async (emailData) => {
    try {
      await emailApi.sendEmail(emailData);
      await fetchEmails();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err?.response?.data?.message || "Failed to send email",
      };
    }
  };

  return { emails, loading, error, sendNewEmail, refreshEmails: fetchEmails };
};
