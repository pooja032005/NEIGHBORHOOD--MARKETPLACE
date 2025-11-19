import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import "./cart.css";

export default function CartPage() {
  const { cart, removeFromCart } = useContext(CartContext);

  const total = cart.reduce((a, b) => a + (b.item.price * b.qty), 0);

  return (
    <div className="cart-container">
      <h1>Your Cart</h1>

      {cart.length === 0 ? (
        <p className="empty-text">Your cart is empty.</p>
      ) : (
        <>
          <div className="cart-list">
            {cart.map((i) => (
              <div key={i.item._id} className="cart-item">
                <img src={i.item.imageUrl} alt={i.item.title} />
                <div className="info">
                  <h3>{i.item.title}</h3>
                  <p>₹{i.item.price} × {i.qty}</p>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(i.item._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Total: ₹{total}</h2>
            <button className="checkout-btn">Proceed to Checkout</button>
          </div>
        </>
      )}
    </div>
  );
}
