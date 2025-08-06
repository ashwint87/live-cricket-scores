import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './../css/Players.css';

export default function TeamPlayers({ teamName, teamPlayers }) {
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedBatStyle, setSelectedBatStyle] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [sort, setSort] = useState('');

  const PAGE_SIZE = 30;

  const handleResetFilters = () => {
    setSearch('');
    setSelectedBatStyle('');
    setSelectedPosition('');
    setSort('');
  };

  useEffect(() => {
    const term = search.toLowerCase();
    const filtered = teamPlayers.filter(p => {
      const fullName = `${p.firstname} ${p.lastname}`.toLowerCase();
      const batMatch = selectedBatStyle ? p.battingstyle === selectedBatStyle : true;
      const posMatch = selectedPosition ? p.position?.name === selectedPosition : true;
      return fullName.includes(term) && batMatch && posMatch;
    });
    let sorted = [...filtered];
    if (sort === 'name_asc') {
      sorted.sort((a, b) => a.fullname.localeCompare(b.fullname));
    } else if (sort === 'name_desc') {
      sorted.sort((a, b) => b.fullname.localeCompare(a.fullname));
    }
    setFilteredPlayers(sorted);
    setCurrentPage(0); // reset to first page on filter change
  }, [search, selectedBatStyle, selectedPosition, sort, teamPlayers]);

  const currentPlayers = filteredPlayers.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filteredPlayers.length / PAGE_SIZE);

  return (
    <div className="players-list-container">
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={selectedBatStyle} onChange={(e) => setSelectedBatStyle(e.target.value)}>
          <option value="">Batting Style</option>
          {[...new Set(teamPlayers.map(p => p.battingstyle).filter(Boolean))].sort().map(style => (
            <option key={style}>{style}</option>
          ))}
        </select>

        <select value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)}>
          <option value="">Position</option>
          {[...new Set(teamPlayers.map(p => p.position?.name).filter(Boolean))].sort().map(pos => (
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
