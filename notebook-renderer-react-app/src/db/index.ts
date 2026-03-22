import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export const getAllItems = async () => {
  const res = await query('SELECT * FROM items');
  return res.rows;
};

export const getItemById = async (id: number) => {
  const res = await query('SELECT * FROM items WHERE id = $1', [id]);
  return res.rows[0];
};

export const createItem = async (name: string) => {
  const res = await query('INSERT INTO items(name) VALUES($1) RETURNING *', [name]);
  return res.rows[0];
};

export const updateItem = async (id: number, name: string) => {
  const res = await query('UPDATE items SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
  return res.rows[0];
};

export const deleteItem = async (id: number) => {
  const res = await query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);
  return res.rows[0];
};