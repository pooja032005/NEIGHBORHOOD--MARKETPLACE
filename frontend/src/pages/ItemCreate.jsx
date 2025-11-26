import React, { useState, useEffect, useRef } from "react";
import client from "../api/api";
import { validateTitle, validateDescription, isLikelyValidText, isValidImageUrl, isGibberishWord } from "../utils/validation";
import { useNavigate } from "react-router-dom";
import debounce from "../utils/debounce";

export default function ItemCreate() {
  const navigate = useNavigate();
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (!user || user.role !== 'seller') {
        // Only sellers can create items
        alert('Access denied: only sellers can create items.');
        navigate('/');
      }
    } catch (err) {
      navigate('/login');
    }
  }, []);
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    category: "",
    condition: "new",
    price: "",
    location: "",
  });
  const [errors, setErrors] = useState({});

  const liveValidateRef = useRef();

  // Calculate form validity - all required fields must pass validation
  const isFormValid = () => {
    if (!form.title.trim() || !form.description.trim() || !form.category.trim()) return false;
    
    const titleCheck = validateTitle(form.title);
    if (!titleCheck.valid || !isLikelyValidText(form.title)) return false;
    
    const descCheck = validateDescription(form.description);
    if (!descCheck.valid || !isLikelyValidText(form.description)) return false;
    
    // Image URL is optional, but if provided must be valid
    if (form.imageUrl.trim() !== '' && !isValidImageUrl(form.imageUrl)) return false;
    
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
      if (key === 'imageUrl' && value.trim() !== '') {
        if (!isValidImageUrl(value)) nextErrors.imageUrl = 'Invalid image URL format.';
        else nextErrors.imageUrl = null;
      }
      setErrors(prev => ({ ...prev, ...nextErrors }));
    }, 400);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    // Client-side validation
    const titleCheck = validateTitle(form.title);
    const descCheck = validateDescription(form.description);
    const newErrors = {};
    if (!titleCheck.valid) newErrors.title = titleCheck.message;
    if (!descCheck.valid) newErrors.description = descCheck.message;
    // additional heuristics
    if (!newErrors.title && !isLikelyValidText(form.title)) newErrors.title = 'Title looks invalid or gibberish.';
    if (!newErrors.description && !isLikelyValidText(form.description)) newErrors.description = 'Description looks invalid or too short.';
    // Validate image URL if provided
    if (form.imageUrl && form.imageUrl.trim() !== '') {
      if (!isValidImageUrl(form.imageUrl)) newErrors.imageUrl = 'Invalid image URL. Use a valid link or leave blank.';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length) {
      const errorMsg = Object.values(newErrors).join('\n');
      alert('❌ Invalid Data:\n\n' + errorMsg);
      return;
    }

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
      const msg = err.response?.data?.message || err.message || 'Error creating item';
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
          Create New Item
        </h2>

        {/* FORM FIELDS */}
        {[
          ["Title", "title"],
          ["Description", "description", "textarea"],
          ["Image URL", "imageUrl"],
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
                        return; // block further insertion until user removes the gibberish
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
                        return; // block further insertion
                      } else {
                        setErrors(prevErr => ({ ...prevErr, [key]: null }));
                      }
                    }
                    setForm({ ...form, [key]: v });
                    if (key === 'title' || key === 'description' || key === 'imageUrl') {
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
                {key === 'imageUrl' && (
                  <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                    Optional. Valid formats: .png, .jpg, .jpeg, .gif, .webp or URLs starting with /uploads/ or data:image/
                  </small>
                )}
              </>
            )}
          </div>
        ))}

        {/* CATEGORY SELECT - fixed categories to match Home page */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              fontWeight: "500",
              display: "block",
              marginBottom: "5px",
              color: "#444",
            }}
          >
            Category
          </label>

          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #bbb",
              fontSize: "14px",
            }}
          >
            <option value="">Select category</option>
            <option value="Electronics">Electronics</option>
            <option value="Home Goods">Home Goods</option>
            <option value="Fashion">Fashion</option>
            <option value="Games">Games</option>
            <option value="Books">Books</option>
            <option value="Sports">Sports</option>
          </select>
        </div>

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
          disabled={!isFormValid()}
          style={{
            width: "100%",
            padding: "12px",
            background: isFormValid() ? "#ff4d6d" : "#ccc",
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
              e.target.style.background = "#e63958";
            }
          }}
          onMouseOut={(e) => {
            if (isFormValid()) {
              e.target.style.background = "#ff4d6d";
            }
          }}
        >
          {isFormValid() ? "Create Item" : "Complete all fields to enable"}
        </button>
      </form>
    </div>
  );
}
