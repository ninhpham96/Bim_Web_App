import { Serializer } from "./serializer/serializer";

const inputPath = "../../Data/VILLA_LBT.json";
const outputPath = "../../Data/output";
const serializer = new Serializer();

(async () => {
  await serializer.compress(inputPath, outputPath);
})()
