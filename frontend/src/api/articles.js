import axios from "axios";

const API_URL = "http://localhost:5000/api/articles";

export const getArticles = () => axios.get(API_URL);

export const createArticle = (article) => axios.post(API_URL, article);

export const updateArticle = (id, article) => axios.put(`${API_URL}/${id}`, article);

export const deleteArticle = (id) => axios.delete(`${API_URL}/${id}`);

export const orderArticle = (id, payload) => axios.post(`${API_URL}/${id}/orders`, payload);

export const restockArticle = (id, payload) => axios.post(`${API_URL}/${id}/restock`, payload);
