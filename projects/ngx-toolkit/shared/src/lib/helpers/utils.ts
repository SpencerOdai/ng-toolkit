export const getRandomNumber = (min: number, max: number, precision = true) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  if (precision) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  } else {
    return (Math.random() * (max - min)) + min;
  }
};

export const getRandom = (arr: string | any[], n: number) => {
  const result = new Array(n);
  let len = arr.length;
  const taken = new Array(len);
  if (n > len) {
    throw new RangeError('getRandom: more elements taken than available');
  }
  while (n--) {
    const x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
};

export const groupBy = (xs: any[], key: string): any[] => {
  return xs.reduce((rv, x) => {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, []);
};

export const logError = (err: any) => {
  console.warn(err);
};

export const getPropByString = (obj: any, propName: string) => {
  propName = propName.replace(/\[(\w+)\]/g, '.$1');
  propName = propName.replace(/^\./, '');
  const a = propName.split('.');
  for (let i = 0, n = a.length; i < n; ++i) {
    const k = a[i];
    if (obj && k in obj) {
      obj = obj[k];
    } else {
      return;
    }
  }
  return obj;
};

export const toCamelCase = (str: string) => {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
};
