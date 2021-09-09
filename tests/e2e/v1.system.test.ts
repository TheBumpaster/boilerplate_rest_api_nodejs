const dotenv = require('dotenv')
dotenv.config({path: ".env.test"})

import chai from 'chai';
import chaiHttp from 'chai-http';
import application from "../../server";
import {IUser} from "../../server/models/user/schema";
import * as faker from "faker";

chai.use(chaiHttp);
const expect = chai.expect;

describe("System API Tests", function () {
    this.timeout(10000);

    let user: IUser;
    let token: string;
    const newPassword = faker.internet.password(9);

    before((done) => {

        user = {
            username: faker.random.alphaNumeric(16),
            password: faker.internet.password(9),
        };

        // Wait to connect to server and database
        if (application.get("service_ready")) {
            done();

        } else {

            application.on("service_ready", () => {
                done();
            });

        }

    });


    it('Should successfully register a new user', (done) => {
        chai.request(application)
            .post("/api/v1/system/signup")
            .send(user)
            .then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.result.user._id).to.be.a("string");
                expect(response.body.result.user.username).to.be.a("string");
                expect(response.body.result.user.createdAt).to.be.a("string");
                expect(response.body.result.user.updatedAt).to.be.a("string");
                done();
            });
    });

    it('Should successfully login a new user', (done) => {
        chai.request(application)
            .post("/api/v1/system/signin")
            .send(user)
            .then((response) => {
                expect(response.status).to.equal(200);
                expect(response.body.result.token).to.be.a("string");

                token = response.body.result.token;
                done();
            });
    });

    it('Should successfully get currently logged user data', (done) => {
        chai.request(application)
            .get("/api/v1/system/me")
            .set("Authorization", "Bearer " + token)
            .then((response) => {
                expect(response.status).to.equal(200);
                expect(response.body.result._id).to.be.a("string");
                expect(response.body.result.username).to.be.a("string");
                expect(response.body.result.createdAt).to.be.a("string");
                expect(response.body.result.updatedAt).to.be.a("string");
                done();
            });

    });

    it('Should successfully update currently logged user password', (done) => {
        chai.request(application)
            .post("/api/v1/system/me/update-password")
            .send({oldPassword: user.password, newPassword})
            .set("Authorization", "Bearer " + token)
            .then((response) => {
                expect(response.status).to.equal(200);
                expect(response.body.result._id).to.be.a("string");
                expect(response.body.result.username).to.be.a("string");
                expect(response.body.result.password).to.be.a("string");
                expect(response.body.result.createdAt).to.be.a("string");
                expect(response.body.result.updatedAt).to.be.a("string");
                done();
            });

    });

});