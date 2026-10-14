import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";
import Navbar from "../components/Navbar";

function ScoreRing({ title, score }) {
  const value = Number(score) || 0;

  return (
    <div className="score-card">
      <p>{title}</p>
      <div className="score-ring" style={{ "--score": `${value * 3.6}deg` }}>
        <div className="score-ring-inner"><strong>{value}</strong><span>/100</span></div>
      </div>
    </div>
  );
}

function Results() {
  const { id } = useParams();
  const location = useLocation();
  const [oldAnalysis, setOldAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analysis = id ? oldAnalysis : location.state?.analysis;
  const analysisId = id || location.state?.analysisId;

  useEffect(() => {
    if (!id) return;

    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/analysis/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setOldAnalysis(response.data.analysis);
      } catch (error) {
        console.error("Could not fetch analysis:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  if (loading) {
    return <div className="app"><Navbar /><main className="results-page"><div className="results-container"><div className="results-card"><h2>Loading analysis...</h2><p>Please wait.</p></div></div></main></div>;
  }

  if (!analysis) {
    return <div className="app"><Navbar /><main className="results-page"><div className="results-container"><div className="results-card"><h2>No analysis found</h2><p>Please analyze your resume again.</p><Link to="/upload" className="form-btn">Analyze Resume →</Link></div></div></main></div>;
  }

  if (typeof analysis !== "object") {
    return <div className="app"><Navbar /><main className="results-page"><div className="results-container"><div className="results-heading"><h1>Your Resume Analysis</h1></div><div className="results-card"><h2>AI Resume Feedback</h2>{analysisId && <p>Analysis #{analysisId}</p>}<div className="analysis-text">{analysis}</div></div></div></main></div>;
  }

  const scores = analysis.scores || {};
  const jobMatch = analysis.jobMatch;

  return (
    <div className="app">
      <Navbar />
      <main className="results-page">
        <div className="results-container">

          <div className="results-heading">
            <h1>Resume Analysis</h1>
            <p className="form-description">{analysis.summary || "Review your resume scores and suggested improvements."}</p>
          </div>

          {analysis.targetRole && <div className="target-role-card"><div><span>Target Role</span><h2>{analysis.targetRole}</h2></div></div>}

          <div className="score-grid">
            <ScoreRing title="ATS Score" score={scores.ats} />
            <ScoreRing title="Content Score" score={scores.content} />
            <ScoreRing title="Skills Score" score={scores.skills} />
          </div>

          {jobMatch && (
            <section className="result-section">
              <h2>Job Match Analysis</h2>
              <p><strong>Match Score:</strong> {Number(jobMatch.score) || 0}%</p>

              <h3>Matched Skills</h3>
              <div className="skills-list">
                {jobMatch.matchedSkills?.length ? jobMatch.matchedSkills.map((skill, index) => <span className="skill-pill" key={index}>{skill}</span>) : <p className="empty-text">No matched skills found.</p>}
              </div>

              <h3>Skills You Can Learn</h3>
              <div className="skills-list">
                {jobMatch.skillsYouCanLearn?.length ? jobMatch.skillsYouCanLearn.map((skill, index) => <span className="learn-pill" key={index}>+ {skill}</span>) : <p className="empty-text">No additional skills recommended.</p>}
              </div>

              {jobMatch.suggestions?.length > 0 && <><h3>Job-Specific Suggestions</h3>{jobMatch.suggestions.map((item, index) => <div className="result-list-item" key={index}><p>{item}</p></div>)}</>}
            </section>
          )}

          <section className="result-section">
            <h2>Detected Skills</h2>
            <div className="skills-list">
              {analysis.detectedSkills?.length ? analysis.detectedSkills.map((skill, index) => <span className="skill-pill" key={index}>{skill}</span>) : <p className="empty-text">No skills detected.</p>}
            </div>
          </section>

          <section className="result-section">
            <h2>Skills You Can Learn</h2>
            <p className="section-description">Recommended skills that may strengthen your resume.</p>
            <div className="skills-list">
              {analysis.skillsYouCanLearn?.length ? analysis.skillsYouCanLearn.map((skill, index) => <span className="learn-pill" key={index}>+ {skill}</span>) : <p className="empty-text">No additional skills recommended.</p>}
            </div>
          </section>

          <section className="result-section">
            <h2>Strengths</h2>
            {analysis.strengths?.length ? analysis.strengths.map((item, index) => <div className="result-list-item" key={index}><span>✓</span><p>{item}</p></div>) : <p className="empty-text">No strengths returned.</p>}
          </section>

          <section className="result-section">
            <h2>Formatting & Layout Improvements</h2>
            {analysis.formattingImprovements?.length ? analysis.formattingImprovements.map((item, index) => <div className="result-list-item" key={index}><span>→</span><p>{item}</p></div>) : <p className="empty-text">No formatting improvements returned.</p>}
          </section>

          <section className="result-section">
            <h2>Content Improvements</h2>
            {analysis.contentImprovements?.length ? analysis.contentImprovements.map((item, index) => (
              <div className="content-improvement-card" key={index}>
                <h3>{item.section}</h3>
                <div className="content-improvement-block"><strong>Current</strong><p>{item.current}</p></div>
                <div className="content-improvement-block suggested"><strong>Suggested</strong><p>{item.suggested}</p></div>
                <div className="content-improvement-reason"><strong>Why</strong><p>{item.reason}</p></div>
              </div>
            )) : <p className="empty-text">No content improvements returned.</p>}
          </section>

          <section className="result-section">
            <h2>Additional Suggestions</h2>
            {analysis.suggestions?.length ? analysis.suggestions.map((item, index) => <div className="result-list-item" key={index}><span>→</span><p>{item}</p></div>) : <p className="empty-text">No additional suggestions.</p>}
          </section>

          <div className="results-footer">
            <Link to="/upload" className="form-btn">Analyze Another Resume →</Link>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Results;
