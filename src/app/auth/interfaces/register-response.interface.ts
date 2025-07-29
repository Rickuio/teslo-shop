export interface RegisterResponse {
    user:  User;
    token: string;
}

export interface User {
    email:    string;
    fullName: string;
    id:       string;
    isActive: boolean;
    roles:    string[];
}
