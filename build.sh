
python3 build.py currant.js \
currant/parsing/preprocessor.js \
currant/parsing/lexer.js \
currant/types/typeUtils.js \
currant/nodes/node.js \
currant/nodes/blockNode.js \
currant/nodes/literalNode.js \
currant/nodes/variableNodes.js \
currant/nodes/jsReference.js \
currant/nodes/booleanLogic.js \
currant/nodes/numberOperations.js \
currant/nodes/comparisons.js \
currant/nodes/parentheses.js \
currant/nodes/getType.js \
currant/types/types.js \
currant/types/unsignedIntegers.js \
currant/types/signedIntegers.js \
currant/types/boolean.js \
currant/types/floatingPoint.js \
currant/types/function.js \
currant/types/nothing.js \
currant/types/pointer.js \
currant/types/array.js \
currant/types/customType.js \
currant/types/string.js \
currant/defaults/types.js \
currant/defaults/console.js \
currant/defaults/conditions.js \
currant/defaults/math.js \
currant/defaults/loops.js \
currant/defaults/boxes.js \
currant/defaults/strings.js \
currant/defaults/time.js \
currant/defaults/arrays.js \
currant/defaults/dataStructures.js \
currant/stack.js \
currant/scriptLoader.js \
currant/currant.js \
currant/currantScript.js

lineCount=$(cat currant.js | wc -l)
fileCount=$(find currant -type f | wc -l)
notify-send Built\ project\ \"Currant\" Built\ $lineCount\ lines\ of\ code\ over\ $fileCount\ files