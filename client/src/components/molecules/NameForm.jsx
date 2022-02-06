import {useState} from "react";
import {Form, Button, Alert} from "react-bootstrap";

import { useLocalStorage } from '../../utils';

const isValid = (name) => {
    return name.trim().length >= 3;
}


function NameForm(props){

    const [playerName, setPlayerName] = useLocalStorage("playerName", null);
    console.log(playerName);
    const [formData, setFormData] = useState(
    {
        playerName: playerName || "",
        valid: isValid(playerName || ""),
        submitted: false
    });

    function handleChange(event){
        const name = event.target.value || "";

        setFormData({
            playerName: name,
            valid: isValid(name),
            submitted: false
        });
    }

    function dismissAlert(){
        setFormData({...formData, submitted: false});
    }

    function handleSubmit(event){
        event.preventDefault();

        if (!formData.valid){
            setFormData({...formData, submitted: true});
            return;
        }

        props.onSubmit(formData.playerName);
    }


    return(
        <Form onSubmit={handleSubmit}>
            <Alert show={!formData.valid && !!formData.submitted} variant="danger" onClose={dismissAlert} dismissible>
                <Alert.Heading>Votre nom doit faire au moins 3 caractères</Alert.Heading>
            </Alert>
            <Form.Group className="mb-3" controlId="playerName">
                <Form.Label>Entrez votre nom</Form.Label>
                <Form.Control type="text" placeholder="nom" value={formData.playerName} onChange={handleChange}/>
                <Form.Text className="text-muted">
                    Vous apparaitrai avec ce nom sur la page de jeu.
                </Form.Text>
            </Form.Group>
            <Button variant="primary" type="submit">
                Enregistrer
            </Button>
        </Form>
    )
}

export default NameForm;
        