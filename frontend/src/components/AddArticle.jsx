import React, { useState, useEffect } from "react";
import axios from "axios";

function AddArticle() {
  // State för formulärfält
  const [name, setName] = useState(""); // Produktnamn
  const [unit, setUnit] = useState("st"); // Enhet, standard "st"
  const [stock, setStock] = useState(0); // Startsaldo
  const [articles, setArticles] = useState([]); // Lista med alla produkter
  const [showList, setShowList] = useState(false); // Toggle för att visa/dölja produktlista

  // useEffect körs när komponenten mountas, hämtar artiklar från backend
  useEffect(() => {
    fetchArticles();
  }, []);

  // Funktion för att hämta alla artiklar från backend
  const fetchArticles = async () => {
    const res = await axios.get("http://localhost:5000/api/articles");
    setArticles(res.data);
  };

  // Funktion som körs när formuläret skickas
  const handleSubmit = async (e) => {
    e.preventDefault(); // Förhindra default form submit

    // Skicka POST request till backend för att skapa ny produkt
    await axios.post("http://localhost:5000/api/articles", {
      name,
      unit,
      stock,
    });

    // Rensa formulärfält efter submission
    setName("");
    setUnit("st");
    setStock(0);

    // Uppdatera listan med nya produkter direkt
    fetchArticles();
  };

  // Funktioner för att öka/minska antal
  const increaseStock = () => setStock((s) => s + 1);
  const decreaseStock = () => setStock((s) => Math.max(0, s - 1)); // Går aldrig under 0

  return (
    <div>
      {/* Formulär för att lägga till ny produkt */}
      <form onSubmit={handleSubmit}>
        <h2>Lägg till produkt</h2>

        {/* Input för produktnamn */}
        <input
          type="text"
          placeholder="Produktnamn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Input för enhet */}
        <input
          type="text"
          placeholder="Enhet (t.ex. st, förp)"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          required
        />

        {/* Kontroller för saldo med + och - knappar */}
        <div className="quantity-control">
          <button type="button" onClick={decreaseStock} disabled={stock <= 0}>
            -
          </button>
          <input
            type="number"
            value={stock}
            onChange={(e) =>
              setStock(Math.max(0, Number(e.target.value) || 0)) // Går aldrig under 0
            }
            min={0}
          />
          <button type="button" onClick={increaseStock}>
            +
          </button>
        </div>

        {/* Skicka-knapp */}
        <button type="submit">Lägg till</button>
      </form>

      {/* Expand/collapse lista över alla produkter */}
      <div className="article-list-container">
        {/* Knapp för att visa/dölja listan */}
        <button
          className="toggle-list-btn"
          onClick={() => setShowList(!showList)}
        >
          {showList ? "Dölj produkter ▲" : "Visa produkter ▼"}
        </button>

        {/* Lista över alla produkter */}
        {showList && (
          <ul className="article-list">
            {articles.map((a) => (
              <li key={a.id}>{a.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AddArticle;
