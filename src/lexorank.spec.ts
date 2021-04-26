import LexoRank from '.';

describe('LexoRank - Constructor', () => {
  const newLex = (val: string, bucket?: string) => jest.fn(() => new LexoRank(val, bucket));
  const lexFrom = (val: string) => jest.fn(() => LexoRank.from(val));

  test('throws for invalid input', () => {
    expect(newLex('0', '0')).toThrow('Invalid lex value');
    expect(newLex('a90', '1')).toThrow('Invalid lex value');
    expect(newLex('12A')).toThrow('Invalid lex value');

    expect(lexFrom('13b')).toThrow('Invalid lex string');
    expect(lexFrom('0|C')).toThrow('Invalid lex string');
    expect(lexFrom('1|12A')).toThrow('Invalid lex string');

    expect(newLex('22a', '3')).toThrow('Invalid lex bucket');
    expect(lexFrom('4|12a')).toThrow('Invalid lex string');
  });

  test('creates for valid input', () => {
    expect(newLex('01')).not.toThrow();
    expect(newLex('12a')).not.toThrow();
    expect(lexFrom('0|c')).not.toThrow();
    expect(lexFrom('1|a909')).not.toThrow();
  });
});

describe('LexoRank - Rank comparison', () => {
  test('single chars', () => {
    expect(new LexoRank('1').lessThan(LexoRank.from('2|9'))).toBe(true);
    expect(new LexoRank('8').lessThan(LexoRank.from('1|2'))).toBe(false);
    expect(new LexoRank('8').lessThan(LexoRank.from('0|8'))).toBe(false);
    expect(new LexoRank('a').lessThan(new LexoRank('z'))).toBe(true);
    expect(new LexoRank('w').lessThan(new LexoRank('d'))).toBe(false);
    expect(new LexoRank('w').lessThan(new LexoRank('w'))).toBe(false);
    expect(new LexoRank('9').lessThan(new LexoRank('a'))).toBe(true);
    expect(new LexoRank('c').lessThan(new LexoRank('5'))).toBe(false);
  });

  test('multiple chars', () => {
    expect(new LexoRank('1324').lessThan(new LexoRank('1322', '2'))).toBe(false);
    expect(new LexoRank('1322').lessThan(new LexoRank('1322', '0'))).toBe(false);
    expect(new LexoRank('1a22').lessThan(new LexoRank('1b22'))).toBe(true);
    expect(new LexoRank('1522').lessThan(new LexoRank('1b11'))).toBe(true);
  });
});

describe('LexoRank - Increment', () => {
  test('single char', () => {
    expect(new LexoRank('1').increment().toString()).toBe('0|2');
    expect(new LexoRank('8', '1').increment().toString()).toBe('1|9');
    expect(new LexoRank('9', '0').increment().toString()).toBe('0|a');
    expect(new LexoRank('a', '2').increment().toString()).toBe('2|b');
    expect(LexoRank.from('2|y').increment().toString()).toBe('2|z');
    expect(LexoRank.from('0|z').increment().toString()).toBe('0|z1');
  });

  test('multiple chars', () => {
    expect(new LexoRank('11', '2').increment().toString()).toBe('2|12');
    expect(new LexoRank('2b').increment().toString()).toBe('0|2c');
    expect(new LexoRank('109', '2').increment().toString()).toBe('2|10a');
    expect(new LexoRank('abz', '1').increment().toString()).toBe('1|ac');
    expect(LexoRank.from('0|yzz').increment().toString()).toBe('0|z');
    expect(LexoRank.from('0|y2wzz').increment().toString()).toBe('0|y2x');
    expect(LexoRank.from('1|zzz').increment().toString()).toBe('1|zzz1');
  });
});

describe('LexoRank - Between', () => {
  test('throws for invalid input', () => {
    const lexBetween = (a: string | LexoRank, b: string | LexoRank) => jest.fn(() => LexoRank.between(a, b));

    expect(lexBetween('1|3', '1|1')).toThrow('3 is not less than 1');
    expect(lexBetween('1|3a', '1|34')).toThrow('3a is not less than 34');
    expect(lexBetween('1|z4', '1|z4')).toThrow('z4 is not less than z4');

    expect(lexBetween('1|z4', '2|z4')).toThrow('Lex buckets must be the same');
    expect(lexBetween(new LexoRank('a'), '2|z4')).toThrow('Lex buckets must be the same');
  });

  test('single char', () => {
    expect(LexoRank.between('0|1', '0|3').toString()).toBe('0|2');
    expect(LexoRank.between('1|1', '1|9').toString()).toBe('1|2');
    expect(LexoRank.between('1|9', '1|c').toString()).toBe('1|a');
    expect(LexoRank.between(new LexoRank('a', '2'), '2|z').toString()).toBe('2|b');
    expect(LexoRank.between('1|1', new LexoRank('2', '1')).toString()).toBe('1|11');
    expect(LexoRank.between(new LexoRank('a'), new LexoRank('b')).toString()).toBe('0|a1');
  });

  test('multiple chars', () => {
    expect(LexoRank.between('1|12', '1|1a').toString()).toBe('1|13');
    expect(LexoRank.between('0|101', '0|123').toString()).toBe('0|102');
    expect(LexoRank.between('0|11', '0|12').toString()).toBe('0|111');
    expect(LexoRank.between('2|az', '2|b').toString()).toBe('2|az1');
    expect(LexoRank.between('1|1a1', '1|1a11').toString()).toBe('1|1a101');
    expect(LexoRank.between('0|z4', new LexoRank('z41')).toString()).toBe('0|z401');
    expect(LexoRank.between(new LexoRank('z4', '2'), '2|z401').toString()).toBe('2|z4001');
    expect(LexoRank.between(new LexoRank('z401', '2'), new LexoRank('z40100001', '2')).toString()).toBe('2|z401000001');
  });
});
