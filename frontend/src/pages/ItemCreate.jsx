import React, { useState } from "react";
import client from "../api/api";
import { useNavigate } from "react-router-dom";

export default function ItemCreate() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    category: "",
    condition: "new",
    price: "",
    location: "",
  });

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    try {
      const res = await client.post(
        "/items/create",
        form,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      navigate(`/items/${res.data._id}`);

    } catch (err) {
      console.error(err);
      alert("Error creating item!");
    }
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f2f2f2",
        padding: "20px",
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "100%",
          maxWidth: "450px",
          background: "#ffffff",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "20px",
            fontWeight: "600",
            fontSize: "24px",
            color: "#333",
          }}
        >
          Create New Item
        </h2>

        {/* FORM FIELDS */}
        {[
          ["Title", "title"],
          ["Description", "description", "textarea"],
          ["Image URL", "imageUrl"],
          ["Category", "category"],
          ["Price", "price", "number"],
          ["Location", "location"],
        ].map(([label, key, type]) => (
          <div key={key} style={{ marginBottom: "15px" }}>
            <label
              style={{
                fontWeight: "500",
                display: "block",
                marginBottom: "5px",
                color: "#444",
              }}
            >
              {label}
            </label>

            {type === "textarea" ? (
              <textarea
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #bbb",
                  fontSize: "14px",
                  resize: "vertical",
                }}
              />
            ) : (
              <input
                type={type || "text"}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #bbb",
                  fontSize: "14px",
                }}
              />
            )}
          </div>
        ))}

        {/* CONDITION DROPDOWN */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              fontWeight: "500",
              display: "block",
              marginBottom: "5px",
              color: "#444",
            }}
          >
            Condition
          </label>

          <select
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #bbb",
              fontSize: "14px",
            }}
          >
            <option value="new">New</option>
            <option value="used">Used</option>
          </select>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            background: "#ff4d6d",
            color: "#ffffff",
            fontWeight: "600",
            fontSize: "16px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginTop: "10px",
            transition: "0.3s",
          }}
          onMouseOver={(e) => (e.target.style.background = "#e63958")}
          onMouseOut={(e) => (e.target.style.background = "#ff4d6d")}
        >
          Create Item
        </button>
      </form>
    </div>
  );
}
