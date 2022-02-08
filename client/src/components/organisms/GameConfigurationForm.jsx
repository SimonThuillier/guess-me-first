import {useState} from "react";
import PropTypes from 'prop-types';
import {Form, Button} from "react-bootstrap";

const isValid = (data) => {
    return true;
}


function GameConfigurationForm(props){

    const [formData, setFormData] = useState(Object.assign({}, props.initialData, {submitted: false}));

    const handleChange = (key) => (event) =>{
        const newFormData = {...formData, [key]: event.target.value};
        setFormData(newFormData);
    }

    function handleSubmit(event){
        event.preventDefault();
        props.onSubmit(formData);
    }

    return(
        <Form onSubmit={handleSubmit}>
            <h1>Paramètres de jeu</h1>
            <Form.Group className="mb-3" controlId="roundNumber">
                <Form.Label>Nombre de tours</Form.Label>
                <Form.Control type="number" min="1" max="30" value={formData.roundNumber} onChange={handleChange("roundNumber")}/>
                <Form.Text className="text-muted">
                    Nombre d'images à trouver successivement.
                </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="choicesPerRound">
                <Form.Label>Choix par tour</Form.Label>
                <Form.Control type="number" min="2" max="10" value={formData.choicesPerRound} onChange={handleChange("choicesPerRound")}/>
                <Form.Text className="text-muted">
                    Nombre de choix proposés à chaque tour.
                </Form.Text>
            </Form.Group>
            <Button variant="primary" type="submit">
                Creer la partie
            </Button>
        </Form>
    )
}

GameConfigurationForm.propTypes = {
    initialData: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired
  };

export default GameConfigurationForm;
        