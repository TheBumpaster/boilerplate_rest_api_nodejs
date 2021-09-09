import * as faker from "faker";

const dotenv = require('dotenv')
dotenv.config({path: ".env.test"})

import chai from 'chai';
import chaiHttp from 'chai-http';
import application from "../../server";
import {IUserDocument} from "../../server/models/user/schema";

chai.use(chaiHttp);

// check if each value is greater or equal than the previous value
const _isSortedAsc = (arr: number[]) => arr.every((v,i,a) => !i || a[i-1] <= v);
// check if each value is less or equal than the previous value
const _isSortedDesc = (arr: number[]) => arr.every((v,i,a) => !i || a[i-1] >= v);


const expect = chai.expect;

describe("Users API Tests", function () {
    this.timeout(10000);

    const users = [
        {
            username: faker.random.alphaNumeric(13),
            password: faker.internet.password(9),
        },
        {
            username: faker.random.alphaNumeric(13),
            password: faker.internet.password(9),
        }
    ];
    const usersDocuments: Array<IUserDocument & {token?: string}>  = [];

    before(async () => {
        // Wait to connect to server and database
        if (application.get("service_ready")) {

            for (let i = 0; i < users.length; i++) {
                const response = await chai.request(application)
                    .post("/api/v1/system/signup")
                    .send(users[i]);

                usersDocuments.push(response.body.result.user)
            }

            const response = await chai.request(application)
                .post("/api/v1/system/signin")
                .send(users[0]);

            Object.assign(usersDocuments[0], {token: response.body.result.token});

        } else {

            application.on("service_ready", async () => {

                for (let i = 0; i < users.length; i++) {
                    const response = await chai.request(application)
                        .post("/api/v1/system/signup")
                        .send(users[i]);

                    usersDocuments.push(response.body.result.user)
                }

                const response = await chai.request(application)
                    .post("/api/v1/system/signin")
                    .send(users[0]);

                Object.assign(usersDocuments[0], {token: response.body.result.token});

            });
        }

    });

    it('Should successfully get user info 1', (done) => {
        chai.request(application)
            .get("/api/v1/users/" + usersDocuments[0]._id)
            .then((response) => {
                expect(response.status).to.be.eq(200, "API Service Status")
                expect(response.body.result).to.be.a("object")
                expect(response.body.result.username).to.be.a("string")
                expect(response.body.result.username).to.be.equal(usersDocuments[0].username)
                expect(response.body.result.numberOfLikes).to.be.equal(0)
                done();
            });
    });

    it('Should successfully get user info 2', (done) => {
        chai.request(application)
            .get("/api/v1/users/" + usersDocuments[1]._id)
            .then((response) => {
                expect(response.status).to.be.eq(200, "API Service Status")
                expect(response.body.result).to.be.a("object")
                expect(response.body.result.username).to.be.a("string")
                expect(response.body.result.username).to.be.equal(usersDocuments[1].username)
                expect(response.body.result.numberOfLikes).to.be.equal(0)
                done();
            });
    });

});
