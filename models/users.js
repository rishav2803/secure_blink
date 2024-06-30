const bcrypt = require("bcryptjs");

// In-memory user storage
let users = [];

class User {
  constructor(email, password, role) {
    this.email = email;
    this.password = password;
    this.role = role;
  }

  static async findUserByEmail(email) {
    const existingUser = users.find((user) => user.email === email);
    return existingUser;
  }

  static async updatePassword(password, email) {
    const hashedPassword = await bcrypt.hash(password, 10);
    users.forEach((user) => {
      if (user.email == email) {
        user.password = hashedPassword;
      }
    });

    return { message: "Password has been reset successfully" };
  }

  async save() {
    // Check if the email already exists
    const existingUser = users.find((user) => user.email === this.email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    // Hash the password and save the user
    this.password = await bcrypt.hash(this.password, 10);
    users.push({ email: this.email, password: this.password, role: this.role });
    return { message: "User saved successfully" };
  }

  //User Level auth
  static async check(email, password) {
    const user = users.find((user) => user.email === email);
    if (!user) {
      throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    return user;
  }

  static async get() {
    return users;
  }
}

module.exports = User;
