import { useDemoStore } from "@/state/demoStore";

export default function Home() {
  const { setFlowState } = useDemoStore();

  return (
    <div>
      <h1>Debug your data history</h1>

      <button
        onClick={() => setFlowState("loading_demo")}
      >
        Run example
      </button>
    </div>
  );
}