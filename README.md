![Currant-Logo](logo.png)
# Currant
Currant is a single-threaded programming language that runs in the browser. It has simple interoperability with JavaScript and can be easily embedded into a webpage.
# Using in your project
File structure:
```
- ./
    - index.html
    - currant.js
    - test.crn
```
``index.html``:
```html
<!doctype html>
<html>
    <head>
         <!-- import currant -->
         <script src="currant.js"></script>
         <!-- load script "test.crn" -->
         <currant-script src="test.crn"></currant-script>
    </head>
    <body>
    </body>
</html>
```
``test.crn``:
```
log("Hello, World!");
```

When Currant is loaded, it can also be called to run any string containing Currant source code from JavaScript, like this:
```js
// an instance of the currant interpreter get's loaded into "currant" at load time
currant.run(`log("Hello, World!");`);
```
# Language Details
The langauge features NO special keywords, as everything is either a variable access, function call or special operation, which therefore also deserves a special symbol. 
```
// "?" means the type get's defined by whatever get's passed to the function
// "-> {x}" means return {x}
// "#{x}" gets the type of {x}

getTypeOf: fun = (val: ?) -> type {
    -> #val;
};
```
Currant features the following base types:
- type - a type
- u8 - unsigned 8-bit integer
- u16 - unsigned 16-bit integer
- u32 - unsigned 32-bit integer
- u64 - unsigned 64-bit integer
- i8 - signed 8-bit integer
- i16 - signed 16-bit integer
- i32 - signed 32-bit integer
- i64 - signed 64-bit integer
- f32 - 32-bit float
- f64 - 64-bit float
- bool - boolean
- none - nothing, the return type of a function defined not to have one
- fun - function
- ptr - pointer
- arr - array
- str - string 

It features functions and types as first-class-members, meaning this is valid Currant code:
```
getVarType: fun = () -> type {
    -> i32;
};

test: getVarType() = 5i32;

getTestFun: fun = () -> fun {
    log("Hello, World!");
    -> getTestFun;
};

getTestFun()()(); // logs "Hello, World" (3 times)
```
As types are first class members, they may be assigned to other variables as well:
```
int: type = i32;
long: type = i64;
float: type = f32;
double: type = f64;

add: fun = (a: int, b: int) -> int { -> a + b; };
log(add(5i32, 15i32)); // logs 20
```
Currant uses functions for ``while``, ``for`` and ``if``.
```
for(range(0u64, 100u64), (i: u64) -> lpa {
    if(i == 16u64, <- { // "<-" makes the function passed to the if-function return the value to the outer block instead
        -> cont;
    });
    log(i);
    -> cont;
});
// logs all integers from 0 to 99, except 16
```
Currant uses pointers instead of references, meaning the following code creates a copy of ``a`` into ``b``, instead of referencing it.
```
a: Box = Box(5i32);
b: Box = a;
```
To point to a value, use ``ptr``.
```
a: i32 = 5i32;
b: ptr = &a;
a = 10i32;
c: i32 = *b;
log(c); // logs 10
```
Arrays in Currant can be defined in two ways:
```
// option 1: "[ {type}: {element0}, {element1}, {element2}, ... ]"
a: arr = [i32: 0i32, 1i32, -5i32, 10i32]; // [0i32, 1i32, -5i32, 10i32]


// option 2: "[ {type}: {length (u64)}: {default-element} ]"
b: arr = [i32: 5u64: -1i32]; // [-1i32, -1i32, -1i32, -1i32, -1i32]
```
To get the length of an Array or String, use the built in length-function:
```
log(len("Hello, World!")); // logs 13
```
For other operations on Arrays and Strings, call
```js
currant.run("-> Array")
```
```js
currant.run("-> String")
```
in your browser console and inspect the returned object to see what methods both types provide.   

Currant can also easily import JavaScript functions and call them:   
``test.js``:
```js
function add(a, b) {
    return a + b;
}
```
``test.crn``;
```
log(f@add(5i32, 10i32)); // logs 15

add: fun = f@add;
log(add(5i32, 10i32)); // logs 15
```

Currant can also pass functions to JavaScript, which are then callable from JavaScript:   
``test.js``:
```js
function callCallback(callback) {
    callback();
}
```
``test.crn``:
```
callCallback: fun = f@callCallback;
callCallback({
    log("Hello, World!"); // logs "Hello, World!"
});
```
Currant also provides a bunch of utility functions that may be used to pass values to these functions:   
``test.js``:
```js
function callCallbackWithRandom(callback) {
    callback(currantCreateF64(Math.random()));
}
```
``test.crn``:
```
callCallbackWithRandom: fun = f@callCallbackWithRandom;
callCallbackWithRandom((x: f64) {
    log(x); // Logs a random value between 0 and 1
});
```
- currantCreateU{8,16,32,64}
- currantCreateI{8,16,32,64}
- currantCreateF{32,64}
- currantCreateBool
- currantCreateFun
- currantCreateStr
# Misc.

Documentation, a license and a full README.md will come soon.
