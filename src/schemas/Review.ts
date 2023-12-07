import { Timestamp } from 'firebase/firestore';

export interface Review {
    documentID?: string; // Auto
    user: string;
    username: string;
    book: string;
    rating: number;
    text: string;
    published?: Timestamp;
}