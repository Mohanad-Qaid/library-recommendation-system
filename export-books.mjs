import { writeFileSync } from "fs";
import { mockBooks } from "./src/services/mockData.ts";

writeFileSync("books.json", JSON.stringify(mockBooks, null, 2));
console.log("Wrote books.json with", mockBooks.length, "books");
