export default interface IAssertionTests {
  [index: string]: {
    assertion(value: any): boolean | string;
    errmsg?: string;
  };
}
