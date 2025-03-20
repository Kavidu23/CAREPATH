const request = require("supertest");
const app = require("../index");

async function testSignup() {
  try {
    const response = await request(app)
      .post("/signup")
      .set('Content-Type', 'application/json')
      .send({
        Fname: "John",
        Lname: "Doe",
        Pnumber: "0781234567",
        Email: "test@example.com",
        Password: "password123",
        Image: "profile.jpg",
        Location: "Colombo",
        Gender: "Male"
      });
    console.log("Status:", response.status);
    console.log("Body:", response.body);
  } catch (err) {
    console.error(err);
  }
}

testSignup();