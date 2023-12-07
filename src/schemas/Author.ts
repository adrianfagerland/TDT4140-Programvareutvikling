import { Timestamp } from 'firebase/firestore';

export interface Author {
    documentID?: string; // Auto
    name: string;
    birth?: Timestamp;
    death?: Timestamp;
    nationality?: string;
}
