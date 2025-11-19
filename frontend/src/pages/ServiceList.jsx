import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import client from "../api/api";
import "../styles/servicelist.css";

export default function ServiceList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredCount, setFilteredCount] = useState(0);

  // Filter states
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [priceRange, setPriceRange] = useState(searchParams.get("maxPrice") || 10000);

  useEffect(() => {
    fetchServices();
  }, [searchParams]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (search) params.append("q", search);
      if (location) params.append("location", location);

      const response = await client.get(`/services?${params.toString()}`);
      let filtered = response.data;

      // Filter by price range
      filtered = filtered.filter((s) => s.price <= priceRange);

      setServices(filtered);
      setFilteredCount(filtered.length);
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (search) newParams.set("q", search);
    if (location) newParams.set("location", location);
    if (priceRange) newParams.set("maxPrice", priceRange);
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearch("");
    setLocation("");
    setPriceRange(10000);
    setSearchParams({});
  };

  return (
    <div className="servicelist-container">
      <div className="servicelist-wrapper">
        {/* Left Filter Panel */}
        <aside className="filter-panel-services">
          <h3 className="filter-title">🔍 Filters</h3>

          <form onSubmit={handleApplyFilters}>
            {/* Search */}
            <div className="filter-group">
              <label htmlFor="search">Search Service</label>
              <input
                id="search"
                type="text"
                placeholder="e.g., Plumbing, Cleaning..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="filter-input"
              />
            </div>

            {/* Location */}
            <div className="filter-group">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                placeholder="e.g., Delhi, Mumbai..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="filter-input"
              />
            </div>

            {/* Price Range */}
            <div className="filter-group">
              <label htmlFor="priceRange">
                Max Price: ₹{priceRange}
              </label>
              <input
                id="priceRange"
                type="range"
                min="500"
                max="50000"
                step="500"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="price-slider"
              />
            </div>

            {/* Buttons */}
            <div className="filter-buttons">
              <button type="submit" className="btn-apply">
                ✓ Apply Filters
              </button>
              <button
                type="button"
                className="btn-reset"
                onClick={handleResetFilters}
              >
                ↺ Reset
              </button>
            </div>
          </form>
        </aside>

        {/* Services Display */}
        <main className="services-display">
          <div className="services-header">
            <h2>Available Services</h2>
            <p className="service-count">
              Showing {filteredCount} service{filteredCount !== 1 ? "s" : ""}
            </p>
            {/* Post Service button (visible when logged in) */}
            {localStorage.getItem("token") ? (
              <Link to="/services/create" className="btn-post-service">
                + Post Service
              </Link>
            ) : (
              <Link to="/login" className="btn-post-service btn-need-login">
                Sign in to Post
              </Link>
            )}
          </div>

          {loading ? (
            <div className="loading-spinner">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="no-services">
              <p>No services found matching your criteria.</p>
              <button onClick={handleResetFilters} className="btn-reset-large">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="services-grid">
              {services.map((service) => (
                <div key={service._id} className="service-card">
                  <div className="service-image-wrapper">
                    <img
                      src={
                        service.imageUrl ||
                        "https://via.placeholder.com/300x200?text=Service"
                      }
                      alt={service.title}
                      className="service-image"
                    />
                    <span className="service-category">{service.category}</span>
                  </div>

                  <div className="service-content">
                    <h3 className="service-title">{service.title}</h3>

                    <div className="provider-info">
                      <div className="provider-avatar">
                        {service.provider?.name?.charAt(0).toUpperCase() || "P"}
                      </div>
                      <div>
                        <p className="provider-name">
                          {service.provider?.name || "Provider"}
                        </p>
                        <p className="provider-location">
                          📍 {service.provider?.location || "Location"}
                        </p>
                      </div>
                    </div>

                    <p className="service-description">
                      {service.description?.substring(0, 80)}...
                    </p>

                    <div className="service-price-section">
                      <p className="service-price">
                        ₹ {service.price}
                        <span className="price-type">
                          {" "}
                          {service.priceType || "/hour"}
                        </span>
                      </p>
                    </div>

                    <button
                      className="btn-view-service"
                      onClick={() => navigate(`/services/${service._id}`)}
                    >
                      View Service →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
