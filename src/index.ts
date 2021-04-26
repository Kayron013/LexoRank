export default class LexoRank {
  readonly value: string;
  readonly bucket: string;

  constructor(value: string, bucket = '0') {
    if (!LexoRank.isValidLexValue(value)) {
      throw `Invalid lex value "${value}"`;
    }
    if (!LexoRank.isValidLexBucket(bucket)) {
      throw `Invalid lex bucket "${bucket}"`;
    }

    this.value = value;
    this.bucket = bucket;
  }

  static from(lex: Lex) {
    if (lex instanceof LexoRank) {
      return new LexoRank(lex.value, lex.bucket);
    }
    const { value, bucket } = this.parse(lex);
    return new LexoRank(value, bucket);
  }

  private static parse(lex: string) {
    const regex = /^(?<bucket>[0-2])\|(?<value>[0-9a-z]*[1-9a-z])$/;
    const match = regex.exec(lex);
    if (!match) {
      throw 'Invalid lex string';
    }
    return { value: match.groups!.value, bucket: match.groups!.bucket };
  }

  toString() {
    return `${this.bucket}|${this.value}`;
  }

  private static isValidLexValue(value: string) {
    const regex = /^[0-9a-z]*[1-9a-z]$/;
    return regex.test(value);
  }

  private static isValidLexBucket(bucket: string) {
    const regex = /^[0-2]$/;
    return regex.test(bucket);
  }

  lessThan(lex: Lex) {
    const other = LexoRank.from(lex);
    const len = Math.max(this.value.length, other.value.length);

    for (let idx = 0; idx < len; idx++) {
      const charA = this.value[idx];
      const charB = other.value[idx];

      if (!charB) return false; // a is more specific
      if (!charA) return true; // b is more specific

      if (charA < charB) return true;
      if (charA > charB) return false;
    }

    return false;
  }

  increment() {
    for (let idx = this.value.length - 1; idx >= 0; idx--) {
      const char = this.value[idx];
      if (char === 'z') continue;

      const newVal = this.value.substring(0, idx) + LexoRank.incrementChar(char);
      return new LexoRank(newVal, this.bucket);
    }

    const newVal = this.value + '1';
    return new LexoRank(newVal, this.bucket);
  }

  private append(str: string) {
    return new LexoRank(this.value + str, this.bucket);
  }

  private static incrementChar(char: String) {
    if (char === 'z') return '-1';
    if (char === '9') return 'a';

    return String.fromCharCode(char.charCodeAt(0) + 1);
  }

  public static between(lexA: Lex, lexB: Lex): LexoRank {
    const a = LexoRank.from(lexA);
    const b = LexoRank.from(lexB);

    if (a.bucket !== b.bucket) {
      throw 'Lex buckets must be the same';
    }

    if (!a.lessThan(b)) {
      throw `${a.value} is not less than ${b.value}`;
    }

    const incremented = a.increment();
    if (incremented.lessThan(b)) return incremented;

    const plus1 = a.append('1');
    if (plus1.lessThan(b)) return plus1;

    let pre = '0';
    let plus01 = a.append(`${pre}1`);

    while (!plus01.lessThan(b)) {
      pre += '0';
      plus01 = a.append(`${pre}1`);
    }

    return plus01;
  }
}

type Lex = LexoRank | string;
