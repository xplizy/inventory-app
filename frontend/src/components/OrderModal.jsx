import React, { useState, useEffect } from "react";
import "../App.css";

function OrderModal({ article, onClose, onConfirm }) {
  // Lista med avdelningar för artikeln
  const departments = article.departmentInventories || [];

  // State för vald mängd och avdelning
  const [quantity, setQuantity] = useState(0); // börjar på 0
  const [departmentId, setDepartmentId] = useState("");

  // Sätt default avdelning när modal öppnas
  useEffect(() => {
    if (departments.length > 0) {
      setDepartmentId(departments[0].departmentId);
    }
  }, [departments]);

  // Funktioner för att öka och minska mängd, med begränsningar
  const increase = () => {
    setQuantity((q) => Math.min(q + 1, article.stock)); // max = lager
  };

  const decrease = () => {
    setQuantity((q) => Math.max(0, q - 1)); // min = 0
  };

  // Hantera direkt input från användaren i textfält
  const handleInputChange = (e) => {
    const value = Math.max(0, Math.min(Number(e.target.value), article.stock));
    setQuantity(value);
  };

  // Bekräfta beställning
  const confirmOrder = () => {
    if (!departmentId) return alert("Välj en avdelning!"); // avdelning måste väljas
    if (quantity <= 0) return alert("Du måste välja minst 1 produkt!"); // minst 1 produkt
    // Anropa callback med orderdata
    onConfirm({ articleId: article.id, departmentId, quantity });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        {/* Rubrik */}
        <h2>Beställ {article.name}</h2>

        {/* Visa lagersaldo */}
        <p className={article.stock <= 10 ? "low-stock" : ""}>
          Lagersaldo: {article.stock} {article.unit}
        </p>

        {/* Mängd-hantering med +/- knappar och input */}
        <div className="quantity-control">
          <button onClick={decrease} disabled={quantity <= 0}>
            -
          </button>
          <input
            type="number"
            value={quantity}
            onChange={handleInputChange}
            min={0}
            max={article.stock}
          />
          <button onClick={increase} disabled={quantity >= article.stock}>
            +
          </button>
        </div>

        {/* Dropdown för att välja avdelning */}
        <div className="department-list">
          <label>Välj avdelning: </label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(Number(e.target.value))}
          >
            {departments.map((d) => (
              <option key={d.departmentId} value={d.departmentId}>
                {d.departmentName}
              </option>
            ))}
          </select>
        </div>

        {/* Action-knappar för modal */}
        <div className="modal-actions">
          <button onClick={confirmOrder} className="confirm-btn">
            Skicka beställning
          </button>
          <button onClick={onClose} className="cancel-btn">
            Avbryt
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderModal;
