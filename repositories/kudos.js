const { produce } = require('immer');

class KudosRepository {
  constructor(ops) {
    this.kudos = ops.db.kudos;
  }

  get() {
    return this.kudos;
  }

  sentByUser(username) {
    return this.kudos.filter((k) => k.userFrom.username === username);
  }

  receivedByUser(username) {
    return this.kudos.filter((k) => k.userTo.username === username);
  }

  save(message, usernameTo, usernameFrom) {
    const newKudos = {
      message,
      date: new Date().toLocaleDateString('es-ES'),
      userFrom: {
        username: usernameFrom,
      },
      userTo: {
        username: usernameTo,
      },
    };

    this.kudos.push(newKudos);

    // TODO: This would come back when persisting to real db
    // produce(kudos, (draft) => {
    //   draft.push(newKudos);
    // });

    return newKudos;
  }
}

module.exports = KudosRepository;
