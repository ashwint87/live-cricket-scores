import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getPlayerName, renderPlayerNameLink } from './../../utils/playerUtils';

export default function SquadTab({ matchId, matchInfo }) {
  const [localTeam, setLocalTeam] = useState({});
  const [visitorTeam, setVisitorTeam] = useState({});
  const [localLineup, setLocalLineup] = useState([]);
  const [visitorLineup, setVisitorLineup] = useState([]);

  const data = matchInfo || {};
  const lineup = data.lineup || [];

  const local = {
    id: data.localteam_id,
    name: data.localteam?.name,
    code: data.localteam?.code,
    image: data.localteam?.image_path
  };

  const visitor = {
    id: data.visitorteam_id,
    name: data.visitorteam?.name,
    code: data.visitorteam?.code,
    image: data.visitorteam?.image_path,
  };

  const localPlayers = lineup.slice(0, 11);
  const visitorPlayers = lineup.slice(11, 22);

useEffect(() => {
  const cacheKey = `squad_${matchId}`;
  const cached = localStorage.getItem(cacheKey);
  if (!matchInfo?.lineup?.length && cached) {
    const parsed = JSON.parse(cached);
    setLocalTeam(parsed.local);
    setVisitorTeam(parsed.visitor);
    setLocalLineup(parsed.localLineup);
    setVisitorLineup(parsed.visitorLineup);
    return;
  }

  const result = { local, visitor, localLineup: localPlayers, visitorLineup: visitorPlayers };
  localStorage.setItem(cacheKey, JSON.stringify(result));

  setLocalTeam(local);
  setVisitorTeam(visitor);
  setLocalLineup(localPlayers);
  setVisitorLineup(visitorPlayers);
}, [matchInfo]);

  if (!matchInfo) return <div>No lineup available at the moment.</div>;

  return (
    <div>
      <h3>Line-ups</h3>

      <div>
        <h4>{localTeam.name}</h4>
        {localLineup.map((player) => (
          <div key={player.id}>
            {renderPlayerNameLink(player.id, lineup)} ({player.position?.name})
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4>{visitorTeam.name}</h4>
        {visitorLineup.map((player) => (
          <div key={player.id}>
            {renderPlayerNameLink(player.id, lineup)} ({player.position?.name})
          </div>
        ))}
      </div>
    </div>
  );
}
