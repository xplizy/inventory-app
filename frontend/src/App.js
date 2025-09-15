import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ArticleList from "./components/ArticleList";
import AddArticle from "./components/AddArticle";
import Departments from "./components/Departments";
import "./App.css";
import logo from "./assets/vgrlogo.png";

function App() {
  // State för alla avdelningar
  const [departments, setDepartments] = useState([]);
  // State för att visa eller dölja avdelningsmenyn i sidebar
  const [showDepartments, setShowDepartments] = useState(false);
  // State för admin-inloggning
  const [isAdmin, setIsAdmin] = useState(false);
  // State för att visa/dölja login-formulär
  const [showLogin, setShowLogin] = useState(false);

  // Hämtar avdelningar från backend när appen laddas
  useEffect(() => {
    fetch("http://localhost:5000/api/departments")
      .then((res) => res.json())
      .then((data) => setDepartments(data));
  }, []);

  // Funktion för att logga ut admin
  const handleLogout = () => {
    setIsAdmin(false);
  };

  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="logo">
            <img src={logo} alt="Logo" />
            <h2 className="logo-title">Lagersystem</h2>
          </div>

          <nav>
            <ul>
              {/* Länk till produktsidan */}
              <li>
                <Link to="/">Produkter</Link>
              </li>

              {/* Länk till sidan för att lägga till produkt */}
              <li>
                <Link to="/add">Lägg till produkt</Link>
              </li>

              {/* Avdelningsmeny med collapse */}
              <li>
                <button
                  className="collapse-btn"
                  onClick={() => setShowDepartments(!showDepartments)}
                >
                  Avdelning {showDepartments ? "▲" : "▼"}
                </button>
                {showDepartments && (
                  <ul className="sub-menu">
                    {departments.map((dep) => (
                      <li key={dep.id}>
                        <Link to={`/departments/${dep.id}`}>{dep.name}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>

              {/* Admin-login/logout */}
              <li>
                {isAdmin ? (
                  // Om admin är inloggad, visa logout-knapp
                  <button onClick={handleLogout} className="admin-btn">
                    Logga ut
                  </button>
                ) : (
                  // Om admin inte är inloggad, visa login-knapp och formulär
                  <>
                    <button
                      onClick={() => setShowLogin(!showLogin)}
                      className="admin-btn"
                    >
                      Logga in
                    </button>
                    {showLogin && (
                      <div className="sidebar-login-form">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            setIsAdmin(true); // logga in som admin
                            setShowLogin(false); // göm login-form
                          }}
                        >
                          <input type="text" placeholder="Användarnamn" required />
                          <input type="password" placeholder="Lösenord" required />
                          <button type="submit">Logga in</button>
                        </form>
                      </div>
                    )}
                  </>
                )}
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="main-content">
          <Routes>
            {/* Ruta för produktsidan */}
            <Route path="/" element={<ArticleList isAdmin={isAdmin} />} />
            {/* Ruta för lägga till produkt */}
            <Route path="/add" element={<AddArticle />} />
            {/* Ruta för specifik avdelning */}
            <Route path="/departments/:id" element={<Departments isAdmin={isAdmin} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
