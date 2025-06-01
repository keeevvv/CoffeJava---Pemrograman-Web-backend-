import app from "../index.js";
import request from "supertest";

import { PrismaClient } from "@prisma/client";
import { fi } from "@faker-js/faker";
const prisma = new PrismaClient();

const endpoint = "/api/v1/Register";   


describe("POST /Register",  () => {

    it("should return 400 if password and confirmPassword do not match", async () => {

        

        try {
            await prisma.user.delete({
                where: {
                  email: "emailtest@gmail.com",
                },
              });
        } catch (error) {
            
        } finally {
            const response = await request(app).post("/api/v1/register").send({
                nama: "User Dua",
                email: "emailtest@gmail.com",
                password: "123456",
                confirmPassword: "654321",
                gender: "Female",
                tanggalLahir: "2000-01-01",
              });
          
              expect(response.status).toBe(400);
              expect(response.body.msg).toBe("Password and confirm password do not match");
        }
       
      });

    it("should return 400 if tanggalLahir format is invalid", async () => {
        const response = await request(app).post("/api/v1/register").send({
          nama: "User Satu",
          email: "emailtest@gmail.com",
          password: "123456",
          confirmPassword: "123456",
          gender: "Male",
          tanggalLahir: "invalid-date",
        });
    
        expect(response.status).toBe(400);
        expect(response.body.msg).toBe("please input the correct format of yyyy-mm-dd");
      });

    it("should return 409 if email already exists", async () => {
        const email = "Kenton.Bode30@yahoo.com";
    
       
    
        const response = await request(app).post("/api/v1/register").send({
          nama: "User Tiga",
          email,
          password: "123456",
          confirmPassword: "123456",
          gender: "Other",
          tanggalLahir: "2000-01-01",
        });
    
        expect(response.status).toBe(409);
        expect(response.body.msg).toBe(`User with email ${email} already exists`);
      });
 
    it("should return 201 if user registered successfully", async () => {
      
       
    
        const response = await request(app).post("/api/v1/register").send({
          nama: "User Empat",
          email: "emailtest@gmail.com",
          password: "123456",
          confirmPassword: "123456",
          gender: "Male",
          tanggalLahir: "1999-12-31",
        });
    
        expect(response.status).toBe(201);
        expect(response.body.msg).toBe("User registered successfully");
      });


  

  it("should return 500 if unexpected error happens", async () => {
    const response = await request(app)
      .post(endpoint)
      .send({
        nama: "User Empat",
        email: null,
        password: "123456",
        confirmPassword: "123456",
        gender: "Male",
        tanggalLahir: "1999-12-31",
      }) // invalid body
  
    expect(response.status).toBe(500);
    expect(response.body.msg).toBe("An error occurred while registering the user");
  });
});
