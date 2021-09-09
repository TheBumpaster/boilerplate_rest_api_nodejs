/**
 *
 */
import {GenerateMongoURI, InitializeMongooseClientConnection} from "../../../server/services/database";
import {config} from 'dotenv';
import {internet} from "faker";
import mongoose from "mongoose";
config({path: ".env.test"})

const expect = require('chai').expect

describe("Services Database", () => {

    let uri: string = GenerateMongoURI();

    describe("GenerateMongoURI()", () => {

        afterEach(() => {
            // Reload env
            config({path: ".env.test"})
            uri = GenerateMongoURI();
        });

        it("Should generate uri without user and password", (done) => {
            delete process.env.DB_USER;
            delete process.env.DB_PASS;
            uri = GenerateMongoURI();

            expect(uri.includes("@")).to.be.eq(false);
            expect(uri.includes("mongodb://")).to.be.eq(true);
            expect(uri.includes("mongodb://" + process.env.DB_HOST)).to.be.eq(true);
            expect(uri.includes("mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT)).to.be.eq(true);
            expect(uri.includes("mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_NAME)).to.be.eq(true);
            done();
        });

        it("Should generate uri without port", (done) => {

            delete process.env.DB_PORT;
            uri = GenerateMongoURI();

            expect(uri.includes("@")).to.be.eq(false);
            expect(uri.includes("mongodb://")).to.be.eq(true);
            expect(uri.includes("mongodb://" + process.env.DB_HOST)).to.be.eq(true);
            expect(uri.includes("mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT)).to.be.eq(false);
            expect(uri.includes("mongodb://" + process.env.DB_HOST + "/" + process.env.DB_NAME)).to.be.eq(true);

            done();
        });

        it("Should generate uri without auth source", (done) => {

            delete process.env.DB_AUTH_SOURCE;

            uri = GenerateMongoURI();

            expect(uri.includes("@")).to.be.eq(false);
            expect(uri.includes("mongodb://")).to.be.eq(true);
            expect(uri.includes("mongodb://" + process.env.DB_HOST)).to.be.eq(true);
            expect(uri.includes("mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT)).to.be.eq(true);
            expect(uri.includes("mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_NAME)).to.be.eq(true);
            expect(uri.includes("mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_NAME + "?authSource=" + process.env.DB_AUTH_SOURCE)).to.be.eq(false);

            done();

        });

        it("Should generate uri with user and password", (done) => {

            process.env.DB_USER = internet.userName();
            process.env.DB_PASS = internet.password();

            uri = GenerateMongoURI();

            expect(uri.includes("@")).to.be.eq(true);
            expect(uri.includes("mongodb://")).to.be.eq(true);
            expect(uri.includes("mongodb://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@")).to.be.eq(true);
            expect(uri.includes("mongodb://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@")).to.be.eq(true);
            done();

        });

        it("Should generate uri with port", () => {

            delete process.env.DB_USER;
            delete process.env.DB_PASS;

            uri = GenerateMongoURI();

            expect(uri.includes("@")).to.be.eq(false);
            expect(uri.includes("mongodb://")).to.be.eq(true);
            expect(uri.includes("mongodb://" + process.env.DB_HOST)).to.be.eq(true);
            expect(uri.includes("mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT)).to.be.eq(true);
            expect(uri.includes("mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_NAME)).to.be.eq(true);

        });

        it("Should generate uri with auth source", () => {

            delete process.env.DB_USER;
            delete process.env.DB_PASS;

            process.env.DB_AUTH_SOURCE = internet.url()

            uri = GenerateMongoURI();

            expect(uri.includes("@")).to.be.eq(false);
            expect(uri.includes("mongodb://")).to.be.eq(true);
            expect(uri.includes("mongodb://" + process.env.DB_HOST)).to.be.eq(true);
            expect(uri.includes("mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT)).to.be.eq(true);
            expect(uri.includes("mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_NAME)).to.be.eq(true);
            expect(uri.includes("mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_NAME + "?authSource=" + process.env.DB_AUTH_SOURCE)).to.be.eq(true);

        });

    });

    describe("InitializeMongooseClientConnection", () => {

        beforeEach(() => {
            delete process.env.DB_NAME;
            delete process.env.DB_PORT;
            delete process.env.DB_USER;
            delete process.env.DB_PASS;
            delete process.env.DB_AUTH_SOURCE;

            // Reload env
            config({path: ".env.test"})
            uri = GenerateMongoURI();
        });

        it("Should setup a Mongoose client without memory server", (done) => {

            process.env.NODE_ENV= "normal";

            InitializeMongooseClientConnection()
                .then((result) => {

                    expect(result instanceof mongoose.Mongoose).to.eq(true);
                    expect((result as mongoose.Mongoose).connection.host).to.eq(process.env.DB_HOST);
                    expect((result as mongoose.Mongoose).connection.port).to.eq(Number(process.env.DB_PORT));
                    expect((result as mongoose.Mongoose).connection.name).to.eq(process.env.DB_NAME);

                    done()
                })
                .catch((reason) => {
                    done(reason);
                })
        });

        it("Should setup a Mongoose client with memory server", (done) => {
            process.env.NODE_ENV= "test";

            delete process.env.DB_PORT;
            delete process.env.DB_HOST;
            delete process.env.DB_NAME;

            uri = GenerateMongoURI();

            InitializeMongooseClientConnection()
                .then((result) => {

                    expect(result instanceof mongoose.Mongoose).to.eq(true);
                    expect((result as mongoose.Mongoose).connection.host).to.eq(process.env.DB_HOST);
                    expect((result as mongoose.Mongoose).connection.port).to.eq(Number(process.env.DB_PORT));
                    expect((result as mongoose.Mongoose).connection.name).to.eq(process.env.DB_NAME);

                    done()
                })
                .catch((reason) => {
                    done(reason);
                })

        });

        afterEach(() => {
            mongoose.disconnect()
            // clean up to not mess up the executor environment
            process.env.NODE_ENV= "test";
            config({path: ".env.test"})
            uri = GenerateMongoURI();
        })
    });

    describe("SetupMongoDBMemoryServer", () => {

    });
});