import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/address.css";

export default function Address() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    houseNumber: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    saveAddress: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Phone must be 10 digits";
    if (!formData.houseNumber.trim())
      newErrors.houseNumber = "House/Street is required";
    if (!formData.area.trim()) newErrors.area = "Area is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";
    if (!/^\d{6}$/.test(formData.pincode))
      newErrors.pincode = "Pincode must be 6 digits";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      // Store address in localStorage for now
      localStorage.setItem("deliveryAddress", JSON.stringify(formData));
      navigate("/payment", { state: { address: formData } });
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="address-container">
      <div className="address-wrapper">
        <div className="address-header">
          <h1>📍 Delivery Address</h1>
          <p>Enter your complete address for delivery</p>
        </div>

        <form onSubmit={handleSubmit} className="address-form">
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.fullName ? "input-error" : ""}
            />
            {errors.fullName && (
              <span className="error-text">{errors.fullName}</span>
            )}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10-digit phone number"
              className={errors.phone ? "input-error" : ""}
            />
            {errors.phone && (
              <span className="error-text">{errors.phone}</span>
            )}
          </div>

          {/* House/Street */}
          <div className="form-group">
            <label htmlFor="houseNumber">House / Street Address *</label>
            <input
              id="houseNumber"
              type="text"
              name="houseNumber"
              value={formData.houseNumber}
              onChange={handleChange}
              placeholder="e.g., 123 Main Street"
              className={errors.houseNumber ? "input-error" : ""}
            />
            {errors.houseNumber && (
              <span className="error-text">{errors.houseNumber}</span>
            )}
          </div>

          {/* Area */}
          <div className="form-group">
            <label htmlFor="area">Area / Locality *</label>
            <input
              id="area"
              type="text"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="e.g., Downtown"
              className={errors.area ? "input-error" : ""}
            />
            {errors.area && (
              <span className="error-text">{errors.area}</span>
            )}
          </div>

          {/* City */}
          <div className="form-group">
            <label htmlFor="city">City *</label>
            <input
              id="city"
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g., Delhi"
              className={errors.city ? "input-error" : ""}
            />
            {errors.city && (
              <span className="error-text">{errors.city}</span>
            )}
          </div>

          {/* State */}
          <div className="form-group">
            <label htmlFor="state">State *</label>
            <input
              id="state"
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="e.g., Delhi"
              className={errors.state ? "input-error" : ""}
            />
            {errors.state && (
              <span className="error-text">{errors.state}</span>
            )}
          </div>

          {/* Pincode */}
          <div className="form-group">
            <label htmlFor="pincode">Pincode *</label>
            <input
              id="pincode"
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="6-digit pincode"
              className={errors.pincode ? "input-error" : ""}
            />
            {errors.pincode && (
              <span className="error-text">{errors.pincode}</span>
            )}
          </div>

          {/* Save Address Checkbox */}
          <div className="checkbox-group">
            <input
              id="saveAddress"
              type="checkbox"
              name="saveAddress"
              checked={formData.saveAddress}
              onChange={handleChange}
            />
            <label htmlFor="saveAddress">Save this address for future use</label>
          </div>

          {/* Buttons */}
          <div className="form-buttons">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
            <button
              type="submit"
              className="btn-continue"
              disabled={loading}
            >
              {loading ? "Saving..." : "Continue to Payment →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
