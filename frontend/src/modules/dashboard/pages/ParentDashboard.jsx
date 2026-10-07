import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../../store/slices/authSlice";
import { LogOut, Users, Award, Calendar, DollarSign } from "lucide-react";

const ParentDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-sidebar sidebar-open">
        <div className="sidebar-content-container">
          <div className="sidebar-header">
            <div className="logo">
              <div className="logo-placeholder">🏫</div>
              <span className="logo-text">SophorERP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-1">Parent Dashboard</h1>
              <p className="body-small">
                Welcome back, {user?.name || "Parent"}
              </p>
            </div>
            <button
              className="btn btn-danger flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">2</div>
              <div className="stat-label">Children</div>
              <div className="stat-trend">Both active</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">95%</div>
              <div className="stat-label">Overall Attendance</div>
              <div className="stat-trend">Good</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">$450</div>
              <div className="stat-label">Fees Due</div>
              <div className="stat-trend">Due in 15 days</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">87.5%</div>
              <div className="stat-label">Average Performance</div>
              <div className="stat-trend">+3.2%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Children Progress</h3>
              </div>
              <div className="card-body">
                <p>Abrha Hailu - Grade 10: 92%</p>
                <p>Meron Hailu - Grade 8: 85%</p>
                <p>Overall: Good performance</p>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Quick Actions</h3>
              </div>
              <div className="card-body">
                <div className="space-y-2">
                  <button className="btn btn-primary w-full justify-start">
                    <Users size={16} />
                    View Progress
                  </button>
                  <button className="btn btn-primary w-full justify-start">
                    <DollarSign size={16} />
                    Pay Fees
                  </button>
                  <button className="btn btn-primary w-full justify-start">
                    <Calendar size={16} />
                    View Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ParentDashboard;
