export type ElementFields = Readonly<{
  [key: `elements__${string}`]: string | string[] | number | undefined;
}>;
