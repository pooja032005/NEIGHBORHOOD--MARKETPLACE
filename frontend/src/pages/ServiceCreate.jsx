import React, { useState, useEffect, useRef } from "react";
import client from "../api/api";
import { validateTitle, validateDescription } from "../utils/validation";
import { useNavigate } from "react-router-dom";
import debounce from "../utils/debounce";

export default function ServiceCreate() {
  const navigate = useNavigate();
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (!user || user.role !== 'seller') {
        alert('Access denied: only sellers can create services.');
        navigate('/');
      }
    } catch (err) {
      navigate('/login');
    }
  }, []);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priceType: "fixed",
    price: "",
    location: "",
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const liveValidateRef = useRef();

  useEffect(() => {
    liveValidateRef.current = debounce((key, value) => {
      const nextErrors = {};
      if (key === 'title') {
        const res = validateTitle(value);
        if (!res.valid) nextErrors.title = res.message; else nextErrors.title = null;
      }
      if (key === 'description') {
        const res = validateDescription(value);
        if (!res.valid) nextErrors.description = res.message; else nextErrors.description = null;
      }
      setErrors(prev => ({ ...prev, ...nextErrors }));
    }, 400);
  }, []);



  const submit = async (e) => {
    e.preventDefault();

    // Validation
    const titleCheck = validateTitle(form.title);
    const descCheck = validateDescription(form.description);
    const newErrors = {};
    if (!titleCheck.valid) newErrors.title = titleCheck.message;
    if (!descCheck.valid) newErrors.description = descCheck.message;
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("category", form.category);
      fd.append("priceType", form.priceType);
      fd.append("price", form.price);
      fd.append("location", form.location);
      if (file) fd.append("image", file);

      const { data } = await client.post("/services/create", fd, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      navigate(`/services/${data._id}`);

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error creating service");
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
          Offer a Service
        </h2>

        {/* FIELD BUILDER */}
        {[
          ["Service Title", "title"],
          ["Description", "description", "textarea"],
          ["Category", "category"],
          ["Price (₹)", "price", "number"],
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
              <>
                <textarea
                  value={form[key]}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm({ ...form, [key]: v });
                    if (liveValidateRef.current) liveValidateRef.current(key, v);
                  }}
                  className={errors[key] ? 'input-error' : ''}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #bbb",
                    fontSize: "14px",
                    resize: "vertical",
                  }}
                />
                {errors[key] && <div className="field-error-message">{errors[key]}</div>}
              </>
            ) : (
              <>
                <input
                  type={type || "text"}
                  value={form[key]}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm({ ...form, [key]: v });
                    if (key === 'title' || key === 'description') {
                      if (liveValidateRef.current) liveValidateRef.current(key, v);
                    }
                  }}
                  className={errors[key] ? 'input-error' : ''}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #bbb",
                    fontSize: "14px",
                  }}
                />
                {errors[key] && <div className="field-error-message">{errors[key]}</div>}
              </>
            )}
          </div>
        ))}

        {/* IMAGE UPLOAD */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              fontWeight: "500",
              display: "block",
              marginBottom: "5px",
              color: "#444",
            }}
          >
            Upload Image (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ width: "100%" }}
          />
        </div>

        {/* PRICE TYPE DROPDOWN */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              fontWeight: "500",
              display: "block",
              marginBottom: "5px",
              color: "#444",
            }}
          >
            Price Type
          </label>

          <select
            value={form.priceType}
            onChange={(e) => setForm({ ...form, priceType: e.target.value })}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #bbb",
              fontSize: "14px",
            }}
          >
            <option value="fixed">Fixed</option>
            <option value="hourly">Hourly</option>
          </select>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            background: "#4a90e2",
            color: "#ffffff",
            fontWeight: "600",
            fontSize: "16px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginTop: "10px",
            transition: "0.3s",
          }}
        >
          Create Service
        </button>
      </form>
    </div>
  );
}
