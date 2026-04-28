import { renderContent } from "./src/lib/renderContent";

const input = `Here is a question:
[IMAGE: A beautiful graph of f(x) = (x+1)e^{-x} with a maximum at (0,1)]
What is the derivative?`;

const output = renderContent(input);
console.log("Input:", input);
console.log("Output contains img:", output.includes("<img"));
console.log("Output:", output);
