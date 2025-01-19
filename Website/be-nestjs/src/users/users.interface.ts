

export interface IUser {
    _id: string;

    name: string;


    email: string;


    password: string;


    role: string;
    permissions?: {
        _id: string,
        name: string,
        apiPath: string,
        module: string
    }
}