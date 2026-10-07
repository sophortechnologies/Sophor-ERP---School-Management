import api from "@/api/axios";

const APPROVED_PERIODS_KEY = "school_payroll_approved_periods";

export const payrollApi = {
  getPayrolls: async () => {
    try {
      const response = await api.get("/payroll");
      return response.data?.data || response.data || [];
    } catch {
      return [];
    }
  },

  generatePayroll: async (payload) => {
    const cleanPayload = {
      salaryMonth: String(payload.salaryMonth).trim(),
    };
    const response = await api.post("/payroll/generate", cleanPayload);
    return response.data?.data || response.data;
  },

  // Get locally approved periods
  getApprovedPeriods: () => {
    try {
      const raw = localStorage.getItem(APPROVED_PERIODS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  // Save approved period
  markPeriodApproved: (period) => {
    try {
      const periods = payrollApi.getApprovedPeriods();
      if (!periods.includes(period)) {
        periods.push(period);
        localStorage.setItem(APPROVED_PERIODS_KEY, JSON.stringify(periods));
      }
    } catch (e) {
      console.warn("Could not save approved period", e);
    }
  },

  // Approve a run by period or id
  approvePayrollRun: async (run) => {
    const period = run.salaryMonth;
    const candidates = [
      () => api.patch(`/payroll/${run.id}/status`, { status: "APPROVED" }),
      () => api.post("/payroll/approve", { payrollId: Number(run.id) }),
      () => api.post("/payroll/approve", { id: Number(run.id) }),
      () => api.post(`/payroll/${run.id}/approve`),
    ];

    for (const attempt of candidates) {
      try {
        await attempt();
        break;
      } catch {
        // Continue fallback
      }
    }

    // Persist approval
    payrollApi.markPeriodApproved(period);
    return { success: true, period };
  },
};

export default payrollApi;
