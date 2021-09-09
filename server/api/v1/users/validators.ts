import {Types} from "mongoose"

/**
 * Checks if provided id is a valid ObjectId
 * @param id
 * @constructor
 */
export function ValidateId(id: string): boolean {
    return Types.ObjectId.isValid(id)
}

