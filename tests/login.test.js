import app from "../index.js";
import request from "supertest";



describe("POST /login",  () => {
 
  const email = "unknown@gmail.com";
  it("should return 404 if user not found", async () => {
    const email = "unknown@gmail.com";
    const response = await request(app).post("/api/v1/login").send({
      email,
      password: "any-password",
    });
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("msg");
    expect(response.body.msg).toBe(`User with email ${email} not found`);
  });

  it("should return 400 if user found and the password is incorrect", async () => {
    const email = "Kenton.Bode30@yahoo.com";
    const password = "1234";
    const response = await request(app).post("/api/v1/login").send({
      email,
      password,
    });
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("msg");
    expect(response.body.msg).toBe(`Wrong password`);
    
  });

  it("should return 200 if user found and the password id correct", async () => {
    const email = "Kenton.Bode30@yahoo.com";
    const password = "123";
    const response = await request(app).post("/api/v1/login").send({
      email,
      password,
    });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");
    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const hasRefreshCookie = cookies.some(cookie => cookie.startsWith("refreshToken="));
    expect(hasRefreshCookie).toBe(true);
    
  });

  it("should return 500 if unexpected error happens", async () => {
    const response = await request(app)
      .post("/api/v1/login")
      .send("this-is-not-a-json") // invalid body
  
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("msg", "Internal server error");
  });
});
