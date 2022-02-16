import { BrowserRouter, Route, Routes, useNavigate} from "react-router-dom"
import { hasValidPlayerName } from './utils.js'
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
        <Route exact path="/" element={<Home></Home>} />
        <Route exact path="/game-configuration" element={<GameConfiguration></GameConfiguration>} />
        <Route exact path="/new-game" element={<GameCreation></GameCreation>} />
        <Route path="/game/*" element={<Game></Game>} />
        <Route path="*" element={<NotFound></NotFound>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
