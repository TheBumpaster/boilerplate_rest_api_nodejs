import {model} from "mongoose";
import {IUserDocument, UserModel, userSchema} from "./schema";

const userModel = model<IUserDocument>("user", userSchema, "users") as UserModel;

export default userModel
