export function classNames(styles, ...names) {
  return names
    .filter(Boolean)
    .map((name) => styles[name])
    .join(' ')
}
