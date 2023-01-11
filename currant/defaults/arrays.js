
const CURRANT_STD_ARRAYS = `

    ArrayFunctionsType: type = $() {

        itemType: fun = f@currantArrayItemType;

        reverse: fun = (src: arr) -> arr {
            if(len(src) == 0u64, <- { -> [itemType(src): 0u64, 0u8]; });
            dest: arr = [itemType(src): len(src): src[0u64]];
            for(range(0u64, len(src)), (i: u64) -> lpa {
                dest[len(src) - 1u64 - i] = src[i];
                -> cont;
            });
            -> dest;
        };
        rev: fun = reverse;

        copyRange: fun = (src: arr, start: u64, end: u64) -> arr {
            destLength: u64 = Math.max(start, end) - Math.min(start, end);
            if(destLength == 0u64, <- { -> [itemType(src): 0u64: 0u8]; });
            dest: arr = [itemType(src): destLength: src[0u64]];
            destIndex: u64 = 0u64;
            for(range(start, end), (srcIndex: u64) -> lpa {
                dest[destIndex] = src[srcIndex];
                destIndex = destIndex + 1u64;
                -> cont;
            });
            -> dest;
        };

        copyIntoPtr: fun = (src: arr, srcStart: u64, dest: ptr, destStart: u64, elements: u64) {
            for(range(0u64, elements), (i: u64) -> lpa {
                *dest[destStart + i] = src[srcStart + i];
                -> cont;
            });
        };

        copyIntoCopy: fun = (src: arr, srcStart: u64, dest: arr, destStart: u64, elements: u64) -> arr {
            copyIntoPtr(src, srcStart, &dest, destStart, elements);
            -> dest;
        };

        addAt: fun = (src: arr, index: u64, item: itemType(src)) -> arr {
            dest: arr = [itemType(src): len(src) + 1u64: item];
            copyIntoPtr(src, 0u64, &dest, 0u64, index);
            dest[index] = item;
            copyIntoPtr(src, index, &dest, index + 1u64, len(src) - index);
            -> dest;
        };

        add: fun = (src: arr, item: itemType(src)) -> arr {
            -> addAt(src, len(src), item);
        };

        append: fun = (src: arr, items: arr) -> arr {
            if(itemType(src) != itemType(items), { panic("item types of the given arrays do not match"); });
            if(len(src) == 0u64, <- { -> items; });
            if(len(items) == 0u64, <- { -> src; });
            dest: arr = [itemType(src): len(src) + len(items): src[0u64]];
            copyIntoPtr(src, 0u64, &dest, 0u64, len(src));
            copyIntoPtr(items, 0u64, &dest, len(src), len(items));
            -> dest;
        };

        indexOf: fun = (src: arr, item: itemType(src)) -> Box {
            result: Box = NoneBox();
            for(reverse(range(0u64, len(src))), (i: u64) -> lpa {
                if(src[i] == item, { result = Box(i); });
                -> cont;
            });
            -> result;
        };

        lastIndexOf: fun = (src: arr, item: itemType(src)) -> Box {
            result: Box = NoneBox();
            for(range(0u64, len(src)), (i: u64) -> lpa {
                if(src[i] == item, { result = Box(i); });
                -> cont;
            });
            -> result;
        };

        contains: fun = (src: arr, item: itemType(src)) -> bool {
            -> indexOf(src, item).isSome();
        };

        containsAll: fun = (src: arr, items: arr) -> bool {
            if(itemType(src) != itemType(items), { panic("item types of the given arrays do not match"); });
            if(len(items) == 0u64, <- { -> true; });
            if(len(src) == 0u64, <- { -> false; });
            notFound: bool = false;
            for(items, (item: itemType(items)) -> lpa {
                if(!contains(src, item), <- {
                    notFound = true;
                    -> brk;
                });
                -> cont;
            });
            -> !notFound;
        };

        removeAt: fun = (src: arr, index: u64) -> arr {
            if(len(src) == 0u64, { panic("given array is already empty"); });
            dest: arr = [itemType(src): len(src) - 1u64: src[0u64]];
            copyIntoPtr(src, 0u64, &dest, 0u64, index);
            copyIntoPtr(src, index + 1u64, &dest, index, len(dest) - index);
            -> dest;
        };

        remove: fun = (src: arr, item: itemType(src)) -> arr {
            removalIndex: Box = indexOf(src, item);
            if(removalIndex.isNone(), <- { -> src; });
            -> removeAt(src, removalIndex.unwrap());
        };

        removeLast: fun = (src: arr, item: itemType(src)) -> arr {
            removalIndex: Box = lastIndexOf(src, item);
            if(removalIndex.isNone(), <- { -> src; });
            -> removeAt(src, removalIndex.unwrap());
        };

    };
    Array: ArrayFunctionsType = ArrayFunctionsType();

`;

function currantArrayItemType(array) {
    if(typeof array.ref === "undefined" || !(array.ref instanceof CurrantArray))
        throw new Error("parameter at index 0 is not an array");
    return array.ref.itemType;
}