export function formatPropertyType(propertyName: string) {
  if (propertyName.includes("-")) {
    return propertyName
      .split("_")
      .map((e) => e[0].toUpperCase() + e.slice(1))
      .join(" ");
  } else if (propertyName.includes("_")) {
    return propertyName
      .split("_")
      .map((e) => e[0].toUpperCase() + e.slice(1))
      .join(" ");
  } else {
    return propertyName[0].toUpperCase() + propertyName.slice(1);
  }
}
