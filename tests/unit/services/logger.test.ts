/**
 *
 */
import * as service from "../../../server/services/logger";

const expect = require('chai').expect

describe("Services Logger", () => {

    it("Should successfully create a new logger object", (done) => {

        const logger = new service.Logger("Default Logger", "Label");

        expect(logger).to.haveOwnProperty("_service");

        expect(service).to.haveOwnProperty("Logger");
        expect(service).to.haveOwnProperty("Logger");
        expect(service.Logger.name).to.be.equal("Logger");

        expect(service.Logger.prototype).to.haveOwnProperty("constructor");
        expect(service.Logger.prototype).to.haveOwnProperty("info");
        expect(service.Logger.prototype).to.haveOwnProperty("warn");
        expect(service.Logger.prototype).to.haveOwnProperty("error");
        expect(service.Logger.prototype).to.haveOwnProperty("debug");

        expect(service.Logger.prototype.info).to.be.a("function");
        expect(service.Logger.prototype.warn).to.be.a("function");
        expect(service.Logger.prototype.error).to.be.a("function");
        expect(service.Logger.prototype.debug).to.be.a("function");

        done();
    });


});