import "@testing-library/jest-dom";

// Polyfill TextEncoder/TextDecoder for react-router in Node
import { TextEncoder, TextDecoder } from "util";
// @ts-expect-error override globals for Jest
global.TextEncoder = TextEncoder;
// @ts-expect-error override globals for Jest
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

