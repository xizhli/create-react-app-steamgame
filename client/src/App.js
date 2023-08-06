import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { indigo, amber } from '@mui/material/colors'
import { createTheme } from "@mui/material/styles";

import NavBar from './components/NavBar';
import AppMainPage from './pages/AppMainPage';
import DeveloperPage from './pages/DeveloperPage';
import RankingsPage from './pages/RankingsPage';

// createTheme enables you to customize the look and feel of your app past the default
// in this case, we only change the color scheme

// Create a custom color for your theme
const customColor = '#E769A6'; 


export const theme = createTheme({
  palette: {
    primary: {
      main: customColor,
    },
    secondary: amber,
  },
});

// App is the root component of our application and as children contain all our pages
// We use React Router's BrowserRouter and Routes components to define the pages for
// our application, with each Route component representing a page and the common
// NavBar component allowing us to navigate between pages (with hyperlinks)
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<AppMainPage />} /> 
          {<Route path="/Developer" element={<DeveloperPage />} /> }
          {<Route path='/Rankings' element={<RankingsPage/>}/>}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}