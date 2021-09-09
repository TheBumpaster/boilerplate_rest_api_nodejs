const dotenv = require('dotenv')
dotenv.config({path: ".env.test"})

import chai from 'chai';
import chaiHttp from 'chai-http';
import application from "../../server";

chai.use(chaiHttp);
const expect = chai.expect;

describe("Health Probe API Tests", function () {
    this.timeout(10000);

    before((done) => {
        // Wait to connect to server and database
        if (application.get("service_ready")) {
            done();
        } else {
            application.on("service_ready", () => {
                done();
            });
        }

    });

    it('Should successfully get liveness status', (done) => {
        chai.request(application)
            .get("/api/v1/health/liveness")
            .then((response) => {
                expect(response.body.result.status).to.be.eq(true, "API Service Status")
                done();
            });
    });

    it('Should successfully get readiness status', (done) => {
        chai.request(application)
            .get("/api/v1/health/readiness")
            .then((response) => {
                expect(response.body.result.status).to.be.eq(true, "Database Service Status")
                done();
            });
    });

});
