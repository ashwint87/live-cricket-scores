import React, { useEffect, useState } from 'react';
import { useFallbackImages } from './../context/FallbackImageContext';
import './css/Stadiums.css';

const Stadiums = () => {
  const [venues, setVenues] = useState([]);
  const [countries, setCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [minCapacity, setMinCapacity] = useState(0);
  const [maxCapacity, setMaxCapacity] = useState(100000);
  const [floodlightOnly, setFloodlightOnly] = useState(false);
  const [sortKey, setSortKey] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 14;
  const [modalVenue, setModalVenue] = useState(null);
  const { images } = useFallbackImages();

  useEffect(() => {
    fetch('/api/venues')
      .then(res => res.json())
      .then(json => setVenues(json.data || []));

    fetch('/api/countries')
      .then(res => res.json())
      .then(json => setCountries(json.data || []));
  }, []);

  const getCountryName = (id) => {
    const country = countries.find(c => c.id === id);
    return country ? country.name : '';
  };

  const filteredVenues = venues
    .filter(v => {
      const matchText =
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCountryName(v.country_id).toLowerCase().includes(searchTerm.toLowerCase());

      const matchCountry = !selectedCountry || v.country_id === parseInt(selectedCountry);
      const matchFloodlight = !floodlightOnly || v.floodlight;
      const matchCapacity = !v.capacity || (v.capacity >= minCapacity && v.capacity <= maxCapacity);

      return matchText && matchCountry && matchFloodlight && matchCapacity;
    })
    .sort((a, b) => {
      const getPriority = (v) => {
        if (v.capacity != null && v.floodlight) return 1;
        if (v.capacity == null && v.floodlight) return 2;
        return 3;
      };

      const priorityA = getPriority(a);
      const priorityB = getPriority(b);
      if (priorityA !== priorityB) return priorityA - priorityB;

      // Push sportmonks.com images to the end
      const isSportmonksA = v => v.image_path?.endsWith('sportmonks.com');
      const isSportmonksB = v => v.image_path?.endsWith('sportmonks.com');

      if (isSportmonksA(a) && !isSportmonksB(b)) return 1;
      if (!isSportmonksA(a) && isSportmonksB(b)) return -1;

      // fallback sort by name or capacity
      const valA = sortKey === 'capacity' ? (a.capacity || 0) : a.name.toLowerCase();
      const valB = sortKey === 'capacity' ? (b.capacity || 0) : b.name.toLowerCase();

      return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

  const totalPages = Math.ceil(filteredVenues.length / pageSize);
  const paginatedVenues = filteredVenues.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="stadium-container">
      <h2>Stadiums</h2>

      <div className="stadium-filters">
        <input
          type="text"
          placeholder="Search by name, city, country"
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />

        <select value={selectedCountry} onChange={e => {
          setSelectedCountry(e.target.value);
          setCurrentPage(1);
        }}>
          <option value="">All Countries</option>
          {countries.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <label>
          <input type="checkbox" checked={floodlightOnly} onChange={() => setFloodlightOnly(f => !f)} />
          Floodlight only
        </label>

        <div className="capacity-range">
          <label>Min Capacity: {minCapacity}</label>
          <input type="range" min="0" max="100000" value={minCapacity}
            onChange={e => setMinCapacity(Number(e.target.value))} />

          <label>Max Capacity: {maxCapacity}</label>
          <input type="range" min="0" max="100000" value={maxCapacity}
            onChange={e => setMaxCapacity(Number(e.target.value))} />
        </div>

        <select value={sortKey} onChange={e => setSortKey(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="capacity">Sort by Capacity</option>
        </select>

        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {paginatedVenues.length === 0 ? (
        <p className="no-results">No stadiums found.</p>
      ) : (
        <>
          <div className="stadium-grid">
            {paginatedVenues.map(v => (
              <div className="stadium-card" key={v.id} onClick={() => setModalVenue(v)}>
                <img
                  src={v.image_path && !v.image_path.endsWith('sportmonks.com') ? v.image_path : images.stadium}
                  alt={v.name}
                />
                <h4>{v.name}</h4>
                <p>{v.city}, {getCountryName(v.country_id)}</p>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Previous</button>
            <span>Page {currentPage} of {Math.max(1, totalPages)}</span>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
          </div>
        </>
      )}

      {modalVenue && (
        <div className="modal" onClick={() => setModalVenue(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={() => setModalVenue(null)}>×</button>
            <h3>{modalVenue.name}</h3>
            <img src={modalVenue.image_path && !modalVenue.image_path.endsWith('sportmonks.com') ? modalVenue.image_path : images.stadium} alt={modalVenue.name} />
            <p><strong>City:</strong> {modalVenue.city}</p>
            <p><strong>Country:</strong> {getCountryName(modalVenue.country_id)}</p>
            <p><strong>Capacity:</strong> {modalVenue.capacity || 'Unknown'}</p>
            <p><strong>Floodlight:</strong> {modalVenue.floodlight ? 'Yes' : 'No'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stadiums;
