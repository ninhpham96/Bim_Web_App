import * as pako from 'pako';

export class Decompress {
  async readFile(buffer: Uint8Array) {
    const decompressed = pako.inflate(buffer);
    const json = new TextDecoder().decode(decompressed);
    const data = JSON.parse(json);
    console.log(data);
  }
}