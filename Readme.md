### MERN TEMPLATE - MYSQL VERSION

Template for dockerizing a MERN app with docker-compose:

- React
- Node.js + Express
- Nodemon + PM2
- MySQL + Sequelize
- Nginx - serving static react build

  <br>
  There are env.example files in the `config/` folder for the env variables that need to be set in the db and the db connection for Sequelize.
  <br>
  This package at the moment is purely used for as a development environment.
  In the future, I might make it more generic, without including a particular codebase for `api/` and `frontend`, and just some bash scripts that set things up for a greenfield project.
  <br>

  ### DB

  For the moment manually grant privileges to the user defined in the .env file , and manually create the db for test, and prod.

```sql
 GRANT ALL PRIVILEGES ON *.*  TO USER@localhost identified by 'PASSWORD';
```

### Changelog

Added socket.io and pub sub
