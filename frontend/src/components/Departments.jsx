import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../App.css";

function Departments() {
  // Hämta avdelnings-id från URL-parametern
  const { id } = useParams();

  // State för aktuell avdelning och dess artiklar
  const [department, setDepartment] = useState(null);

  // State för den artikel som valts i modal
  const [selectedArticle, setSelectedArticle] = useState(null);

  // State för antalet artiklar som ska användas i modal
  const [quantity, setQuantity] = useState(1);

  // Effekt som körs när komponenten mountas eller när id ändras
  // Hämtar avdelning och dess artiklar
  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        // Hämta alla avdelningar
        const res = await axios.get(`http://localhost:5000/api/departments`);
        // Hitta den specifika avdelningen
        const dep = res.data.find((d) => d.id === parseInt(id));

        if (dep) {
          // Hämta alla artiklar
          const articlesRes = await axios.get(`http://localhost:5000/api/articles`);

          // Koppla artiklar till denna avdelning och lägg till quantity från DepartmentInventory
          const depArticles = articlesRes.data.map((a) => {
            const di = a.departmentInventories.find((di) => di.departmentId === dep.id);
            return {
              ...a,
              quantity: di ? di.quantity : 0, // om artikel finns på avdelningen, annars 0
            };
          });

          // Spara avdelning och artiklar i state
          setDepartment({ ...dep, articles: depArticles });
        }
      } catch (err) {
        console.error("Fel vid hämtning av avdelning:", err);
      }
    };

    fetchDepartment();
  }, [id]); // Körs när id ändras

  // Funktion för att använda en artikel (minska lagersaldo på avdelningen)
  const handleUseArticle = async () => {
    if (!selectedArticle) return;

    // Kontrollera att använd mängd inte överstiger lagersaldo
    if (quantity > selectedArticle.quantity) {
      alert("Du kan inte använda fler än vad som finns i lagret!");
      return;
    }

    try {
      // Skicka request till backend för att minska lagersaldo
      await axios.put(
        `http://localhost:5000/api/departments/${id}/articles/${selectedArticle.id}/use`,
        { quantity }, // skickas som objekt
        { headers: { "Content-Type": "application/json" } }
      );

      // Uppdatera lokalt state för att reflektera nytt lagersaldo direkt
      setDepartment((prev) => ({
        ...prev,
        articles: prev.articles.map((a) =>
          a.id === selectedArticle.id
            ? { ...a, quantity: a.quantity - quantity }
            : a
        ),
      }));

      // Stäng modal och återställ quantity
      setSelectedArticle(null);
      setQuantity(1);
    } catch (err) {
      console.error(err);

      // Hantera felmeddelanden från backend
      let message = "Kunde inte minska lagersaldot.";
      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          message = err.response.data;
        } else if (err.response.data?.title) {
          message = err.response.data.title;
        }
      }
      alert(message);
    }
  };

  // Visa laddningsmeddelande om avdelning inte hämtats än
  if (!department) return <p>Laddar avdelning...</p>;

  return (
    <div>
      {/* Avdelningsnamn */}
      <h1>{department.name}</h1>

      {/* Grid med avdelningens artiklar */}
      <div className="article-grid">
        {department.articles.length > 0 ? (
          department.articles.map((a) => (
            <div
              key={a.id}
              className="article-card"
              onClick={() => setSelectedArticle(a)} // Öppna modal vid klick
            >
              <img
                src={a.imageUrl || "http://localhost:5000/images/bildsaknas.png"}
                alt={a.name}
              />
              <h3>{a.name}</h3>
              <p className={a.quantity <= 10 ? "low-stock-text" : ""}>
                Saldo: {a.quantity} {a.unit}
              </p>
            </div>
          ))
        ) : (
          <p>Inga artiklar beställda till denna avdelning.</p>
        )}
      </div>

      {/* Modal för att rapportera användning av en artikel */}
      {selectedArticle && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Använd {selectedArticle.name}</h2>
            <p>
              Lagersaldo: {selectedArticle.quantity} {selectedArticle.unit}
            </p>

            {/* Kontroll för antal som ska användas */}
            <div className="quantity-control">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
              <span>{quantity}</span>
              <button
                onClick={() =>
                  setQuantity((q) =>
                    q < selectedArticle.quantity ? q + 1 : q
                  )
                }
              >
                +
              </button>
            </div>

            {/* Spara / Avbryt knappar */}
            <div style={{ marginTop: "20px" }}>
              <button
                onClick={handleUseArticle}
                style={{ marginRight: "10px" }}
              >
                Spara
              </button>
              <button onClick={() => setSelectedArticle(null)}>Avbryt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Departments;