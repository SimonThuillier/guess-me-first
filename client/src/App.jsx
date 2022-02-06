import { BrowserRouter, Route, Routes} from "react-router-dom"

import { useLocalStorage } from './utils.js'
import Home from './components/pages/Home'
import Game from './components/pages/Game'

function App() {
  const [playerName, setPlayerName] = useLocalStorage("playerName", null);

  // user must at least have set a name in to view the game 
  if (window.location.pathname !== "/" && window.location.pathname !== "" && playerName === null) {
    console.log(window.location);
    window.location = "/";
  }



  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Home></Home>} />
        <Route exact path="/game" element={<Game></Game>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
