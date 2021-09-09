import {IUser, IUserDocument, UserModel} from "./schema";

/**
 * 
 * @param username
 * @constructor
 */
export function FindUserByUsername(username: string): Promise<IUserDocument | null> {
    return (this as UserModel).findOne({
        username
    }).exec()
}

export function CreateUser(data: IUser): Promise<IUserDocument> {
    return (this as UserModel).create(data);
}

export function UpdateUserPassword(id: string, password: string): Promise<IUserDocument | null> {
    return (this as UserModel).findOneAndUpdate({_id: id}, {password}).exec();
}