import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";
import Navbar from "../components/Navbar";

function History() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/analysis/history`, { headers: { Authorization: `Bearer ${token}` } });
        setAnalyses(response.data.analyses || []);
      } catch (error) {
        console.error("Could not fetch analysis history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleDelete = async (analysisId) => {
    const confirmed = window.confirm("Are you sure you want to remove this analysis?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/analysis/${analysisId}`, { headers: { Authorization: `Bearer ${token}` } });
      setAnalyses((previous) => previous.filter((item) => item.id !== analysisId));
      setOpenMenu(null);
    } catch (error) {
      console.error("Could not delete analysis:", error);
      alert("Could not remove this analysis.");
    }
  };

  return (
    <div className="app">
      <Navbar />

      <main className="history-page">
        <div className="history-container">

          <div className="history-header">
            <div>
              <h1>Analysis History</h1>
              <p className="history-description">View your previous resume analyses and scores.</p>
            </div>
            <Link to="/upload" className="dashboard-analyze-btn">Analyze Resume →</Link>
          </div>

          {!loading && <p className="history-description">Total analyses: {analyses.length}</p>}

          {loading && (
            <div className="history-status-card">
              <div className="history-spinner"></div>
              <h3>Loading history...</h3>
              <p>Please wait while we fetch your analyses.</p>
            </div>
          )}

          {!loading && analyses.length === 0 && (
            <div className="history-status-card">
              <h3>No analyses yet</h3>
              <p>Upload your resume to get your first analysis.</p>
              <Link to="/upload" className="form-btn">Analyze Resume →</Link>
            </div>
          )}

          {!loading && analyses.length > 0 && (
            <div className="history-grid">
              {analyses.map((item) => {
                const score = Number(item.overall_score) || 0;
                const fileName = item.file_name || "Resume";
                const fileType = fileName.toLowerCase().endsWith(".pdf") ? "PDF" : "DOCX";

                return (
                  <div className="history-analysis-card" key={item.id}>
                    <div className="history-card-top">
                      <div className="history-file">
                        <div className="pdf-icon">{fileType}</div>
                        <div className="history-file-info">
                          <h3>{fileName}</h3>
                          <span>{item.job_role || "General Resume"}</span>
                        </div>
                      </div>

                      <div className="history-menu-wrapper">
                        <button className="history-menu" onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}>•••</button>
                        {openMenu === item.id && (
                          <div className="history-dropdown">
                            <button onClick={() => handleDelete(item.id)}>Remove Analysis</button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="history-divider"></div>

                    <div className="history-middle">
                      <div className="history-score-box">
                        <div className="history-score-ring" style={{ "--history-score": `${score * 3.6}deg` }}>
                          <div className="history-score-inner">
                            <strong>{score}</strong>
                          </div>
                        </div>
                        <div className="history-score-text">
                          <strong>ATS Score</strong>
                          <span>/100</span>
                        </div>
                      </div>

                      <div className="history-role">
                        <div>
                          <span>Analysis Date</span>
                          <strong>{item.created_at ? new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Date unavailable"}</strong>
                        </div>
                      </div>
                    </div>

                    <button className="history-view-btn" onClick={() => navigate(`/results/${item.id}`)}>View Analysis →</button>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default History;