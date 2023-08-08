import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Dialog, DialogContent } from '@mui/material';
import { Select, MenuItem } from '@mui/material';

function GameAnalysisDashboard() {
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const [showTags, setShowTags] = useState(false);
    const [showGenres, setShowGenres] = useState(false);
    const [showCategories, setShowCategories] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [allGenres, setAllGenres] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [allCategories, setAllCategories] = useState([]);


    useEffect(() => {
        let url = `http://localhost:8080/allgames?page=${currentPage}&limit=${itemsPerPage}`;
        if (showTags) {
            url += '&showTags=true';
            if (selectedTags.length) {
                url += `&selectedTags=${selectedTags.join(',')}`;
            }
        }
        if (showGenres) {
            url += '&showGenres=true';
            if (selectedGenres.length) {
                url += `&selectedGenres=${selectedGenres.join(',')}`;
            }
        }
        if (showCategories) {
            url += '&showCategories=true';
            if (selectedCategories.length) {
                url += `&selectedCategories=${selectedCategories.join(',')}`;
            }
        }
        axios.get(url).then(response => {
            setGames(response.data);
        });
    }, [currentPage, showTags, showGenres, showCategories, selectedTags, selectedGenres, selectedCategories]);
    
    useEffect(() => {
        axios.get('http://localhost:8080/tags').then(response => {
            setAllTags(response.data);
        });
        axios.get('http://localhost:8080/genres').then(response => {
            setAllGenres(response.data);
        });
        axios.get('http://localhost:8080/categories').then(response => {
            setAllCategories(response.data);
        });
    }, []);


    const handleGameClick = (game) => {
        axios.get(`http://localhost:8080/gamedetails/${game.id}`).then(response => {
            setSelectedGame(response.data);
        });
    };    

    const handleClosePopup = () => {
        setSelectedGame(null);
    };

    const handleTagChange = (event) => {
        setSelectedTags(event.target.value);
    };

    const handleGenreChange = (event) => {
        setSelectedGenres(event.target.value);
    };
    
    const handleCategoryChange = (event) => {
        setSelectedCategories(event.target.value);
    };    

    return (
        <Container>
            <h2>Game Analysis Dashboard</h2>
            <button onClick={() => setShowTags(prevShow => !prevShow)}>
                Tag Analysis
            </button> 
            <button onClick={() => setShowGenres(prevShow => !prevShow)}>
                Genre Analysis
            </button>
            <button onClick={() => setShowCategories(prevShow => !prevShow)}>
                Category Analysis
            </button>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            {showTags && 
                                <TableCell>
                                    Tag
                                    <Select multiple value={selectedTags} onChange={handleTagChange}>
                                        {allTags.map(tag => (
                                            <MenuItem key={tag} value={tag}>
                                                {tag}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>}
                            {showGenres && 
                                <TableCell>
                                    Genre
                                    <Select multiple value={selectedGenres} onChange={handleGenreChange}>
                                        {allGenres.map(genre => (
                                            <MenuItem key={genre} value={genre}>
                                                {genre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>}
                            {showCategories && 
                                <TableCell>
                                    Category
                                    <Select multiple value={selectedCategories} onChange={handleCategoryChange}>
                                        {allCategories.map(category => (
                                            <MenuItem key={category} value={category}>
                                                {category}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {games.map(game => (
                            <TableRow key={game.id} onClick={() => handleGameClick(game)}>
                                <TableCell>{game.id}</TableCell>
                                <TableCell>{game.name}</TableCell>
                                {showTags && <TableCell>{game.Tag}</TableCell>}
                                {showGenres && <TableCell>{game.Genre}</TableCell>}
                                {showCategories && <TableCell>{game.Category}</TableCell>}
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
