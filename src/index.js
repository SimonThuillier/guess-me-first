import 'dotenv/config';
import cors from 'cors';
import express from 'express';


const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`express server is running on port ${PORT}`);
});