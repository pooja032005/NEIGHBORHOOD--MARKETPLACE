import React, { useState, useEffect, useRef } from "react";
import client from "../api/api";
import { validateTitle, validateDescription, isLikelyValidText, isGibberishWord } from "../utils/validation";
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

  // Calculate form validity - all required fields must pass validation
  const isFormValid = () => {
    if (!form.title.trim() || !form.description.trim() || !form.category.trim()) return false;
    
    const titleCheck = validateTitle(form.title);
    if (!titleCheck.valid || !isLikelyValidText(form.title)) return false;
    
    const descCheck = validateDescription(form.description);
    if (!descCheck.valid || !isLikelyValidText(form.description)) return false;
    
    return true;
  };

  useEffect(() => {
    liveValidateRef.current = debounce((key, value) => {
      const nextErrors = {};
      if (key === 'title') {
        const res = validateTitle(value);
        if (!res.valid) nextErrors.title = res.message;
        else if (!isLikelyValidText(value)) nextErrors.title = 'Title looks invalid or gibberish.';
        else nextErrors.title = null;
      }
      if (key === 'description') {
        const res = validateDescription(value);
        if (!res.valid) nextErrors.description = res.message;
        else if (!isLikelyValidText(value)) nextErrors.description = 'Description looks invalid or gibberish.';
        else nextErrors.description = null;
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
    // additional heuristics
    if (!newErrors.title && !isLikelyValidText(form.title)) newErrors.title = 'Title looks invalid or gibberish.';
    if (!newErrors.description && !isLikelyValidText(form.description)) newErrors.description = 'Description looks invalid or too short.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length) {
      const errorMsg = Object.values(newErrors).join('\n');
      alert('❌ Invalid Data:\n\n' + errorMsg);
      return;
    }

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
      const msg = err.response?.data?.message || err.message || 'Error creating service';
      alert(msg);
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
                    const prev = form[key] || '';
                    const isInsert = v.length > prev.length;
                    if (isInsert) {
                      const words = v.split(/\s+/).filter(Boolean);
                      const hasGib = words.some(w => isGibberishWord(w));
                      if (hasGib) {
                        setErrors(prevErr => ({ ...prevErr, [key]: 'Contains invalid word. Remove it to continue.' }));
                        return;
                      } else {
                        setErrors(prevErr => ({ ...prevErr, [key]: null }));
                      }
                    }
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
                {key === 'description' && (
                  <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                    {form[key].length} / 3000 characters max
                  </small>
                )}
              </>
            ) : (
              <>
                <input
                  type={type || "text"}
                  value={form[key]}
                  onChange={(e) => {
                    const v = e.target.value;
                    const prev = form[key] || '';
                    const isInsert = v.length > prev.length;
                    if (isInsert && (key === 'title' || key === 'description')) {
                      const words = v.split(/\s+/).filter(Boolean);
                      const hasGib = words.some(w => isGibberishWord(w));
                      if (hasGib) {
                        setErrors(prevErr => ({ ...prevErr, [key]: 'Contains invalid word. Remove it to continue.' }));
                        return;
                      } else {
                        setErrors(prevErr => ({ ...prevErr, [key]: null }));
                      }
                    }
                    setForm({ ...form, [key]: v });
                    if (key === 'title' || key === 'description') {
                      if (liveValidateRef.current) liveValidateRef.current(key, v);
                    }
                  }}
                  className={errors[key] ? 'input-error' : ''}
                  maxLength={key === 'title' ? 70 : undefined}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #bbb",
                    fontSize: "14px",
                  }}
                />
                {errors[key] && <div className="field-error-message">{errors[key]}</div>}
                {key === 'title' && (
                  <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                    {form[key].length} / 70 characters max
                  </small>
                )}
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
          disabled={!isFormValid()}
          style={{
            width: "100%",
            padding: "12px",
            background: isFormValid() ? "#4a90e2" : "#ccc",
            color: isFormValid() ? "#ffffff" : "#999",
            fontWeight: "600",
            fontSize: "16px",
            border: "none",
            borderRadius: "8px",
            cursor: isFormValid() ? "pointer" : "not-allowed",
            marginTop: "10px",
            transition: "0.3s",
          }}
          onMouseOver={(e) => {
            if (isFormValid()) {
              e.target.style.background = "#3a7dd1";
            }
          }}
          onMouseOut={(e) => {
            if (isFormValid()) {
              e.target.style.background = "#4a90e2";
            }
          }}
        >
          {isFormValid() ? "Create Service" : "Complete all fields to enable"}
        </button>
      </form>
    </div>
  );
}
