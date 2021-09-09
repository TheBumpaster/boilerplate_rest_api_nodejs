import {Schema, SchemaTypes, Document, Model} from 'mongoose'
import {CreateUser, FindUserByUsername, UpdateUserPassword} from "./service";


export interface IUser {
    username: string;
    password: string;
}

export interface IUserDocument extends IUser, Document {
    _id: string;
    likes: {
        map: Map<string, boolean>,
        count: number,
    };
    createdAt: string;
    updatedAt: string;
}

export const userSchema = new Schema({
    username: {
        type: SchemaTypes.String,
        required: true,
        unique: true,
    },
    password: {
        type: SchemaTypes.String,
        required: true,
    },
    likes: {
        map: {
            type: SchemaTypes.Map,
            of: SchemaTypes.Boolean,
            default: {}
        },
        count: {
            type: SchemaTypes.Number,
            default: 0
        }
    }
}, {
    id: true,
    _id: true,
    timestamps: true,
    autoIndex: true,
    autoCreate: true,
});

// Attach service statics
export interface IUserServiceStatics {
    findUserByUsername(username: string): Promise<IUserDocument | null>;
    createUser(user: IUser): Promise<IUserDocument>;
    updateUserPassword(userId: string, password: string): Promise<IUserDocument | null>
}

userSchema.static("findUserByUsername", FindUserByUsername);
userSchema.static("createUser", CreateUser);
userSchema.static("updateUserPassword", UpdateUserPassword);

export type UserModel = Model<IUserDocument> & IUserDocument & IUserServiceStatics;
