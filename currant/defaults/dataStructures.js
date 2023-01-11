
const CURRANT_STD_DATASTRUCTURES = `

    HashMap: type = $(keyType: type, valType: type) {

        getKeyType: fun = () -> type { -> keyType; };

        getValType: fun = () -> type { -> valType; };

        Item: type = $(key: keyType, value: valType) {};

        getHashJsImpl: fun = f@currantGetHash;
        getKeyHash: fun = (key: keyType) -> f64 {
            -> f64~getHashJsImpl(key) / f64~Math.UINT_32_MAX;
        };

        buckets: arr = [arr: 16u64: [Item: 0u64: none]];

        getBucketIndex: fun = (key: keyType) -> u64 {
            -> u64~(getKeyHash(key) * f64~len(buckets));
        };

        set: fun = (key: keyType, value: valType) {
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
            });
        };

    };
    HshMap: type = HashMap;

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