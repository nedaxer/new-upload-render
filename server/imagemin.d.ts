// TypeScript declarations for imagemin packages
declare module 'imagemin' {
  interface Plugin {
    (buffer: Buffer): Promise<Buffer>;
  }
  interface Options {
    destination?: string;
    plugins: Plugin[];
  }
  interface Result {
    data: Buffer;
    sourcePath: string;
    destinationPath: string;
  }
  function imagemin(input: string[], options?: Options): Promise<Result[]>;
  export = imagemin;
}

declare module 'imagemin-webp' {
  interface Options {
    quality?: number;
    method?: number;
    lossless?: boolean;
    nearLossless?: boolean;
  }
  function imageminWebp(options?: Options): (buffer: Buffer) => Promise<Buffer>;
  export = imageminWebp;
}

declare module 'imagemin-avif' {
  interface Options {
    quality?: number;
    effort?: number;
  }
  function imageminAvif(options?: Options): (buffer: Buffer) => Promise<Buffer>;
  export = imageminAvif;
}

declare module 'imagemin-mozjpeg' {
  interface Options {
    quality?: number;
    progressive?: boolean;
  }
  function imageminMozjpeg(options?: Options): (buffer: Buffer) => Promise<Buffer>;
  export = imageminMozjpeg;
}

declare module 'imagemin-optipng' {
  interface Options {
    optimizationLevel?: number;
    bitDepthReduction?: boolean;
    colorTypeReduction?: boolean;
    paletteReduction?: boolean;
  }
  function imageminOptipng(options?: Options): (buffer: Buffer) => Promise<Buffer>;
  export = imageminOptipng;
}