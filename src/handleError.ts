export default function(err: Error): void {
  console.log(`Error: ${err.message}`);
  process.exit();
}
