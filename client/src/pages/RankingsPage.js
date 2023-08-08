import { useEffect, useState } from 'react';
import { Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField, FormGroup, FormControl, InputLabel,OutlinedInput, MenuItem} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { DataGrid } from '@mui/x-data-grid';


const config = require('../config.json');

export default function Rankings() {


  const[age, setAge] = useState([0,26]);
  const[price, setPrice] = useState([0, 999]);
  //const[hoursPlayed, setHp] = useState([0,999])

  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);

  const [gameName, setGameName] = useState('');

  const [include_recommendation, setRecc] = useState(false);

  //const [recBool, setRecBool] = useState(0);

  const [include_reviews, setRev] = useState(false);

  //const[revBool, setRevBool] = useState(0);

  const [rec_threshold, setRecThres] = useState(0.8);

  const [rev_threshold, setRevThres] = useState(0.5);



const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const [tagName, setTagName] = useState([]);
const [t_names, setT_Names] = useState([]);

const[genreName, setGenreName] = useState([]);
const[g_names, setG_Names] = useState([]);

const[categoryName, setCatName] = useState([]);
const[c_names, setC_Names] = useState([]);

useEffect(() => {
  fetch(`http://${config.server_host}:${config.server_port}/getTags`)
    .then(res => res.json())
    .then(resJson =>
      {const tag_lst = [];
      for(var i in resJson)
         tag_lst.push(resJson[i]['Tag']);
         //console.log(tag_lst);
      setT_Names(tag_lst);
    });
}, []);

useEffect(() => {
  fetch(`http://${config.server_host}:${config.server_port}/getGenres`)
    .then(res => res.json())
    .then(resJson =>
      {const genre_lst = [];
      for(var i in resJson)
         genre_lst.push(resJson[i]['Genre']);
      setG_Names(genre_lst);
    });
}, []);

useEffect(() => {
  fetch(`http://${config.server_host}:${config.server_port}/getCategories`)
    .then(res => res.json())
    .then(resJson =>
      {const cat_lst = [];
      for(var i in resJson)
         cat_lst.push(resJson[i]['Category']);
      setC_Names(cat_lst);
    });
}, []);


  
  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/search_games`)
      .then(res => res.json())
      .then(resJson => {
        const gamesWithId = resJson.map((game) => ({ id: game.id, ...game }));
        setData(gamesWithId);
      });
  }, []);

  const search = () => {
    /*
    fetch(`http://${config.server_host}:${config.server_port}/search_games?age_low=${age[0]}` +
      `&age_high=${age[1]}&price_low=${price[0]}&price_high=${price[1]}&hoursPlayed_low=${hoursPlayed[0]}&hoursPlayed_high=${hoursPlayed[1]}` +
      `&include_recommendation=${include_recommendation}&include_reviews=${include_reviews}&recBool=${recBool}&revBool=${revBool}&gameName=${gameName}` 
    )*/
    fetch(`http://${config.server_host}:${config.server_port}/search_games?age_low=${age[0]}` +
    `&age_high=${age[1]}&price_low=${price[0]}&price_high=${price[1]}&gameName=${gameName}` +
    `&include_recommendation=${include_recommendation}&include_reviews=${include_reviews}&rec_threshold=${rec_threshold}&rev_threshold=${rev_threshold}` +
    `&Tags=${tagName}&Genres=${genreName}&Categories=${categoryName}`
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
    {field: 'id', headerName: 'GameId', flex:1},
    {field: 'name', headerName: 'Name', flex:1},
    //{field: 'price', headerName: 'Price'},
    //{field: 'age', headerName: 'Age'},
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
          <TextField label='Name' value={gameName} onChange={(e) => setGameName(e.target.value)} style={{ width: "100%" }}/>
        </Grid>
        <Grid item xs={4}>
          <FormGroup>
          <FormControlLabel
            label='Recommended(will override)'
            control={<Checkbox checked={include_recommendation} onChange={(e) => setRecc(e.target.checked)} />}
          />
          <FormControlLabel
          label = 'Reviewed(will override)'
          control={<Checkbox checked={include_reviews} onChange={(e) => setRev(e.target.checked)} />}
          />
          </FormGroup>
        </Grid>
        <Grid>
        <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel>Tags</InputLabel>
        <Select
          multiple
          value={tagName}
          onChange={(e) => {
            const {
              target: { value },
            } = e;
            setTagName(
              // On autofill we get a stringified value.
              typeof value === 'string' ? value.split(',') : value,
            );
          } }
          //input={<OutlinedInput label="Tags" />}
          MenuProps={MenuProps}
        >
          {t_names.map((name) => (
            <MenuItem
              key={name}
              value={name}
            >
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
        </Grid>
        <Grid>
        <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel>Genre</InputLabel>
        <Select
          multiple
          value={genreName}
          onChange={(e) => {
            const {
              target: { value },
            } = e;
            setGenreName(
              // On autofill we get a stringified value.
              typeof value === 'string' ? value.split(',') : value,
            );
          } }
          //input={<OutlinedInput label="Tags" />}
          MenuProps={MenuProps}
        >
          {g_names.map((name) => (
            <MenuItem
              key={name}
              value={name}
            >
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
        </Grid>
        <Grid>
        <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel>Category</InputLabel>
        <Select
          multiple
          value={categoryName}
          onChange={(e) => {
            const {
              target: { value },
            } = e;
            setCatName(
              typeof value === 'string' ? value.split(',') : value,
            );
          } }
          //input={<OutlinedInput label="Tags" />}
          MenuProps={MenuProps}
        >
          {c_names.map((name) => (
            <MenuItem
              key={name}
              value={name}
            >
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
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
        <Grid item xs ={6}>
          <p>Recommendation Threshold</p>
          <Slider
          value = {rec_threshold}
          min = {0}
          max = {1}
          step = {0.1}
          onChange ={(e, newValue)=> setRecThres(newValue)}
          valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={6}>
          <p>Reviewed Threshold</p>
          <Slider
          value = {rev_threshold}
          min = {0}
          max = {1}
          step = {0.1}
          onChange ={(e, newValue)=> setRevThres(newValue)}
          valueLabelDisplay='auto'
          />
        </Grid>
      </Grid>
      <Button onClick={() => search() } style={{ left: '50%', transform: 'translateX(-50%)' }}>
        Search
      </Button>
      <h2>Results</h2>
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