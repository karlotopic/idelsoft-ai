import knex from 'knex';

export const knexInstance = knex({
  client: 'sqlite3',
  connection: {
    filename: './db/dev.sqlite3',
  },
  useNullAsDefault: true,
});