export declare function encode(n: bigint, buffer?: Uint8Array, offset?: number): {
    buffer: Uint8Array;
    bytes: number;
};
export declare function decode(buffer: Uint8Array, offset?: number): {
    value: bigint;
    bytes: number;
};
export declare function encodingLength(n: bigint): number;
