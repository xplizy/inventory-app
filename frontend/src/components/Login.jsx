import React, { useState } from "react";

function Login({ onLogin }) {
  // State för användarnamn och lösenord
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // State för felmeddelande vid misslyckad inloggning
  const [error, setError] = useState("");

  // Funktion som körs när formuläret skickas
  const handleSubmit = (e) => {
    e.preventDefault(); // förhindra sidladdning vid submit

    // Enkel hardkodad inloggning (inte säker, endast för demo)
    if (username === "admin" && password === "admin123") {
      onLogin(true); // anropar callback för att indikera att användaren är inloggad som admin
    } else {
      setError("Fel användarnamn eller lösenord"); // Visa felmeddelande
    }
  };

  return (
    <div className="login-container">
      {/* Rubrik */}
      <h2>Admin Login</h2>

      {/* Inloggningsformulär */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Användarnamn"
          value={username} // bindar input till state
          onChange={(e) => setUsername(e.target.value)} // uppdaterar state vid ändring
        />
        <input
          type="password"
          placeholder="Lösenord"
          value={password} // bindar input till state
          onChange={(e) => setPassword(e.target.value)} // uppdaterar state vid ändring
        />
        <button type="submit">Logga in</button> {/* submit knapp */}
      </form>

      {/* Visa felmeddelande om det finns */}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default Login;
