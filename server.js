const db = require('sqlite');
const express = require('express');
const graphqlHTTP = require('express-graphql');
const Promise = require('bluebird');

var { buildSchema } = require('graphql');

var schema = buildSchema(`
  type BoardGame {
    getDesc: String!
    getImage: String!
  }

  type Query {
    getGame(gameName: String): BoardGame
  }
`);

class BoardGame {

  constructor(gameName) {
    this.name = gameName;
  }
  getDetails() {
    return db.get(`
        SELECT * FROM
        BoardGames where
        [details.name] = "${this.name}"
      `)
  }
  getDesc() {
    return this.data["details.description"];
  }
  getImage() {
    return this.data["details.image"];
  }
}

var root = {
  getGame: function({gameName}) {
    var b = new BoardGame(gameName);
    return b.getDetails().then((d) => {
      b.data = d;
      return b;
    })
  }
};

const app = express();
const port = process.env.PORT || 4000;

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

Promise.resolve()
  .then(() => db.open('./database.sqlite', {
    Promise
  }))
  .catch(err => console.error(err.stack))
  .finally(() => app.listen(port));

console.log('Running a GraphQL API server at localhost:4000/graphql');
