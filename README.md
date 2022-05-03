# Simple Algebra


## Notes

This project uses [custom elements] to implement a simple algebra renderer.

This is **work in progress** and only four components have been implemented thus far:

- `<sas-expressiob>` which renders its `value`
- `<sas-value>` which renders a value (e.g. `2` or `x`)
- `<sas-sum>` which renders a sum
- `<sas-product>` which renders a product

This exercise is not "complete" in the sense that it does not provide a user interface
for manipulating the expression by drag-and-drop. The API couldn't really be simpler: you simply 
reorder the terms within a given array.

e.g.

2(x + 1) + 5y + z is represented thus:

```
['+', ['*', 2, ['+', 'x', 1]], ['*', 5, 'y'], 'z']
```

Every element comprises an array where the first item defines the type of element
and the others are the terms. Reordering the terms works exactly as you would expect.


## Running the Project

1. `cd` to the directory
2. `npm install`
3. `npm run test`
4. open `localhost:8080` in your browser


## Data Structures

### Equation

```
['=', *expression*, *expression*]
```

Examples:

x + 17 = 21

```
['+', 'x', 17]
```

s = ut + 1/2 ⨉ at<sup>2</sup>

```
['=', 's', ['+', ['*', 'u', 't'], ['*', ['/', 1, 2], 'a', ['^', 't', 2]]]]
```

E = mc^1

```
['=', 'E', ['*', 'm', ['^', ['k', 'c'], 2]
```

### Value

```
['#', 17]   // 17
['#-', 'x'] // -x
```

In general, a naked value (e.g. `17` or `-11` is interchangeable with the structure above.

### Constant

```
['k', 'π', 3.1415926535]
['k', 'i']
['k', 'e', 2.7182818285]
['k', 'c', '3E+8]
['k', 'g', 6.6743E-11]
```

The character merely represents the way in which the value will be depicted. The optional third value is used for computation.

### Sum

```
['+', *expression*, ...]
```

### Product

```
['-', *expression*, ...]
```

### Fraction

```
['/', *expression*, *expression*]
```

### Power

```
['^', *expression*, *expression*]
```

### Root

```
['√', *expression*, *expression*]
```

## Hydration / Dehydration

The first value for each item can be "hydrated" with an object expressing all kinds of metadata for the object and dehydrated by reducing it to the specified character.

This would also allow for suggestions, etc. to be generated client/server-side (or both).