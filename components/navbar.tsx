"use client";

import { SkillFlowWordmark } from "./skillflow-logo";

export const Navbar = () => {
  return (
    <div className="p-4 flex flex-row gap-2 justify-between items-center border-b border-border">
      <div className="flex items-center">
        <SkillFlowWordmark height={28} />
      </div>

      <div className="flex items-center gap-2">
        <a
          href="mailto:support@skillflow-ai.com"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
};
