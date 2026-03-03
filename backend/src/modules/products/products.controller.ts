import { Router } from 'express';

const productsRouter = Router();

// Simple in-memory product catalog for demo purposes.
// This satisfies apiClient.getProducts / getProduct / searchProducts.

const PRODUCTS = [
  { id: '1', name: 'Harvics Premium Chips', category: 'snacks', price: 2.5, currency: 'USD' },
  { id: '2', name: 'Harvics Chocolate Bar', category: 'confectionery', price: 1.2, currency: 'USD' },
  { id: '3', name: 'Harvics Sparkling Drink', category: 'beverages', price: 1.8, currency: 'USD' },
];

productsRouter.get('/', (_req, res) => {
  return res.json(PRODUCTS);
});

productsRouter.get('/:id', (req, res) => {
  const product = PRODUCTS.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json(product);
});

productsRouter.get('/search/:query', (req, res) => {
  const q = (req.params.query || '').toLowerCase();
  const results = PRODUCTS.filter(
    (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
  );
  return res.json(results);
});

export default productsRouter;


