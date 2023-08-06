import { AppBar, Container, Toolbar, Typography } from '@mui/material'
import { NavLink } from 'react-router-dom';

// The hyperlinks in the NavBar contain a lot of repeated formatting code so a
// helper component NavText local to the file is defined to prevent repeated code.
function NavText({ href, text, isMain }) {
  return (
    <Typography
      variant={isMain ? 'h5' : 'h7'}
      noWrap
      style={{
        marginRight: '30px',
        fontFamily: 'Arial',
        fontWeight: 700,
        letterSpacing: '.1rem',
      }}
    >
      <NavLink
        to={href}
        style={{
          color: 'inherit',
          textDecoration: 'none',
        }}
      >
        {text}
      </NavLink>
    </Typography>
  )
}

// Here, we define the NavBar. Note that we heavily leverage MUI components
// to make the component look nice. Feel free to try changing the formatting
// props to how it changes the look of the component.
export default function NavBar() {
  return (
    <AppBar position='static' style={{backgroundColor: '#171d25'}}>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          {/* Include the logo image here */}
          <img
            src={`${process.env.PUBLIC_URL}/logo.png`}
            alt='Steam Game Logo'
            style={{ width: '150px', marginRight: '10px' }}
          />
          <NavText href='/' text='SteamGame' isMain />
          <NavText href='/Developer' text='Developer Insight' />
          <NavText href='/Rankings' text='Rankings' />
        </Toolbar>
      </Container>
    </AppBar>
  );
}

