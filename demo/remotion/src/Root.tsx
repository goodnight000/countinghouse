import { Composition } from "remotion";
import { Demo, TOTAL } from "./Demo";
export const Root = () => (
  <Composition id="Demo" component={Demo} width={1920} height={1080} fps={30} durationInFrames={Math.round(TOTAL * 30)} />
);
