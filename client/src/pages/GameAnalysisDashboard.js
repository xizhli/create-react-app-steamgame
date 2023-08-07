import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Dialog, DialogContent } from '@mui/material';

function GameAnalysisDashboard() {
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const [showTags, setShowTags] = useState(false);

    useEffect(() => {
        let url = `http://localhost:8080/allgames?page=${currentPage}&limit=${itemsPerPage}`;
        if (showTags) {
            url += '&showTags=true';
        }
        axios.get(url).then(response => {
            setGames(response.data);
        });
    }, [currentPage, showTags]);
    

    const handleGameClick = (game) => {
        axios.get(`http://localhost:8080/gamedetails/${game.id}`).then(response => {
            setSelectedGame(response.data);
        });
    };    

    const handleClosePopup = () => {
        setSelectedGame(null);
    };

    return (
        <Container>
            <h2>Game Analysis Dashboard</h2>
            <button onClick={() => setShowTags(prevShow => !prevShow)}>
                Tag Analysis
            </button> 
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            {showTags && <TableCell>Tag</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {games.map(game => (
                            <TableRow key={game.id} onClick={() => handleGameClick(game)}>
                                <TableCell>{game.id}</TableCell>
                                <TableCell>{game.name}</TableCell>
                                {showTags && <TableCell>{game.Tag}</TableCell>}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            
            <button onClick={() => setCurrentPage(prevPage => Math.max(prevPage - 1, 1))}>
                Previous
            </button>
            <button onClick={() => setCurrentPage(prevPage => prevPage + 1)}>
                Next
            </button>

            <Dialog open={selectedGame !== null} onClose={handleClosePopup} maxWidth="md" fullWidth>
                <DialogContent>
                    {selectedGame && (
                        <div>
                            <img 
                                src={selectedGame.Screenshots.split(',')[0]} 
                                alt="Game Screenshot" 
                                style={{ width: '300px', height: 'auto' }} 
                            />
                            <h3>{selectedGame.name}</h3>
                            <p>ID: {selectedGame.id}</p>
                            <p>Price: {selectedGame.price}</p>
                            <p>Genre: {selectedGame.Genre}</p>
                            <p>Tag: {selectedGame.Tag}</p>
                            <p>Release Date: {selectedGame.releaseDate}</p>
                            <p>Category: {selectedGame.Category}</p>
                            <p>Average Score: {selectedGame.average_score}</p>
                            <p>Total Votes: {selectedGame.total_votes}</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Container>
    );
}

export default GameAnalysisDashboard;
