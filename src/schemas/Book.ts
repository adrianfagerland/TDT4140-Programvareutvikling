import { Timestamp } from 'firebase/firestore';

export interface Book {
    documentID?: string; // ISBN
    authors?: Array<string>;
    authorsID?: Array<string>;
    title: string;
    description?: string;
    genre?: Array<string>;
    pages?: number;
    published?: Timestamp;
}
