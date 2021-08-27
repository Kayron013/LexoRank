# LexoRank

An immutable class implementation of the [LexoRank ranking system](https://youtu.be/OjQv9xMoFbg) by Atlassian JIRA.

## Usage

### Create and read rank.

```ts
const rank = new LexoRank('zc4b', '0');
// or
// const rank = new LexoRank('zc4b'); // default bucket of `0`
// or
// const rank = LexoRank.from('0|zc4b');

expect(rank.toString()).toBe('0|zc4b');
expect(rank.bucket).toBe('0');
expect(rank.value).toBe('zc4b');
```

Ranks ending in `0` are disallowed to avoid ajacencies.
As a result, there is always room to insert between two unequal ranks.

```ts
expect(new LexoRank('2c0', '1')).toThrow('Invalid lex value');
expect(LexoRank.from('1|2c0')).toThrow('Invalid lex string');
```

### Increment a rank.

```ts
const rank = new LexoRank('a3c', '2');
const newRank = rank.increment();

expect(rank.toString()).toBe('2|a3c');
expect(newRank.toString()).toBe('2|a3d');
```

```ts
const rank = new LexoRank('x2z');
const newRank = rank.increment();

expect(rank.toString()).toBe('0|x2z');
expect(newRank.toString()).toBe('0|x3');
```

### Decrement a rank.

```ts
const rank = new LexoRank('a3c', '2');
const newRank = rank.decrement();

expect(rank.toString()).toBe('2|a3c');
expect(newRank.toString()).toBe('2|a3b');
```

```ts
const rank = new LexoRank('zz');
const newRank = rank.decrement();

expect(rank.toString()).toBe('0|zz');
expect(newRank.toString()).toBe('0|y');
```

```ts
const rank = new LexoRank('11');
const newRank = rank.decrement();

expect(rank.toString()).toBe('0|11');
expect(newRank.toString()).toBe('0|01');
```

### Get a rank in between two ranks

```ts
const rank1 = new LexoRank('9a2r');
const rank2 = new LexoRank('9a3r');

const btwn = LexoRank.between(rank1, rank2);
expect(btwn.toString()).toBe('0|9a2s');
```

```ts
const btwn = LexoRank.between('0|e5z', '0|e6');
expect(btwn.toString()).toBe('0|e5z1');
```

```ts
const btwn = LexoRank.between('0|e5z1', '0|e5z11');
expect(btwn.toString()).toBe('0|e5z101');
```

```ts
const btwn = LexoRank.between('0|e5z1', null);
expect(btwn.toString()).toBe('0|e5z2');
```

```ts
const btwn = LexoRank.between(null, '0|e5z11');
expect(btwn.toString()).toBe('0|d');
```
