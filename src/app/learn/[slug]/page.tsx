import AlgorithmLesson from "@/components/lessons/AlgorithmLesson";
import ChemistryLab from "@/components/lessons/ChemistryLab";
import PhysicsSimulator from "@/components/lessons/PhysicsSimulator";

export default function LessonPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  if (slug === "chemistry-titration" || slug.includes("chem")) {
    return <ChemistryLab slug={slug} />;
  }

  if (slug === "physics-projectile" || slug.includes("phys")) {
    return <PhysicsSimulator slug={slug} />;
  }

  // Default to Algorithm / CS lesson
  return <AlgorithmLesson slug={slug} />;
}
