import request from "supertest";
import app from "../index.js";


const {requpdatestatus, reqmakeaddress} = require('../utils/orderTestData.js'); 
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJmNmM0OTkyLTdmZTUtNGI2OC1iOTQ3LTI3MGY5MjM1ODY1YiIsIm5hbWUiOiJNYW1hdCBTZW50b3NhIiwiZW1haWwiOiJtYW1hdEBlbWFpbC5jb20iLCJwcm9maWxlSW1hZ2UiOm51bGwsInRhbmdnYWxMYWhpciI6IjE5OTQtMDYtMTBUMDA6MDA6MDAuMDAwWiIsImlhdCI6MTc0ODM0NDExNCwiZXhwIjoxNzUwMDcyMTE0fQ.bqQMw4lVipnyNdRbOzfLGd3-suNx9N1JBu8GzFcj9fA"

describe("PUT /api/v1/status", () => {
    test("should update a status", async () => {
        

        const response = await request(app)
            .put("/api/v1/status")
            .set('Authorization',  `Bearer ${token}`) 
            .send(requpdatestatus);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe(requpdatestatus.status); 
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Order status updated successfully");
        
    });
});


describe("POST /api/v1/shipping", () => {
    test("should create an address", async () => {

        
        const response = await request(app)
            .post("/api/v1/shipping")
            .set('Authorization',  `Bearer ${token}`) 
            .send(reqmakeaddress);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Shipping address created successfully");
        expect(response.body.data.address).toBe(reqmakeaddress.address);
        expect(response.body.data.city).toBe(reqmakeaddress.city);
        expect(response.body.data.country).toBe(reqmakeaddress.country);
        expect(response.body.data.postal).toBe(reqmakeaddress.postal);
        expect(response.body.data.courier).toBe(reqmakeaddress.courier);
        expect(response.body.data.cost).toBe(reqmakeaddress.cost);
        
    });
});