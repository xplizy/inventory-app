import React, { useState } from "react";
import OrderModal from "./OrderModal";
import "../App.css";
import axios from "axios";

function ArticleCard({ article, onOrder, isAdmin, onRestock, onDelete }) {
  // State för att visa eller dölja restock-inputfältet
  const [showRestock, setShowRestock] = useState(false);

  // State för hur mycket som ska fyllas på vid restock
  const [restockAmount, setRestockAmount] = useState(0);

  // Funktion för att fylla på lager
  const handleRestock = async () => {
    if (restockAmount <= 0) return alert("Skriv in ett giltigt antal!"); // Validering

    // Skicka POST-request till backend för att uppdatera lagret
    await axios.post(`http://localhost:5000/api/articles/${article.id}/restock`, {
      quantity: restockAmount,
    });

    // Uppdatera parent-komponentens state
    onRestock(article.id, restockAmount);

    // Rensa input och dölj inputfältet
    setRestockAmount(0);
    setShowRestock(false);
  };

  return (
    <div className="article-card">
      {/* Produktbild */}
      <img src={article.imageUrl} alt={article.name} />

      {/* Produktnamn */}
      <h3>{article.name}</h3>

      {/* Lagersaldo, färgas röd om lagret är lågt */}
      <p className={article.stock <= 10 ? "low-stock" : ""}>
        Lagersaldo: {article.stock} {article.unit}
      </p>

      {/* Knapp för att öppna beställningsmodal */}
      <button onClick={() => onOrder(article)}>Beställ</button>

      {/* Admin-specifika knappar */}
      {isAdmin && (
        <>
          {/* Knapp för att visa/dölja restock-fält */}
          <button
            onClick={() => setShowRestock(!showRestock)}
            className="restock-btn"
          >
            Fyll på
          </button>

          {/* Input och spara-knapp för att fylla på lager */}
          {showRestock && (
            <div className="restock-input-container">
              <input
                type="number"
                min="1"
                value={restockAmount}
                onChange={(e) => setRestockAmount(Number(e.target.value))}
              />
              <button onClick={handleRestock} className="save-btn">
                Spara
              </button>
            </div>
          )}

          {/* Knapp för att ta bort produkt från listan (frontend-soft-delete) */}
          <button onClick={() => onDelete(article.id)} className="delete-btn">
            Delete
          </button>
        </>
      )}
    </div>
  );
}

export default ArticleCard;
