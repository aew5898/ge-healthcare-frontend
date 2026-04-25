import { useState, useEffect } from "react";
import "./App.css";
import geLogo from "./assets/GE_HealthCare_logo_2023.png";

const API_BASE = "https://your-middleware-server/api"; // update to your actual middleware URL

function AddRecordModal({ onClose, onSuccess, equipmentTypes, locations }) {
  const [form, setForm] = useState({
    Equipment_Type: "",
    Location: "",
    Technician: "",
    Last_Repaired: "",
    Notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { Equipment_Type, Location, Technician, Last_Repaired, Notes } = form;
    if (!Equipment_Type || !Location || !Technician || !Last_Repaired || !Notes) {
      setFormError("All fields are required.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch(`${API_BASE}/equipment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.status === "success") {
        onSuccess(data.new_record_id);
      } else {
        setFormError(data.message || "Failed to add record.");
      }
    } catch (err) {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Add New Record</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Equipment Type</label>
            <input
              list="eq-type-list"
              name="Equipment_Type"
              value={form.Equipment_Type}
              onChange={handleChange}
              placeholder="e.g. MRI Scanner"
              className="form-input"
            />
            <datalist id="eq-type-list">
              {equipmentTypes.map((t) => <option key={t} value={t} />)}
            </datalist>
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              list="loc-list"
              name="Location"
              value={form.Location}
              onChange={handleChange}
              placeholder="e.g. Ward 3B"
              className="form-input"
            />
            <datalist id="loc-list">
              {locations.map((l) => <option key={l} value={l} />)}
            </datalist>
          </div>

          <div className="form-group">
            <label>Technician</label>
            <input
              name="Technician"
              value={form.Technician}
              onChange={handleChange}
              placeholder="Full name"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Last Repaired</label>
            <input
              type="date"
              name="Last_Repaired"
              value={form.Last_Repaired}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="Notes"
              value={form.Notes}
              onChange={handleChange}
              placeholder="Describe the maintenance performed..."
              className="form-input form-textarea"
              rows={3}
            />
          </div>

          {formError && <p className="form-error">{formError}</p>}
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className="submit-btn" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : "Save Record"}
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchData = () => {
    setLoading(true);
    fetch(`${API_BASE}/equipment`)
      .then((res) => res.json())
      .then((data) => {
        setEquipment(data.equipment);
        setLoading(false);
      })
      .catch(() => {
        setError("Error loading data.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const total = equipment.length;

  const mostRecent =
    equipment.length > 0
      ? equipment.reduce((latest, item) =>
          new Date(item.Last_Repaired) > new Date(latest)
            ? item.Last_Repaired
            : latest, equipment[0].Last_Repaired)
      : "-";

  const equipmentTypes = [...new Set(equipment.map((item) => item.Equipment_Type))];
  const locations = [...new Set(equipment.map((item) => item.Location))];

  const filtered = equipment.filter((item) => {
    const matchSearch =
      search === "" ||
      item.Equipment_Type.toLowerCase().includes(search.toLowerCase()) ||
      item.Technician.toLowerCase().includes(search.toLowerCase()) ||
      item.Location.toLowerCase().includes(search.toLowerCase()) ||
      item.Notes.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "" || item.Equipment_Type === filterType;
    const matchLocation = filterLocation === "" || item.Location === filterLocation;
    return matchSearch && matchType && matchLocation;
  });

  const handleAddSuccess = (newId) => {
    setShowModal(false);
    setSuccessMsg(`Record #${newId} added successfully.`);
    fetchData(); // refresh table
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div>
      <div className="header">
        <img src={geLogo} alt="GE Healthcare" className="header-logo-img" />
        <div>
          <div className="header-title">Equipment Maintenance Dashboard</div>
          <div className="header-sub">Precision Care. Powerful Insights.</div>
        </div>
        <div className="nav">
          <button onClick={() => setView("table")} className={view === "table" ? "active" : ""}>Dashboard</button>
          <button onClick={() => setView("api")} className={view === "api" ? "active" : ""}>Raw JSON</button>
        </div>
      </div>

      <div className="main">

        {successMsg && (
          <div className="success-banner">{successMsg}</div>
        )}

        {view === "table" && (
          <>
            <div className="stats">
              <div className="stat">
                <div className="stat-label">Total Equipment Records</div>
                <div className="stat-value">{loading ? "-" : total}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Most Recent Repair</div>
                <div className="stat-value" style={{ fontSize: "18px" }}>{loading ? "-" : mostRecent}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Showing Results</div>
                <div className="stat-value">{loading ? "-" : filtered.length}</div>
              </div>
            </div>

            <div className="filters">
              <input
                type="text"
                placeholder="Search by equipment, technician, location, notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
                <option value="">All Equipment Types</option>
                {equipmentTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="filter-select">
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <button onClick={() => { setSearch(""); setFilterType(""); setFilterLocation(""); }} className="clear-btn">
                Clear
              </button>
              <button onClick={() => setShowModal(true)} className="add-btn">
                + Add Record
              </button>
            </div>

            <div className="section-title">Maintenance Records</div>
            <div className="table-wrapper">
              {loading && <p className="loading">Loading...</p>}
              {error && <p className="error">{error}</p>}
              {!loading && !error && (
                <table>
                  <thead>
                    <tr>
                      <th>Record ID</th>
                      <th>Equipment Type</th>
                      <th>Location</th>
                      <th>Technician</th>
                      <th>Last Repaired</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length > 0 ? filtered.map((item) => (
                      <tr key={item.RecordID}>
                        <td>{item.RecordID}</td>
                        <td>{item.Equipment_Type}</td>
                        <td>{item.Location}</td>
                        <td>{item.Technician}</td>
                        <td>{item.Last_Repaired}</td>
                        <td>{item.Notes}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="6">No results found.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {view === "api" && (
          <>
            <div className="section-title">Raw API Response</div>
            <div className="code-wrapper">
              {loading && <p style={{ color: "#d4d4d4" }}>Loading...</p>}
              {error && <p style={{ color: "red" }}>{error}</p>}
              {!loading && !error && (
                <pre>{JSON.stringify({ status: "success", total_records: total, equipment }, null, 2)}</pre>
              )}
            </div>
          </>
        )}

      </div>

      <div className="footer">
        <img src={geLogo} alt="GE Healthcare" className="footer-logo" />
        <p>© 2025 GE HealthCare Technologies Inc. All rights reserved.</p>
        <p className="footer-sub">Equipment Maintenance Lifecycle Tracker</p>
      </div>

      {showModal && (
        <AddRecordModal
          onClose={() => setShowModal(false)}
          onSuccess={handleAddSuccess}
          equipmentTypes={equipmentTypes}
          locations={locations}
        />
      )}
    </div>
  );
}

export default App;