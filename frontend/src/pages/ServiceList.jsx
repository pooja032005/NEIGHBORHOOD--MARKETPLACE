import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import client from "../api/api";
import "./ServiceList.css";

export default function ServiceList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredCount, setFilteredCount] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

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
    <div className="services-page">
      <div className="services-layout">
        <button
          type="button"
          className="services-filter-toggle"
          onClick={() => setFiltersOpen(prev => !prev)}
          aria-expanded={filtersOpen}
          aria-controls="services-filters"
        >
          {filtersOpen ? "Hide filters" : "Show filters"}
        </button>

        <aside id="services-filters" className={`services-filter-card${filtersOpen ? " open" : ""}`}>
          <h2 className="services-filter-title">🔍 Filters</h2>

          <form onSubmit={handleApplyFilters}>
            <div className="services-filter-group">
              <label className="services-filter-label" htmlFor="service-search">Search Service</label>
              <div className="services-filter-input-wrap">
              <input
                id="service-search"
                type="text"
                placeholder="e.g., Plumbing, Cleaning..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="services-filter-input"
              />
                <span className="services-filter-icon" aria-hidden="true">⌕</span>
              </div>
            </div>

            <div className="services-filter-group">
              <label className="services-filter-label" htmlFor="service-location">Location</label>
              <div className="services-filter-input-wrap">
              <input
                id="service-location"
                type="text"
                placeholder="e.g., Delhi, Mumbai..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="services-filter-input"
              />
                <span className="services-filter-icon" aria-hidden="true">⌖</span>
              </div>
            </div>

            <div className="services-filter-group">
              <label className="services-filter-label" htmlFor="service-price-range">Max Price</label>
              <p className="services-price-value">₹{priceRange}{Number(priceRange) >= 50000 ? "+" : ""}</p>
              <input
                id="service-price-range"
                type="range"
                min="500"
                max="50000"
                step="500"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="services-price-slider"
              />
              <div className="services-price-scale"><span>₹500</span><span>₹50000+</span></div>
            </div>

            <div className="services-filter-actions">
              <button type="submit" className="services-primary-button">
                ▾ Apply Filters
              </button>
              <button
                type="button"
                className="services-secondary-button"
                onClick={handleResetFilters}
              >
                ↻ Reset
              </button>
            </div>
          </form>
        </aside>

        <main className="services-content">
          <header className="services-header">
            <h1 className="services-header-title">Available Services</h1>
            <div className="services-header-actions">
              <span className="services-count">
              Showing {filteredCount} service{filteredCount !== 1 ? "s" : ""}
              </span>
            {localStorage.getItem("token") ? (
              <Link to="/services/create" className="services-post-button">
                + Post Service
              </Link>
            ) : (
              <Link to="/login" className="services-post-button">
                Sign in to Post
              </Link>
            )}
            </div>
          </header>

          {loading ? (
            <div className="services-results services-loading">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="services-results">
              <div className="services-empty-state">
                <div className="services-empty-illustration" role="img" aria-label="Toolbox with local service tools">
                  <span className="services-spark services-spark-one">✦</span>
                  <span className="services-spark services-spark-two">✦</span>
                  <span className="services-tool services-tool-one" />
                  <span className="services-tool services-tool-two" />
                  <span className="services-tool services-tool-three" />
                  <span className="services-toolbox" />
                </div>
                <h2 className="services-empty-title">No services found matching your criteria</h2>
                <p className="services-empty-description">Try adjusting your search criteria</p>
                <button onClick={handleResetFilters} className="services-clear-button">↻ Clear all filters</button>
              </div>
              <div className="services-landscape" aria-hidden="true">
                <span className="services-city" />
                <span className="services-tree services-tree-one" />
                <span className="services-tree services-tree-two" />
                <span className="services-tree services-tree-three" />
                <span className="services-lamp services-lamp-one" />
                <span className="services-lamp services-lamp-two" />
              </div>
            </div>
          ) : (
            <div className="services-grid">
              {services.map((service) => (
                <article key={service._id} className="services-card">
                  <div className="services-card-image-wrap">
                    {service.imageUrl ? (
                      <img src={service.imageUrl} alt={service.title} className="services-card-image" />
                    ) : (
                      <div className="services-empty-illustration" role="img" aria-label="Service tools illustration">
                        <span className="services-tool services-tool-one" />
                        <span className="services-tool services-tool-two" />
                        <span className="services-toolbox" />
                      </div>
                    )}
                    <span className="services-card-category">{service.category}</span>
                  </div>

                  <div className="services-card-content">
                    <h2 className="services-card-title">{service.title}</h2>

                    <div className="services-provider">
                      <div className="services-provider-avatar">
                        {service.provider?.name?.charAt(0).toUpperCase() || "P"}
                      </div>
                      <div>
                        <p className="services-provider-name">{service.provider?.name || "Provider"}</p>
                        <p className="services-provider-location">📍 {service.provider?.location || "Location"}</p>
                      </div>
                    </div>

                    <p className="services-card-description">{service.description?.substring(0, 80)}...</p>

                    <div className="services-card-footer">
                      <p className="services-card-price">₹ {service.price}<span> {service.priceType || "/hour"}</span></p>
                      <button className="services-view-button" onClick={() => navigate(`/services/${service._id}`)}>View Service →</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
