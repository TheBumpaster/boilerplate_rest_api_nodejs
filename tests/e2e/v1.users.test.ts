
const dotenv = require('dotenv')
dotenv.config({path: ".env.test"})

import chai from 'chai';
import chaiHttp from 'chai-http';
import application from "../../server";
import {IUserDocument} from "../../server/models/user/schema";
import faker from "faker";

chai.use(chaiHttp);

const newFakeUser = () => {
    return {
        username: faker.random.alphaNumeric(13),
        password: faker.internet.password(11)
    }
};

const expect = chai.expect;

describe("Users API Tests", function () {
    this.timeout(10000);

    const user = newFakeUser();
    let usersDocument: IUserDocument & {token?: string};
    let userId: string;

    before(async () => {
        // Wait to connect to server and database
        if (application.get("service_ready")) {

            const register = await chai.request(application)
                .post("/api/v1/system/signup")
                .send(user);
            usersDocument = register.body.result.user;

            const login = await chai.request(application)
                .post("/api/v1/system/signin")
                .send(user);
            Object.assign(usersDocument, {token: login.body.result.token});

        } else {

            application.on("service_ready", async () => {

                const register = await chai.request(application)
                    .post("/api/v1/system/signup")
                    .send(user);
                usersDocument = register.body.result.user;

                const login = await chai.request(application)
                    .post("/api/v1/system/signin")
                    .send(user);
                Object.assign(usersDocument, {token: login.body.result.token});

            });
        }

    });

    it("Should create a new user", (done) => {

        chai.request(application)
            .post("/api/v1/users")
            .set("Authorization", "Bearer " + usersDocument.token)
            .send(newFakeUser())
            .then((response) => {

                userId = response.body.result._id;

                expect(response.status).to.be.eq(201)
                done();
            });
    });

    it("Should get a list of users", (done) => {
        chai.request(application)
            .get("/api/v1/users")
            .set("Authorization", "Bearer " + usersDocument.token)
            .then((response) => {
                expect(response.status).to.be.eq(200)

                done();
            });
    });

    it("Should get a User Document by User ID", (done) => {
        chai.request(application)
            .get("/api/v1/users/" + userId)
            .set("Authorization", "Bearer " + usersDocument.token)
            .then((response) => {
                expect(response.status).to.be.eq(200)

                done();
            });
    });

    it("Should update a User Document by User ID", (done) => {
        chai.request(application)
            .put("/api/v1/users/" + userId)
            .set("Authorization", "Bearer " + usersDocument.token)
            .send({password: faker.internet.password(15)})
            .then((response) => {
                expect(response.status).to.be.eq(200)

                done();
            });
    });


    it("Should delete a User Document by User ID", (done) => {
        chai.request(application)
            .del("/api/v1/users/" + userId)
            .set("Authorization", "Bearer " + usersDocument.token)
            .then((response) => {
                expect(response.status).to.be.eq(200)

                done();
            });
    });

});
