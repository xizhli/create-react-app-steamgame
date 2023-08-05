import { useEffect, useState } from 'react';
import { Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import SongCard from '../components/SongCard';
import { formatDuration } from '../helpers/formatter';
const config = require('../config.json');

export default function SongsPage() {


  const[age, setAge] = useState([0,26]);
  const[price, setPrice] = useState([0, 999]);
  const[hoursPlayed, setHp] = useState([0,999])

  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [selectedSongId, setSelectedSongId] = useState(null);

  const [title, setTitle] = useState('');


  const [include_recommendation, setExplicit] = useState(false);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/search_games`)
      .then(res => res.json())
      .then(resJson => {
        const gamesWithId = resJson.map((game) => ({ id: game.id, ...game }));
        setData(gamesWithId);
      });
  }, []);

  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/search_games?age_low=${age[0]}` +
      `&age_high=${age[1]}&price_low=${price[0]}&price_high=${price[1]}&hoursPlayed_low=${hoursPlayed[0]}&hoursPlayed_high=${hoursPlayed[1]}` 
    )
      .then(res => res.json())
      .then(resJson => {
        // DataGrid expects an array of objects with a unique id.
        // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
        const gamesWithId_2 = resJson.map((game) => ({ id: game.id, ...game }));
        setData(gamesWithId_2);
      } );
  }

  // This defines the columns of the table of songs used by the DataGrid component.
  // The format of the columns array and the DataGrid component itself is very similar to our
  // LazyTable component. The big difference is we provide all data to the DataGrid component
  // instead of loading only the data we need (which is necessary in order to be able to sort by column)
  const columns = [
    {field: 'id', headerName: 'GameId'},
    {field: 'name', headerName: 'Name'},
    {field: 'price', headerName: 'Price'},
    {field: 'age', headerName: 'Age'},
    //{field: 'hoursPlayed', headerName: 'HoursPlayed'},
    //{field: 'reviews', headerName: 'reviews'}
  ]

  // This component makes uses of the Grid component from MUI (https://mui.com/material-ui/react-grid/).
  // The Grid component is super simple way to create a page layout. Simply make a <Grid container> tag
  // (optionally has spacing prop that specifies the distance between grid items). Then, enclose whatever
  // component you want in a <Grid item xs={}> tag where xs is a number between 1 and 12. Each row of the
  // grid is 12 units wide and the xs attribute specifies how many units the grid item is. So if you want
  // two grid items of the same size on the same row, define two grid items with xs={6}. The Grid container
  // will automatically lay out all the grid items into rows based on their xs values.
  return (
    <Container>
      <h2>Search Game</h2>
      <Grid container spacing={6}>
        <Grid item xs={8}>
          <TextField label='Name' value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%" }}/>
        </Grid>
        <Grid item xs={4}>
          <FormControlLabel
            label='Include Recommendations'
            control={<Checkbox checked={include_recommendation} onChange={(e) => setExplicit(e.target.checked)} />}
          />
        </Grid>
        <Grid item xs={6}>
          <p>Age</p>
          <Slider
            value={age}
            min={0}
            max={26}
            step={1}
            onChange={(e, newValue) => setAge(newValue)}
            valueLabelDisplay='auto'
            //valueLabelFormat={value => <div>{formatDuration(value)}</div>}
          />
        </Grid>
        <Grid item xs={6}>
          <p>Price </p>
          <Slider
            value={price}
            min={0}
            max={999}
            step={0.1}
            onChange={(e, newValue) => setPrice(newValue)}
            valueLabelDisplay='auto'
            //valueLabelFormat={value => value.toFixed(2)}
            //valueLabelFormat={value => <div>{value / 1000000}</div>}
          />
        </Grid>
        {/* TODO (TASK 24): add sliders for danceability, energy, and valence (they should be all in the same row of the Grid) */}
        {/* Hint: consider what value xs should be to make them fit on the same row. Set max, min, and a reasonable step. Is valueLabelFormat is necessary? */}
        <Grid item xs={6}>
          <p>HoursPlayed</p>
          <Slider
            value={hoursPlayed}
            min={0}
            max={999}
            step={0.1}
            onChange={(e, newValue) => setHp(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
      </Grid>
      <Button onClick={() => search() } style={{ left: '50%', transform: 'translateX(-50%)' }}>
        Search
      </Button>
      <h2>Results</h2>
      {/* Notice how similar the DataGrid component is to our LazyTable! What are the differences? */}
      <DataGrid
        rows={data}
        columns={columns}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        autoHeight
      />
    </Container>
  );
}