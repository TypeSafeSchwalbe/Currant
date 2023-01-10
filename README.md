![Currant-Logo](logo.png)
# Currant
Currant is a single-threaded programming language that runs in the browser. It has easy interoperability with JavaScript and can be easily embedded into a webpage.
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

getTestFun()()();
```

Documentation, a license and a proper README.md will come soon.
