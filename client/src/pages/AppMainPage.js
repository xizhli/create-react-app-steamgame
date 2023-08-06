import React, { useEffect, useState } from 'react';
import { Container, AppBar, Dialog, DialogContent, Grid, CircularProgress } from '@mui/material';
import config from '../config.json';

export default function AppMainPage() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isLoadingGames, setIsLoadingGames] = useState(true);

  useEffect(() => {
    setIsLoadingGames(true);
      fetch(`http://${config.server_host}:${config.server_port}/games`) 
      .then((res) => res.json())
      .then((data) => setGames(data))
      .then(() => setTimeout(() => {setIsLoadingGames(false)}, 1));
  }, []);

  const handleGameClick = (game) => {
    setSelectedGame(game);
  };

  const handleClosePopup = () => {
    setSelectedGame(null);
  };

  return (
    <div>
      <AppBar position="static">
      </AppBar>
      <Container>
        <h2>Games</h2>
        <Grid container spacing={3}>
          {isLoadingGames ? <CircularProgress /> : games.map((game) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={game.id}>
              <img
                src={game.Screenshots}
                alt={game.name}
                style={{ width: '100%', height: '85%', objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => handleGameClick(game)}
              />
               <p style={{ textAlign: 'center', fontSize: '12px', margin: '0', padding: '8px 0' }}>{game.name}</p>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Dialog open={selectedGame !== null} onClose={handleClosePopup} maxWidth="md" fullWidth>
        <DialogContent>
          {selectedGame && (
            <div>
              <h3>{selectedGame.name}</h3>
              <iframe
                title={selectedGame.name}
                width="100%"
                height="400"
                src={selectedGame.Movies} 
                allowFullScreen
              ></iframe>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}