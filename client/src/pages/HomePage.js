import { useEffect, useState } from 'react';
import { Container, Divider, Link } from '@mui/material';
import { NavLink } from 'react-router-dom';

import LazyTable from '../components/LazyTable';
const config = require('../config.json');

export default function HomePage() {
  // We use the setState hook to persist information across renders (such as the result of our API calls)
  const [gameOfTheDay, setGameOfTheDay] = useState({});

  const [selectedDev, setSelectedDev] = useState(null);

  // The useEffect hook by default runs the provided callback after every render
  // The second (optional) argument, [], is the dependency array which signals
  // to the hook to only run the provided callback if the value of the dependency array
  // changes from the previous render. In this case, an empty array means the callback
  // will only run on the very first render.
  useEffect(() => {
    // Fetch request to get the song of the day. Fetch runs asynchronously.
    // The .then() method is called when the fetch request is complete
    // and proceeds to convert the result to a JSON which is finally placed in state.
    fetch(`http://${config.server_host}:${config.server_port}/random`)
      .then(res => res.json())
      .then(resJson => setGameOfTheDay(resJson[0]['name']));
  }, []);

  // Here, we define the columns of the "Top Songs" table. The songColumns variable is an array (in order)
  // of objects with each object representing a column. Each object has a "field" property representing
  // what data field to display from the raw data, "headerName" property representing the column label,
  // and an optional renderCell property which given a row returns a custom JSX element to display in the cell.
  const devColumns = [
    {
      field: 'Developer',
      headerName: 'Name of Developers',
      //renderCell: (row) => <Link onClick={() => setSelectedDev(row[0].Developer)}>{row[0].Developer}</Link> // A Link component is used just for formatting purposes
    },
    {
      field: 'Count',
      headerName: 'Count',
      
    }

  ];

  // TODO (TASK 15): define the columns for the top albums (schema is Album Title, Plays), where Album Title is a link to the album page
  // Hint: this should be very similar to songColumns defined above, but has 2 columns instead of 3
  // Hint: recall the schema for an album is different from that of a song (see the API docs for /top_albums). How does that impact the "field" parameter and the "renderCell" function for the album title column?
  const pubColumns = [
    {
      field: 'Publisher',
      headerName: 'Name of Publishers',
      //renderCell: (row) => <NavLink to={`/album/${row.album_id}`}>{row.title}</NavLink>
    },
    {
      field: 'Count',
      headerName: 'Count',
    }
  ]
  
  return (
    <Container>
      {/* SongCard is a custom component that we made. selectedSongId && <SongCard .../> makes use of short-circuit logic to only render the SongCard if a non-null song is selected */}
      <h2>Check out your song of the day:&nbsp;
      {String(gameOfTheDay)}
      </h2>
      <Divider />
      <h2>Top Songs</h2>
      <LazyTable route={`http://${config.server_host}:${config.server_port}/top_developers`} columns={devColumns} />
      <Divider />
      <h2>Top Albums</h2>
      {/* TODO (TASK 16): add a h2 heading, LazyTable, and divider for top albums. Set the LazyTable's props for defaultPageSize to 5 and rowsPerPageOptions to [5, 10] */}
      {/* TODO (TASK 17): add a paragraph (<p>text</p>) that displays the value of your author state variable from TASK 13 */}
      <LazyTable
        route={`http://${config.server_host}:${config.server_port}/top_publishers`}
        columns={pubColumns}
        defaultPageSize={5}
        rowsPerPageOptions={[5, 10]}
      />
      <Divider />
    </Container>
  );
};