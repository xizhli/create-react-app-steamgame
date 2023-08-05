import React, { useEffect, useState } from 'react';
import { Container, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Dialog, DialogContent } from '@mui/material';
import config from '../config.json';

export default function TopDeveloperPage() {
  const [developers, setDevelopers] = useState([]);
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  const [developerGames, setDeveloperGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedGameReviews, setSelectedGameReviews] = useState([]); 

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/top_developers`)
      .then((res) => res.json())
      .then((data) => setDevelopers(data));
  }, []);

  const handleDeveloperSelect = (developer) => {
    setSelectedDeveloper(developer);
    setSelectedGame(null); // Clear selected game when a new developer is selected
    fetch(`http://${config.server_host}:${config.server_port}/developer_games/${developer.Developer}`)
      .then((res) => res.json())
      .then((data) => setDeveloperGames(data));
  };

  const handleGameClick = async (game) => {
    setSelectedGame(game);
    fetch(`http://${config.server_host}:${config.server_port}/reviews/${game.id}`)
        .then((res) => res.json())
        .then((data) => setSelectedGameReviews(data));
  };

  const handleClosePopup = () => {
    setSelectedGame(null);
    // setSelectedGameReviews(null)
  };

  return (
    <Container>
      <h2>Select Your Favorite Developer</h2>
      <select onChange={(e) => handleDeveloperSelect(JSON.parse(e.target.value))}
        style={{ minWidth: '400px', width: '100%', height: '40px'  }}>
        <option value={null}>Select a Developer</option>
        {developers.map((developer) => (
          <option key={developer.Developer} value={JSON.stringify(developer)}>
            {developer.Developer}
          </option>
        ))}
      </select>
      {selectedDeveloper && (
        <div>
          <h3>{selectedDeveloper.Developer}</h3>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Total Hours Played</TableCell>
                  <TableCell>Total # of Recommendation</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {developerGames.map((game, index) => (
                  <TableRow key={game.id} onClick={() => handleGameClick(game)}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <img
                        src={game.Screenshots}
                        alt={game.name}
                        style={{ width: '80px', height: '40px' }}
                      />
                    </TableCell>
                    <TableCell>{game.name}</TableCell>
                    <TableCell>{game.TotalHoursPlayed}</TableCell>
                    <TableCell>{game.NumOfThumbsUp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
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
              <h4>Reviews:</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead style={{ textAlign: 'left', borderBottom: '1px solid lightgray' }}>
                    <tr>
                    <th style={{ padding: '8px', maxWidth: '300px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>Review</th>
                    <th style={{ padding: '8px' }}>Score</th>
                    <th style={{ padding: '8px' }}>Votes</th>
                    </tr>
                </thead>
                <tbody>
                  {selectedGameReviews.map((review) => (
                    <tr key={review.id}>
                      <td style={{ padding: '8px', maxWidth: '300px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {review.text}
                      </td>
                      <td style={{ padding: '8px' }}>{review.score}</td>
                      <td style={{ padding: '8px' }}>{review.votes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}