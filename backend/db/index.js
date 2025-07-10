import knex from 'knex';

export const knexInstance = knex({
  client: 'sqlite3',
  connection: {
    filename: './dev.sqlite3',
  },
  useNullAsDefault: true,
});

// I would suggest approaching the code structure in a more modular way,
// where inside each module we aren't using a horizontal slicing approach (layers defined by technical concerns), but rather a vertical one.
// This would allow us to better organize the code and make it more maintainable.
// Each defined module would have its own directory and expose only the methods that are needed with cleary defined interfaces.
// Example of modules in this project would be: email-service, lead-management, LLM module, ...
