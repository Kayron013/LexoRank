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
const btwn = LexoRank.between('0|e5z1', '0|ez11');
expect(btwn.toString()).toBe('0|e5z101');
```
