export interface User {
    documentID?: string; // User UID from Firebase Authentication
    admin: boolean;
    email: string;
    name: string;
    read?: Array<string>;
    wish?: Array<string>;
    verified: boolean;
}
