import { BrowserRouter, Route, Routes, useNavigate} from "react-router-dom"
import { hasValidPlayerName } from './utils.js';
import Home from './components/pages/Home'
import GameConfiguration from './components/pages/GameConfiguration'
import GameCreation from './components/pages/GameCreation'
import Game from './components/pages/Game'

import NotFound from './components/pages/NotFound'



function App() {
  // user must at least have set a valid name to access other pages
  if (window.location.pathname !== "/" && window.location.pathname !== "" && !hasValidPlayerName()) {
    window.location = "/";
    return <Home/>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Home/>} />
        <Route exact path="/game-configuration" element={<GameConfiguration/>} />
        <Route exact path="/new-game" element={<GameCreation/>} />
        <Route path="/game/*" element={<Game/>} />
        <Route exact path="/unknown-game" element={<NotFound game/>} />
        <Route path="*" element={<NotFound/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
