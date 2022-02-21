import {Badge, Table} from "react-bootstrap";


function GameScoreboard({scoreboard}){

    scoreboard = scoreboard || {};

    const tableData = [];

    Object.entries(scoreboard).forEach(([key, value]) => {
        tableData.push(value);
    })

    // sort by score descending  
    tableData.sort((a, b) => {
        if (a.score > b.score) return -1;
        if (a.score < b.score) return 1;
        // a doit être égal à b
        return 0;
    });

    return (
        <Table striped bordered hover size="sm">
            <thead>
                <tr>
                <th>Joueur</th>
                <th>Score</th>
                </tr>
            </thead>
            <tbody>
                {tableData.map((player) => (
                    <tr>
                        <td><Badge bg="secondary">{player.name}</Badge></td>
                        <td>{player.score}</td>
                    </tr>
                ))
                }
            </tbody>
        </Table>
    )
} 

export default GameScoreboard;