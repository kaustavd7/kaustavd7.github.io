import InsightRoll from "@/src/components/About/InsightRoll";


const insights = [
    "A Thousand Splendid Suns",
    "The Tattooist of Auschwitz",
    "The Land I Dream Of",
    "And The Mountains Echoced",
    "Sea of Poppies",
    "Forty Rules Of Love",
    "The Kite Runner",
    "The Book Thief",
    "The Fountainhead",
    "The Architect's Apprentice",
    "Illusions"
  ];

export default function AboutLayout({ children }) {
  return (
    <main className="w-full flex flex-col items-center justify-between">
      <InsightRoll insights={insights} />
      {children}
    </main>
  );
}
