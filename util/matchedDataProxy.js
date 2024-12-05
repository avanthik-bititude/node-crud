// utils/matchedDataProxy.js
import { matchedData as originalMatchedData } from "express-validator";
export const matchedData = (...args) => originalMatchedData(...args);
