import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GameAnalysisDashboard() {
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [page, setPage] = useState(1); // New state for tracking current page

    useEffect(() => {
        axios.get(`http://localhost:8080/allgames?page=${page}`).then(response => {
            setGames(response.data);
        });
    }, [page]); // Add page to the dependency array

    const handleGameClick = (gameId) => {
        axios.get(`http://localhost:8080/gamedetails/${gameId}`).then(response => {
            setSelectedGame(response.data);
        });
    };

    return (
        <div className="game-analysis-dashboard">
            <h2>Game Analysis Dashboard</h2>
            <ul>
                {games.map(game => (
                    <li key={game.id} onClick={() => handleGameClick(game.id)}>
                        {game.name}
                    </li>
                ))}
            </ul>
            
            {/* Pagination controls */}
            <button onClick={() => setPage(prev => Math.max(prev - 1, 1))}>Previous</button>
            <button onClick={() => setPage(prev => prev + 1)}>Next</button>

            {selectedGame && (
                <div className="game-details">
                    <h2>Game Analysis Dashboard</h2>
                    {selectedGame.Screenshots && (
                        <img 
                            src={selectedGame.Screenshots.split(',')[0]} 
                            alt="Game Screenshot" 
                            style={{ width: '300px', height: 'auto' }} 
                        />
                    )}
                    <h3>{selectedGame.name}</h3>
                    <p>ID: {selectedGame.id}</p>
                    <p>Price: {selectedGame.price}</p>
                    <p>Genre: {selectedGame.Genre}</p>
                    <p>Tag: {selectedGame.Tag}</p>
                    <p>Release Date: {selectedGame.releaseDate}</p>
                    <p>Category: {selectedGame.Category}</p>
                    <p>Score: {selectedGame.score}</p>
                    <p>Votes: {selectedGame.votes}</p>
                </div>
            )}
        </div>
    );
}

export default GameAnalysisDashboard;
