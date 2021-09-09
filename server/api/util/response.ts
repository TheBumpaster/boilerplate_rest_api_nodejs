import {Response} from "express";
import {responseCodes} from "../../config/constants";
import {ParsedQs} from "qs";

interface IResponsePayload<T> {
    meta?: Partial<ParsedQs>;
    result?: T;
    errors?: Error[],
}

/**
 * @class ResponseBuilder: T
 * @classdesc This class handles robust result responses
 */
export class ResponseBuilder<T> {

    private _response: Response;
    private _payload: IResponsePayload<T>;

    constructor(response: Response) {
        this._response = response;
        this._payload = {};
    }

    public setData(data: T): this {
        this._payload.result = data;
        return this;
    }

    public setMeta(meta: ParsedQs): this {
        this._payload.meta = meta;
        return this;
    }

    public setErrors(...error: Error[]): this {
        this._payload.errors = [...error]
        return this;
    }

    public setStatus(code: responseCodes): this {
        this._response.status(code);
        return this;
    }

    public build(): Response<IResponsePayload<T>> {
        return this._response.json(this._payload);
    }
}