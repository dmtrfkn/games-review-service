import Elysia from 'elysia';

const app = new Elysia();

app.get('/api/games', () => {
  return {
    games: [{ id: 1, title: 'game 1' }],
  };
});

app.listen(4200, () => {
  console.log('Server running on http://localhost:4200');
});
