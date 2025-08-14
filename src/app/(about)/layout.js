import InsightRoll from "@/src/components/About/InsightRoll";


const insights = [
    "A Thousand Splendid Suns",
    "The Tattooist of Auschwitz",
  ];

export default function AboutLayout({ children }) {
  return (
    <main className="w-full flex flex-col items-center justify-between">
      <InsightRoll insights={insights} />
      {children}
    </main>
  );
}
