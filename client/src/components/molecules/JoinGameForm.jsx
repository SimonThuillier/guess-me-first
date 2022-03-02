import PropTypes from 'prop-types';
import {useState} from "react";
import {Button, Accordion, Card, Form} from "react-bootstrap";
import { FaPaste } from 'react-icons/fa';
import JoinGameButton from "../atoms/JoinGameButton.jsx";

function JoinGameForm({ onSubmit }) {

    const [formData, setFormData] = useState({gameLink: null});
    const [pasteButtonVariant, setPasteButtonVariant] = useState("secondary");

    function handleChange(event){
        const gameLink = event.target.value || null;
        setFormData({gameLink: gameLink});
    }

    const onPasteButtonClick = () => {
        const onPasteSuccess = (text) => {
            console.log('Pasted content: ', text);
            setFormData({gameLink: text});
            setPasteButtonVariant("success");
            setTimeout(() => {
                setPasteButtonVariant("secondary");
              }, 800);
        }
        // pasting is hardly possible on somebrowsers including firefox
        // see https://developer.mozilla.org/fr/docs/Web/API/Clipboard
        const onPasteFail = (err) => {
            console.error('Failed to read clipboard contents: ', err);
            setPasteButtonVariant("danger"); 
            setTimeout(() => {
                setPasteButtonVariant("secondary");
              }, 800);
        }

        try {
            navigator.clipboard.readText()
            .then(onPasteSuccess)
            .catch(onPasteFail);
        }
        catch(err) {
            onPasteFail(err);
        }   
    }

    return (
        <Accordion defaultActiveKey="1">
            <Card>
                <Card.Header className="join-game-card-header">
                <JoinGameButton eventKey="0"/>
                </Card.Header>
                <Accordion.Collapse eventKey="0">
                <Card.Body>
                    <Form onSubmit={onSubmit}>
                        <Form.Group className="mb-3" controlId="gameLink">
                            <Form.Label>Entrez le lien d'invitation</Form.Label>
                            <Form.Control 
                            style={{display:"inline-block", "maxWidth": "85%"}}
                            type="text" 
                            placeholder="lien" 
                            value={formData.gameLink || ''} 
                            onChange={handleChange}/>
                            &nbsp;&nbsp;
                            <Button 
                            style={{transform:"translateY(-2px)", "msTransform":"translateY(-2px)"}}
                            title="Collez le lien" 
                            onClick={onPasteButtonClick} 
                            variant={pasteButtonVariant}>
                                <FaPaste/>
                            </Button>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Rejoindre cette partie
                        </Button>
                    </Form>

                    <small className="text-muted form-text">
                        Entrez un lien d'invitation à une partie
                    </small> 
                </Card.Body>
                </Accordion.Collapse>
            </Card>
    </Accordion>
    );
}

JoinGameForm.propTypes = {
    onSubmit: PropTypes.func.isRequired
};

export default JoinGameForm;