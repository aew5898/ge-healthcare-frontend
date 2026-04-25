import { useState, useEffect } from "react";
import "./App.css";
import geLogo from "./assets/GE_HealthCare_logo_2023.png";

function App() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

useEffect(() => {
    fetch("http://13.220.133.123/patients_html.py")
      .then((res) => res.json())
      .then((data) => {
        setEquipment(data.equipment)
        setLoading(false)
      })
      .catch((err) => {
        setError("Error loading data.");
        setLoading(false)
      });
  }, []);

  const total = equipment.length

  //get most recent repair date
  const mostRecent = equipment.length > 0
    ? equipment.reduce((latest, item) => {
        return new Date(item.Last_Repaired) > new Date(latest) ? item.Last_Repaired : latest
      }, equipment[0].Last_Repaired)
    : "-"

  //get unique equipment types for dropdown
  const equipmentTypes = [...new Set(equipment.map(item => item.Equipment_Type))]

  //get unique locations for dropdown
  const locations = [...new Set(equipment.map(item => item.Location))]

  //filter logic
  const filtered = equipment.filter(item => {
    const matchSearch = search === "" ||
      item.Equipment_Type.toLowerCase().includes(search.toLowerCase()) ||
      item.Technician.toLowerCase().includes(search.toLowerCase()) ||
      item.Location.toLowerCase().includes(search.toLowerCase()) ||
      item.Notes.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === "" || item.Equipment_Type === filterType
    const matchLocation = filterLocation === "" || item.Location === filterLocation
    return matchSearch && matchType && matchLocation
  })

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

      {view === "table" && (
          <>
            <div className="stats">
              <div className="stat">
                <div className="stat-label">Total Equipment Records</div>
                <div className="stat-value">{loading ? "-" : total}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Most Recent Repair</div>
                <div className="stat-value" style={{fontSize: "18px"}}>{loading ? "-" : mostRecent}</div>
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
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="">All Equipment Types</option>
                {equipmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="filter-select"
              >
                <option value="">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <button
                onClick={() => { setSearch(""); setFilterType(""); setFilterLocation(""); }}
                className="clear-btn"
              >
                Clear
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
              {loading && <p style={{color: "#d4d4d4"}}>Loading...</p>}
              {error && <p style={{color: "red"}}>{error}</p>}
              {!loading && !error && (
                <pre>{JSON.stringify({status: "success", total_records: total, equipment}, null, 2)}</pre>
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

    </div>
  );
}

export default App;