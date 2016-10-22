export const flattenObjectToArray = ob => {
  const toReturn = [];

  for (let i in ob) {
    if (!ob.hasOwnProperty(i)) continue;

    if ((typeof ob[i]) == "object") {
      const flatObject = flattenObjectToArray(ob[i]);
      for (let x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;

        toReturn.push(flatObject[x]);
      }
    } else {
      toReturn.push(ob[i]);
    }
  }
  return toReturn;
};
