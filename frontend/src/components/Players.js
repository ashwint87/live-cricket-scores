import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './css/Players.css';

const PLAYERS_JSON_URL = 'https://raw.githubusercontent.com/ashwint87/cricket-website/master/players.json';
const PAGE_SIZE = 30;

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedBatStyle, setSelectedBatStyle] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [sort, setSort] = useState('');

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCountry('India');
    setSelectedBatStyle('');
    setSelectedPosition('');
    setSort('');
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      const res = await fetch(PLAYERS_JSON_URL);
      const json = await res.json();
      const flat = Array.isArray(json?.data) ? json.data : json.data.flat();
      setPlayers(flat);
      setFilteredPlayers(flat);
    };
    fetchPlayers();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    const filtered = players.filter(p => {
      const fullName = `${p.firstname} ${p.lastname}`.toLowerCase();
      const countryMatch = selectedCountry ? p.country?.name === selectedCountry : true;
      const batMatch = selectedBatStyle ? p.battingstyle === selectedBatStyle : true;
      const posMatch = selectedPosition ? p.position?.name === selectedPosition : true;
      return fullName.includes(term) && countryMatch && batMatch && posMatch;
    });
    let sorted = [...filtered];
    if (sort === 'name_asc') {
      sorted.sort((a, b) => a.fullname.localeCompare(b.fullname));
    } else if (sort === 'name_desc') {
      sorted.sort((a, b) => b.fullname.localeCompare(a.fullname));
    }
    setFilteredPlayers(sorted);
    setCurrentPage(0); // reset to first page on filter change
  }, [search, selectedCountry, selectedBatStyle, selectedPosition, sort, players]);

  const currentPlayers = filteredPlayers.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filteredPlayers.length / PAGE_SIZE);

  return (
    <div className="players-list-container">
      <h2>Players</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
          <option value="">All Countries</option>
          {[...new Set(players.map(p => p.country?.name).filter(Boolean))].sort().map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select value={selectedBatStyle} onChange={(e) => setSelectedBatStyle(e.target.value)}>
          <option value="">Batting Style</option>
          {[...new Set(players.map(p => p.battingstyle).filter(Boolean))].sort().map(style => (
            <option key={style}>{style}</option>
          ))}
        </select>

        <select value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)}>
          <option value="">Position</option>
          {[...new Set(players.map(p => p.position?.name).filter(Boolean))].sort().map(pos => (
            <option key={pos}>{pos}</option>
          ))}
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort</option>
          <option value="name_asc">Name A-Z</option>
          <option value="name_desc">Name Z-A</option>
        </select>

        <button className="reset-filters" onClick={handleResetFilters}>Reset Filters</button>
      </div>

      <div className="players-grid">
        {currentPlayers.map(player => (
          <Link to={`/player/${player.id}`} className="player-card" key={player.id}>
            <img src={player.image_path} alt={player.fullname} />
            <h4>{player.fullname}</h4>
            <p>{player.country?.name}</p>
            <p>{player.position?.name}</p>
          </Link>
        ))}
      </div>

      <div className="pagination">
        <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>Previous</button>
        <span>{currentPage + 1} / {totalPages}</span>
        <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
      </div>
    </div>
  );
}
