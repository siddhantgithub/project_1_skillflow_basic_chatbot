export const Footer = () => {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p>© 2024 SkillFlow-AI Client. All rights reserved.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <a 
              href="/privacy" 
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="/terms" 
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
            <a 
              href="mailto:support@skillflow-ai.com" 
              className="hover:text-foreground transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
        
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>Powered by SkillFlow-AI Technology</p>
        </div>
      </div>
    </footer>
  );
};

