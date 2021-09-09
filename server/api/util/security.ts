import {scryptSync} from "crypto";

/**
 * Hashes a string against server environment SECURITY_KEY
 * @param string
 * @constructor
 */
export function Cipher(string: string): string {

    const key = scryptSync(string, process.env.SECURITY_KEY as string, 128);

    return key.toString('hex')
}