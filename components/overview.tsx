import { motion } from "framer-motion";
import { SkillFlowLogo } from "./skillflow-logo";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl">
        <div className="flex flex-row justify-center items-center">
          <SkillFlowLogo size={80} />
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Welcome to SkillFlow-AI Client Support
          </h1>

          <p className="text-lg text-muted-foreground">
            I'm your AI assistant, here to help you with questions about our products,
            services, pricing, and policies.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-left bg-muted/50 rounded-lg p-4">
          <p className="font-semibold text-sm">I can help you with:</p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Product features and capabilities</li>
            <li>• Pricing plans and billing questions</li>
            <li>• Account setup and management</li>
            <li>• Technical support and troubleshooting</li>
            <li>• Company policies and procedures</li>
          </ul>
        </div>

        <p className="text-sm text-muted-foreground">
          Ask me anything to get started, or choose one of the suggested questions below.
        </p>
      </div>
    </motion.div>
  );
};
