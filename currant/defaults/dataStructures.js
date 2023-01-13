
const CURRANT_STD_DATASTRUCTURES = `

    HshMap: type = $(keyType: type, valType: type) {

        loadFactor: f32 = 0.75f32;

        setLoadFactor: fun = (newLoadFactor: f32) {
            loadFactor = newLoadFactor;
        };

        setInitialCapacity: fun = (newInitialCapacity: u64 => newInitialCapacity > 0u64) {
            if(size() != 0u64, <- { ->; });
            buckets = [arr: newInitialCapacity: [Item: 0u64: none]];
        };

        getKeyType: fun = () -> type { -> keyType; };

        getValType: fun = () -> type { -> valType; };

        Item: type = $(key: keyType, value: valType) {};

        buckets: arr = [arr: 16u64: [Item: 0u64: none]];
        itemCount: u64 = 0u64;

        getBucketIndex: fun = (key: keyType) -> u64 {
            -> getKeyHash(key) % len(buckets);
        };

        getHashJsImpl: fun = f@currantGetHash;
        getKeyHash: fun = (key: keyType) -> u64 {
            -> u64~getHashJsImpl(key);
        };

        keys: fun = () -> arr {
            r: arr = [keyType: 0u64: none];
            for(buckets, (bucket: arr) -> lpa {
                for(bucket, (item: Item) -> lpa {
                    r = Array.add(r, item.key);
                    -> cont;
                });
                -> cont;
            });
            -> r;
        };

        values: fun = () -> arr {
            r: arr = [valType: 0u64: none];
            for(buckets, (bucket: arr) -> lpa {
                for(bucket, (item: Item) -> lpa {
                    r = Array.add(r, item.value);
                    -> cont;
                });
                -> cont;
            });
            -> r;
        };

        containsKey: fun = (key: keyType) -> bool {
            bucketIndex: u64 = getBucketIndex(key);
            found: bool = false;
            for(buckets[bucketIndex], (item: Item) -> lpa {
                if(item.key == key, <- {
                    found = true;
                    -> brk;
                });
                -> cont;
            });
            -> found;
        };

        containsValue: fun = (value: valType) -> bool {
            -> Array.contains(values(), value);
        };

        size: fun = () -> u64 {
            -> itemCount;
        };

        isEmpty: fun = () -> bool {
            -> itemCount == 0u64;
        };

        put: fun = (key: keyType, value: valType) {
            bucketIndex: u64 = getBucketIndex(key);
            found: bool = false;
            for(buckets[bucketIndex], (item: Item) -> lpa {
                if(item.key == key, <- {
                    item.value = value;
                    found = true;
                    -> brk;
                });
                -> cont;
            });
            if(!found, {
                buckets[bucketIndex] = Array.add(buckets[bucketIndex], Item(key, value));
                itemCount = itemCount + 1u64;
                if(size() > u64~(f64~len(buckets) * f64~loadFactor), {
                    oldBuckets: arr = buckets;
                    buckets = [arr: len(buckets) * 2u64: [Item: 0u64: none]];
                    for(oldBuckets, (bucket: arr) -> lpa {
                        for(bucket, (item: Item) -> lpa {
                            bucketIndex: u64 = getBucketIndex(item.key);
                            buckets[bucketIndex] = Array.add(buckets[bucketIndex], item);
                            -> cont;
                        });
                        -> cont;
                    });
                });
            });
        };

        get: fun = (key: keyType) -> Box {
            bucketIndex: u64 = getBucketIndex(key);
            foundBox: Box = NoneBox();
            for(buckets[bucketIndex], (item: Item) -> lpa {
                if(item.key == key, <- {
                    foundBox = Box(item.value);
                    -> brk;
                });
                -> cont;
            });
            -> foundBox;
        };

        getOrDefault: fun = (key: keyType, defaultValue: valType) -> valType {
            r: Box = get(key);
            if(r.isSome(), <- { -> r.unwrap(); });
            -> defaultValue;
        };

        remove: fun = (key: keyType) {
            bucketIndex: u64 = getBucketIndex(key);
            itemIndex: Box = NoneBox();
            for(range(0u64, len(buckets[bucketIndex])), (i: u64) -> lpa {
                if(buckets[bucketIndex][i].key == key, <- {
                    itemIndex = Box(i);
                    -> brk;
                });
                -> cont;
            });
            if(itemIndex.isNone(), <- { ->; });
            buckets[bucketIndex] = Array.removeAt(buckets[bucketIndex], itemIndex.unwrap());
            itemCount = itemCount - 1u64;
        };

    };

`;

function currantGetHash(value) {
    let asString = JSON.stringify(value);
    let hash = 0, i, chr;
    if(asString.length === 0) return hash;
    for(i = 0; i < asString.length; i++) {
        chr = asString.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return currantCreateU32(hash);
}