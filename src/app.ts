import express, { Application, Request, Response } from 'express'
import cors from 'cors';

const app: Application = express();

app.use(express.json());
app.use(cors());

// app.use('/api/products', ProductRoutes);
// app.use('/api/orders', OrderRoutes);

const getAController = (req: Request, res: Response) => {
    res.send('Hello from A controller');
}

app.get('/', getAController);

export default app;