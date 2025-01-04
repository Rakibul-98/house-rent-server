import express, { Application, Request, Response } from 'express'
import cors from 'cors';
import { ProductRoutes } from './App/modules/product/product.routes';

const app: Application = express();

app.use(express.json());
app.use(cors());

app.use('/api/products', ProductRoutes);

const getAController = (req: Request, res: Response) => {
    res.send('Hello from A controller');
}

app.get('/', getAController);

export default app;