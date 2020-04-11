const jwt = require('jsonwebtoken');

class UserRepository {
  constructor(ops) {
    this.users = ops.db.users;
    this.appSecret = ops.appSecret;
  }

  get() {
    return this.users;
  }

  register(name, username, password) {
    const token = jwt.sign(
      { username: username, password: password },
      this.appSecret,
    );

    const user = {
      name,
      username,
      password,
      token,
    };

    this.users.push(user);
    return user;
  }

  login(username, password) {
    const user = this.users.find(
      (user) => user.username === username && user.password === password,
    );

    const token = jwt.sign(
      { username: user.username, password: user.password },
      this.appSecret,
    );

    user.token = token;
    return user;
  }

  getWithToken(token) {
    try {
      const decoded = jwt.verify(token, this.appSecret);
      console.log(decoded);
      const user = this.users.find(
        (user) =>
          user.username === decoded.username &&
          user.password === decoded.password,
      );

      return user;
    } catch (e) {
      return null;
    }
  }
}

module.exports = UserRepository;
