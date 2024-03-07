export type UserScore = { timestamp: number, score: number }
export type Signature = [number, number, string, string]
export type ServerSignature = {
    timestamp: number;
    v: number;
    r: string;
    s: string;
}
