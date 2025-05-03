import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('light');

  const API_KEY = process.env.REACT_APP_CRICAPI_KEY;
  const API_URL = `https://api.cricapi.com/v1/currentMatches?apikey=${API_KEY}&offset=0`;

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL);
        
        if (response.data?.status === "success" && Array.isArray(response.data.data)) {
          setMatches(response.data.data.filter(match => match.score?.length > 0));
        } else {
          throw new Error(response.data?.reason || 'Invalid data format');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
    const interval = setInterval(fetchMatches, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTeamScore = (match, team) => {
    const score = match.score?.find(s => 
      s.inning?.includes(team) || s.battingTeam === team
    );
    return score || { r: 0, w: 0, o: 0 };
  };

  const renderMatchCard = (match) => {
    const team1 = match.teamInfo?.[0]?.shortname || match.teams?.[0] || 'Team 1';
    const team2 = match.teamInfo?.[1]?.shortname || match.teams?.[1] || 'Team 2';
    const score1 = getTeamScore(match, team1);
    const score2 = getTeamScore(match, team2);

    return (
      <div key={match.id} className="match-card">
        <h3>{match.name || 'Live Match'}</h3>
        <p>{match.status || 'In Progress'}</p>
        <div>
          <p>{team1}: {score1.r}/{score1.w} ({score1.o?.toFixed(1) || '0.0'} ov)</p>
          <p>{team2}: {score2.r}/{score2.w} ({score2.o?.toFixed(1) || '0.0'} ov)</p>
        </div>
      </div>
    );
  };

  return (
    <div className={`app ${theme}`}>
      <header>
        <h1>Live Cricket Scores</h1>
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>
      
      <main>
        {loading && <div>Loading...</div>}
        {error && <div>Error: {error}</div>}
        {!loading && !error && (
          <div>
            {matches.length > 0 ? (
              matches.map(renderMatchCard)
            ) : (
              <div>No live matches</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;