import Hero from "@/components/tc/Hero";
import { Bench, Handoffs, Refusals, Close, TcFooter } from "@/components/tc/sections";

export default function TCombinatorPage() {
  return (
    <main>
      <Hero />
      <hr className="tc-rule" />
      <Handoffs />
      <div id="bench">
        <Bench />
      </div>
      <Refusals />
      <Close />
      <TcFooter />
    </main>
  );
}
