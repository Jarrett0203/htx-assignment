import { Task } from "../types";

interface SkillPillsProps {
  skills: Task["skills"];
}

const SkillPills = ({ skills }: SkillPillsProps) => {
  return (
    <div className="flex flex-wrap gap-1">
      {skills.map((s) => (
        <span
          key={s.skill.id}
          className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
        >
          {s.skill.name}
        </span>
      ))}
    </div>
  );
};

export default SkillPills;
