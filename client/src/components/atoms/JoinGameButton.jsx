import PropTypes from 'prop-types';
import {Button, useAccordionButton} from "react-bootstrap";

function JoinGameButton({ eventKey }) {
    const decoratedOnClick = useAccordionButton(eventKey, () =>
      console.log('totally custom!'),
    );
  
    return (
        <Button className='join-game-card-button' onClick={decoratedOnClick} variant="success" size="lg">
            Rejoindre une partie
        </Button>
    );
}

JoinGameButton.propTypes = {
    eventKey: PropTypes.string.isRequired,
  };

export default JoinGameButton;
  

