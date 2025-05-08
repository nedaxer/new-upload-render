// Type declarations for modules without TypeScript definitions

declare module 'hdkey' {
  export default class HDKey {
    static fromMasterSeed(seed: Buffer): HDKey;
    derive(path: string): HDKey;
    privateExtendedKey: string;
    publicExtendedKey: string;
    privateKey: Buffer;
    publicKey: Buffer;
  }
}

declare module 'elliptic' {
  interface EC {
    keyFromPrivate(privateKey: Buffer): {
      getPublic: (compressed: boolean, format: string) => string;
    };
  }
  
  export class ec {
    constructor(curve: string);
    genKeyPair(): any;
    keyFromPrivate(privateKey: Buffer | string): {
      getPublic: (compressed?: boolean, format?: string) => any;
    };
    keyFromPublic(publicKey: Buffer | string): any;
  }
  
  export default {
    ec: ec
  };
}