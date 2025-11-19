// src/pages/CategoryPage.jsx
import React, { useContext, useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import client from "../api/api";
import { CartContext } from "../context/CartContext";
import Pagination from "../components/Pagination";
import "./category.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function CategoryPage() {
  const { name } = useParams(); // category name from /category/:name
  const query = useQuery();
  const navigate = useNavigate();

  // filters & pagination state
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(+query.get("page") || 1);
  const [limit, setLimit] = useState(9);
  const [totalPages, setTotalPages] = useState(1);

  const [minPrice, setMinPrice] = useState(query.get("min") || "");
  const [maxPrice, setMaxPrice] = useState(query.get("max") || "");
  const [rating, setRating] = useState(query.get("rating") || "");
  const [brand, setBrand] = useState(query.get("brand") || "");
  const [loading, setLoading] = useState(false);
  const { addToCart, addToWishlist, wishlist, cart } = useContext(CartContext);

  // build API query params
  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {
        category: name,
        page,
        limit
      };
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (rating) params.rating = rating;
      if (brand) params.brand = brand;

      const res = await client.get("/items", { params });
      // Expect response: { items: [...], page, totalPages }
      setItems(res.data.items || res.data);
      setTotalPages(res.data.totalPages || Math.ceil((res.data.total || items.length) / limit));
    } catch (err) {
      console.error("Fetch items err", err);
    } finally {
      setLoading(false);
    }
  };

  // update querystring when page/filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (page) params.set("page", page);
    if (minPrice) params.set("min", minPrice);
    if (maxPrice) params.set("max", maxPrice);
    if (rating) params.set("rating", rating);
    if (brand) params.set("brand", brand);
    navigate({ search: params.toString() }, { replace: true });
    fetchItems();
    // eslint-disable-next-line
  }, [name, page, minPrice, maxPrice, rating, brand]);

  return (
    <div className="category-page container">
      <header className="cat-header">
        <h1>{name.charAt(0).toUpperCase() + name.slice(1)}</h1>

        <div className="filters-row">
          <div className="filter">
            <label>Price</label>
            <div className="price-inputs">
              <input type="number" placeholder="Min" value={minPrice} onChange={e=>setMinPrice(e.target.value)} />
              <input type="number" placeholder="Max" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} />
            </div>
          </div>

          <div className="filter">
            <label>Rating</label>
            <select value={rating} onChange={e=>setRating(e.target.value)}>
              <option value="">Any</option>
              <option value="4">4+ stars</option>
              <option value="3">3+ stars</option>
              <option value="2">2+ stars</option>
            </select>
          </div>

          <div className="filter">
            <label>Brand</label>
            <input type="text" value={brand} onChange={e=>setBrand(e.target.value)} placeholder="Brand name" />
          </div>

          <div className="filter apply">
            <button className="btn-apply" onClick={()=>{ setPage(1); fetchItems(); }}>Apply</button>
            <button className="btn-clear" onClick={()=>{ setMinPrice(""); setMaxPrice(""); setRating(""); setBrand(""); setPage(1); }}>Clear</button>
          </div>
        </div>
      </header>

      <main className="product-grid">
        {loading ? <div className="loader">Loading…</div> :
          items.length ? items.map(item => (
            <article key={item._id} className="product-card">
              <div className="thumb">
                <img src={item.imageUrl || item.images?.[0] || "/images/placeholder.png"} alt={item.title} />
              </div>

              <div className="meta">
                <h3>{item.title}</h3>
                <p className="muted">{item.location || item.owner?.location}</p>
                <div className="price-row">
                  <div className="price">₹{item.price}</div>
                  <div className="rating">⭐ {item.rating || 4.5}</div>
                </div>
                <div className="actions">
                  <button className="btn small" onClick={()=>addToCart(item)}>
                    Add to cart
                  </button>
                  <button className={`icon-btn ${wishlist.find(w=>w._id===item._id)?'active':''}`} onClick={()=>addToWishlist(item)}>
                    ♥
                  </button>
                </div>
              </div>
            </article>
          )) : <div className="no-items">No items found.</div>
        }
      </main>

      <footer className="pagination-area">
        <Pagination page={page} totalPages={totalPages} onPage={p => setPage(p)} />
      </footer>
    </div>
  );
}
