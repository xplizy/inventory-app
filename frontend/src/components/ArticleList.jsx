import React, { useState, useEffect } from "react";
import axios from "axios";
import ArticleCard from "./ArticleCard";
import OrderModal from "./OrderModal";
import "../App.css";

function ArticleList({ isAdmin }) {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // State för artiklar som döljs från produktsidan (soft-delete)
  const [hiddenArticleIds, setHiddenArticleIds] = useState([]);

  // Hämta alla artiklar från backend
  const fetchArticles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/articles");
      // Filtrera bort artiklar som inte är aktiva
      const activeArticles = res.data.filter(a => a.isActive);
      setArticles(activeArticles);
    } catch (err) {
      console.error(err);
      alert("Det gick inte att hämta artiklar.");
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleOrder = (article) => setSelectedArticle(article);
  const handleCloseModal = () => setSelectedArticle(null);

  const handleConfirmOrder = async ({ articleId, departmentId, quantity }) => {
    try {
      await axios.post(`http://localhost:5000/api/articles/${articleId}/orders`, {
        orders: [{ departmentId: Number(departmentId), quantity }],
      });
      alert("Beställning skickad!");
      setSelectedArticle(null);
      fetchArticles();
    } catch (err) {
      alert(err.response?.data || "Något gick fel vid beställning!");
    }
  };

  const handleRestock = async (id, quantity) => {
    try {
      await axios.post(`http://localhost:5000/api/articles/${id}/restock`, { quantity });
      setArticles(prev =>
        prev.map(a => (a.id === id ? { ...a, stock: a.stock + quantity } : a))
      );
    } catch (err) {
      alert(err.response?.data || "Det gick inte att fylla på produkten.");
    }
  };

  // Soft-delete: ta bort artikel från produktsidan men behåll på avdelningar
  const handleDelete = (id) => {
    if (!window.confirm("Är du säker på att du vill ta bort produkten från listan?")) return;
    setHiddenArticleIds(prev => [...prev, id]);
  };

  return (
    <>
      <div>
        <h1 className="page-title">Produkter</h1>
      </div>

      <div className="article-grid">
        {articles
          .filter(article => !hiddenArticleIds.includes(article.id))
          .map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              onOrder={handleOrder}
              isAdmin={isAdmin}
              onRestock={handleRestock}
              onDelete={handleDelete}
            />
          ))
        }
      </div>

      {selectedArticle && (
        <OrderModal
          article={selectedArticle}
          onClose={handleCloseModal}
          onConfirm={handleConfirmOrder}
        />
      )}
    </>
  );
}

export default ArticleList;