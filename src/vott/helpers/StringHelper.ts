export default class StringUtil {
  public static normalizeSlashes(path: string): string {
    return path.replace(/\\/g, "/");
  }

  public static encodeFileURI(
    path: string,
    additionalEncodings?: boolean
  ): string {
    // encodeURI() will not encode: ~!@#$&*()=:/,;?+'
    // extend it to support all of these except # and ?
    // all other non encoded characters are implicitly supported with no reason to encoding them
    const matchString = /(#|\?)/g;
    const encodings: { [k: string]: string } = {
      "#": "%23",
      "?": "%3F"
    };
    const encodedURI = `file:${encodeURI(this.normalizeSlashes(path))}`;
    if (additionalEncodings) {
      return encodedURI.replace(matchString, match => encodings[match]);
    }
    return encodedURI;
  }
}
