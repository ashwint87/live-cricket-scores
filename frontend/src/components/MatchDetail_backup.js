import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTossWinnerName, getTossDecision, matchYear } from './../utils/matchUtils';
import axios from 'axios';
import MatchDetailTabs from './MatchDetailTabs';

export default function MatchDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const fetchMatchInfo = async () => {
      try {
        const res = await fetch(`/api/match/${id}`);
        const data = await res.json();
        setInfo(data.data);
      } catch (err) {
        console.error('Error fetching match info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchInfo();
  }, [id]);

  const formattedDate = (input) => {
    if (!input) return 'N/A';
    try {
      return new Date(input).toLocaleString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div>
      <h1>Match Detail</h1>

      {info?.localteam?.name && info?.visitorteam?.name && (
        <p><strong>Teams:</strong> {info?.localteam?.name} vs {info?.visitorteam?.name}</p>
      )}
      {info?.stage?.name && (
        <p><strong>Series:</strong> {info?.stage?.name} {matchYear(info)}</p>
      )}
      {info?.round && (
        <p><strong>Match Round:</strong> {info?.round}</p>
      )}
      {info?.starting_at && (
        <p><strong>Match Date & Time:</strong> {formattedDate(info?.starting_at)}</p>
      )}
      {info?.toss_won_team_id && info?.elected && (
        <p><strong>Toss:</strong> {getTossWinnerName(info)} won the toss and elected to {getTossDecision(info)}</p>
      )}
      {info?.firstumpire?.fullname && info?.secondumpire?.fullname && info?.tvumpire?.fullname && (
        <p><strong>Umpires:</strong> {info?.firstumpire?.fullname}, {info?.secondumpire?.fullname}, {info?.tvumpire?.fullname} (TV Umpire)</p>
      )}
      {info?.referee?.fullname && (
        <p><strong>Match Referee:</strong> {info?.referee?.fullname}</p>
      )}
      {info?.venue?.name && info?.venue?.city  && (
        <p><strong>Venue:</strong> {info?.venue?.name}, {info?.venue?.city} (Stadium Capacity: {info?.venue?.capacity})</p>
      )}
      {info?.note && (
        <p><strong>Match Status:</strong> {info?.note}</p>
      )}
      {info?.manofmatch?.fullname && (
        <p><strong>Man of the Match:</strong> {info?.manofmatch?.fullname}</p>
      )}
      {info?.manofseries?.fullname && (
        <p><strong>Man of the Series:</strong> {info?.manofseries?.fullname}</p>
      )}

      <MatchDetailTabs matchId={id} matchInfo={info} />
    </div>
  );
}
