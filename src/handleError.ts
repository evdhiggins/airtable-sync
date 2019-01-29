import { AssertionError } from "assert";

export default function(err: Error): void {
  if (err instanceof AssertionError) {
    console.error(`Schema Error: ${err.message}`);
  } else {
    console.error(err);
  }
  process.exit();
}
