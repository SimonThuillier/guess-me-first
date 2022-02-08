import { BrowserRouter, Route, Routes, useNavigate} from "react-router-dom"
import { hasValidPlayerName } from './utils.js'
import Home from './components/pages/Home'
import GameConfiguration from './components/pages/GameConfiguration'
import Game from './components/pages/Game'



function App() {
  // user must at least have set a valid name to access other pages
  if (window.location.pathname !== "/" && window.location.pathname !== "" && !hasValidPlayerName()) {
    //window.location = "/";
    useNavigate().push("/");
    return <Home></Home>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Home></Home>} />
        <Route exact path="/game-configuration" element={<GameConfiguration></GameConfiguration>} />
        <Route exact path="/game" element={<Game></Game>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
