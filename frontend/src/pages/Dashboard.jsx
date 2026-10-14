import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../App.css";
import Navbar from "../components/Navbar";

function Dashboard() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/analysis/history`, { headers: { Authorization: `Bearer ${token}` } });
        setAnalyses(response.data.analyses || []);
      } catch (error) {
        console.error("Could not fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const scores = analyses.map((item) => Number(item.overall_score)).filter((score) => score > 0);
  const latestScore = scores.length > 0 ? scores[0] : 0;
  const averageScore = scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

  const handleViewResume = async (resumeId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/resume/${resumeId}/file`, { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" });
      const fileURL = URL.createObjectURL(response.data);
      window.open(fileURL, "_blank");
      setTimeout(() => URL.revokeObjectURL(fileURL), 60000);
    } catch (error) {
      console.error("Could not open resume:", error);
      alert("Could not open resume.");
    }
  };

  const handleDownloadResume = async (resumeId, fileName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/resume/${resumeId}/file`, { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" });
      const fileURL = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = fileName || "Resume";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(fileURL), 1000);
    } catch (error) {
      console.error("Could not download resume:", error);
      alert("Could not download resume.");
    }
  };

  return (
    <div className="app">
      <Navbar />
      <main className="dashboard-page">
        <div className="dashboard-container">

          {/* Dashboard Header */}
          <div className="dashboard-header">
            <div>
              <h1>Your Dashboard</h1>
              <p className="dashboard-description">View your resume scores and recent analyses.</p>
            </div>
            <Link to="/upload" className="dashboard-analyze-btn">Analyze Resume →</Link>
          </div>

          {loading ? (
            <div className="dashboard-status-card">
              <div className="history-spinner"></div>
              <h3>Loading dashboard...</h3>
              <p>Please wait while we fetch your analyses.</p>
            </div>
          ) : (
            <>
              {/* Dashboard Statistics */}
              <div className="dashboard-stats-grid">
                <div className="dashboard-stat-card">
                  <div className="dashboard-stat-icon">📄</div>
                  <span>Total Analyses</span>
                  <strong>{analyses.length}</strong>
                  <small>Resumes analyzed</small>
                </div>

                <div className="dashboard-stat-card">
                  <div className="dashboard-stat-icon">📊</div>
                  <span>Latest ATS Score</span>
                  <strong>{latestScore}<small className="score-small">/100</small></strong>
                  <small>Most recent analysis</small>
                </div>

                <div className="dashboard-stat-card">
                  <div className="dashboard-stat-icon">📈</div>
                  <span>Average ATS Score</span>
                  <strong>{averageScore}<small className="score-small">/100</small></strong>
                  <small>Across your analyses</small>
                </div>

                <div className="dashboard-stat-card">
                  <div className="dashboard-stat-icon">🏆</div>
                  <span>Best ATS Score</span>
                  <strong>{bestScore}<small className="score-small">/100</small></strong>
                  <small>Your highest score</small>
                </div>
              </div>

              {/* Recent Analyses */}
              <section className="dashboard-section">
                <div className="dashboard-section-header">
                  <div>
                    <h2>Recent Analyses</h2>
                    <p className="dashboard-description">Your latest resume results.</p>
                  </div>
                  <Link to="/history" className="dashboard-history-link">View All →</Link>
                </div>

                {analyses.length === 0 ? (
                  <div className="dashboard-empty-card">
                    <div className="dashboard-empty-icon">📄</div>
                    <h3>No analyses yet</h3>
                    <p>You haven't analyzed a resume yet. Upload one to get started.</p>
                    <Link to="/upload" className="form-btn">Analyze Resume →</Link>
                  </div>
                ) : (
                  <div className="dashboard-recent-grid">
                    {analyses.slice(0, 4).map((item) => {
                      const score = Number(item.overall_score) || 0;
                      const fileName = item.file_name || "Resume";
                      const fileType = fileName.toLowerCase().endsWith(".pdf") ? "PDF" : "DOCX";

                      return (
                        <div className="dashboard-recent-card" key={item.id}>
                          <div className="dashboard-recent-top">
                            <div className="dashboard-file-icon">{fileType}</div>
                            <div className="dashboard-recent-info">
                              <h3>{fileName}</h3>
                              <span>{item.job_role || "General Resume"}</span>
                            </div>
                          </div>

                          <div className="dashboard-recent-bottom">
                            <div>
                              <span>ATS Score</span>
                              <strong>{score}<small>/100</small></strong>
                            </div>
                            <div className="dashboard-date">{item.created_at ? new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Date unavailable"}</div>
                          </div>

                          <Link to={`/results/${item.id}`} className="dashboard-view-btn">View Analysis →</Link>

                          <div className="resume-action-buttons">
                            <button className="resume-secondary-btn" onClick={() => handleViewResume(item.resume_id)}>View Resume</button>
                            <button className="resume-secondary-btn" onClick={() => handleDownloadResume(item.resume_id, fileName)}>Download</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Bottom Section */}
              <div className="dashboard-cta">
                <div>
                  <h2>Want to improve your resume?</h2>
                  <p>Upload your latest resume to review your ATS score and find areas for improvement.</p>
                </div>
                <Link to="/upload" className="dashboard-cta-btn">Analyze Resume →</Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;