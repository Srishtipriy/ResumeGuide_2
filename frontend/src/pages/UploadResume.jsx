import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";
import Navbar from "../components/Navbar";

function UploadResume() {
  const [file, setFile] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select your resume.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("resume", file);

      const upload = await axios.post(`${import.meta.env.VITE_API_URL}/api/resume/upload`, formData, { headers: { Authorization: `Bearer ${token}` } });
      const resumeId = upload.data.resumeId;

      if (!resumeId) {
        alert("Resume ID was not received.");
        return;
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/resume/analyze`, { resumeId, jobRole: jobRole || null, jobDescription: jobDescription || null }, { headers: { Authorization: `Bearer ${token}` } });

      navigate("/results", { state: { analysis: response.data.analysis, analysisId: response.data.analysisId } });
    } catch (error) {
      console.error("Resume analysis error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Navbar />
      <main className="upload-page">
        <div className="upload-container">
          <div className="upload-heading">
            <h1>Make Your Resume <span>Job Ready.</span></h1>
            <p className="form-description">Upload your resume and optionally add your target job details.</p>
          </div>

          <div className="upload-card">
            <form onSubmit={handleSubmit}>
              <label className="upload-box">
                <div className="upload-icon">↑</div>
                <h3>{file ? file.name : "Upload your resume"}</h3>
                <p>PDF, DOC or DOCX</p>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} hidden />
                <span className="choose-file">Choose File</span>
              </label>

              <div className="input-group">
                <label>Target Job Role <span>(Optional)</span></label>
                <input type="text" placeholder="e.g. Software Developer" value={jobRole} onChange={(e) => setJobRole(e.target.value)} />
              </div>

              <div className="input-group">
                <label>Job Description <span>(Optional)</span></label>
                <textarea rows="5" placeholder="Paste the job description here..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
              </div>

              <button type="submit" className="form-btn" disabled={loading}>{loading ? "Analyzing..." : "Analyze My Resume →"}</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UploadResume;