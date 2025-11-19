import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import '../styles/toast.css';

export default function Toast() {
  const { toast } = useContext(CartContext);

  if (!toast || !toast.message) return null;

  return (
    <div className={`toast-container toast-${toast.type}`}>
      <span className="toast-message">{toast.message}</span>
    </div>
  );
}
