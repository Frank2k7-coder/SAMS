import React, { useState } from "react";
import "./Reports.css";

function Reports() {
  const [reports, setReports] = useState([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Bug");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newReport = {
      id: Date.now(),
      title,
      type,
      priority,
      description,
      status: "Open",
      date: new Date().toLocaleString(),
    };
    setReports([newReport, ...reports]);
    setTitle("");
    setDescription("");
  };

  const handleDelete = (id) => {
    setReports(reports.filter((r) => r.id !== id));
  };

  const handleStatusChange = (id, newStatus) => {
    setReports(
      reports.map((r) =>
        r.id === id ? { ...r, status: newStatus } : r
      )
    );
  };

  // Search & filter logic
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(search.toLowerCase()) ||
      report.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "All" ? true : report.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="reports-page">
      <h1>Report System</h1>

      <form className="report-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Report Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter report title"
            required
          />
        </div>

        <div className="form-group">
          <label>Report Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="Bug">Bug</option>
            <option value="Feedback">Feedback</option>
            <option value="Request">Request</option>
          </select>
        </div>

        <div className="form-group">
          <label>Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter report details"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Submit Report
        </button>
      </form>

      <h2>Submitted Reports</h2>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search reports..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <div className="reports-list">
        {filteredReports.length === 0 ? (
          <p>No reports found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td>{report.title}</td>
                  <td>{report.type}</td>
                  <td>{report.priority}</td>
                  <td>
                    <select
                      value={report.status}
                      onChange={(e) =>
                        handleStatusChange(report.id, e.target.value)
                      }
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                  <td>{report.date}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(report.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Reports;
