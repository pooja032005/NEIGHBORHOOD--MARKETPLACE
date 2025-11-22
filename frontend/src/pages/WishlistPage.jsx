import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import "./wishlist.css";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart } = useContext(CartContext);
  const { showToast } = useContext(CartContext);
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch (e) { return null; }
  })();
  const isBuyer = currentUser && currentUser.role === 'buyer';

  return (
    <div className="wishlist-container">
      <h1>My Wishlist</h1>

      {wishlist.length === 0 ? (
        <p className="empty-text">Your wishlist is empty.</p>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((w) => (
            <div className="wish-card" key={w.item._id}>
              <img src={w.item.imageUrl} alt={w.item.title} />

              <h3>{w.item.title}</h3>
              <p className="price">₹{w.item.price}</p>

              <div className="btn-row">
                {isBuyer ? (
                  <button className="add-cart" onClick={() => addToCart(w.item)}>
                    Add to Cart
                  </button>
                ) : (
                  <button className="add-cart" onClick={() => showToast('Only buyers can add to cart. Please login as buyer.', 'error')}>
                    Add to Cart
                  </button>
                )}
                <button
                  className="remove"
                  onClick={() => removeFromWishlist(w.item._id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
