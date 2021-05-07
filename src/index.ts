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

  static nextBucket(bucket: string) {
    if (!this.isValidLexBucket(bucket)) {
      throw `Invalid lex bucket "${bucket}"`;
    }

    if (bucket === '2') return '0';
    return String.fromCharCode(bucket.charCodeAt(0) + 1);
  }

  static prevBucket(bucket: string) {
    if (!this.isValidLexBucket(bucket)) {
      throw `Invalid lex bucket "${bucket}"`;
    }

    if (bucket === '0') return '2';
    return String.fromCharCode(bucket.charCodeAt(0) - 1);
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

  decrement() {
    for (let idx = 0; idx < this.value.length; idx++) {
      const char = this.value[idx];
      if (char === '0') continue;

      if (char === '1') {
        const newVal = '0' + this.value.substring(0, idx + 1);
        return new LexoRank(newVal, this.bucket);
      }

      const newVal = this.value.substring(0, idx) + LexoRank.decrementChar(char);
      return new LexoRank(newVal, this.bucket);
    }

    throw 'Invalid LexoRank';
  }

  private append(str: string) {
    return new LexoRank(this.value + str, this.bucket);
  }

  private static incrementChar(char: String) {
    if (char === 'z') return '-1';
    if (char === '9') return 'a';

    return String.fromCharCode(char.charCodeAt(0) + 1);
  }

  private static decrementChar(char: String) {
    if (char === '1') return '-1';
    if (char === 'a') return '9';

    return String.fromCharCode(char.charCodeAt(0) - 1);
  }

  static between(lexBefore: Lex | null | undefined, lexAfter: Lex): LexoRank;
  static between(lexBefore: Lex, lexAfter: Lex | null | undefined): LexoRank;
  static between(lexBefore: Lex, lexAfter: Lex): LexoRank {
    if (!lexBefore && !lexAfter) {
      throw 'Only one argument may be null';
    }

    if (!lexAfter) {
      return LexoRank.from(lexBefore).increment();
    }

    if (!lexBefore) {
      return LexoRank.from(lexAfter).decrement();
    }

    const before = LexoRank.from(lexBefore);
    const after = LexoRank.from(lexAfter);

    if (before.bucket !== after.bucket) {
      throw 'Lex buckets must be the same';
    }

    if (!before.lessThan(after)) {
      throw `${before.value} is not less than ${after.value}`;
    }

    const incremented = before.increment();
    if (incremented.lessThan(after)) return incremented;

    const plus1 = before.append('1');
    if (plus1.lessThan(after)) return plus1;

    let pre = '0';
    let plus01 = before.append(`${pre}1`);

    while (!plus01.lessThan(after)) {
      pre += '0';
      plus01 = before.append(`${pre}1`);
    }

    return plus01;
  }
}

type Lex = LexoRank | string;
