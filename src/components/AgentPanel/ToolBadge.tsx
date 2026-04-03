import {
    Search,
    FileText,
    Calculator,
    Database,
    Globe,
    BarChart3,
} from 'lucide-react';
import type { ToolName } from '../../types/agent';

const toolConfig: Record<ToolName, { icon: React.ElementType; label: string }> = {
    google_search: { icon: Search, label: 'Google Search' },
    sec_parser: { icon: FileText, label: 'SEC Parser' },
    calculator: { icon: Calculator, label: 'Calculator' },
    database_query: { icon: Database, label: 'Database' },
    web_scraper: { icon: Globe, label: 'Web Scraper' },
    sentiment_analyzer: { icon: BarChart3, label: 'Sentiment' },
};

interface ToolBadgeProps {
    tool: ToolName;
    input?: string;
    result?: string;
}

export default function ToolBadge({ tool, input, result }: ToolBadgeProps) {
    const config = toolConfig[tool];
    if (!config) return null;

    const Icon = config.icon;

    return (
        <div className="mt-3 space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-neutral-300">
                <Icon size={12} className="text-neutral-400" />
                {config.label}
            </div>

            {(input || result) && (
                <div className="rounded-md border border-neutral-800/60 bg-neutral-950/50 text-[11px] font-mono divide-y divide-neutral-800/60">
                    {input && (
                        <div className="px-3 py-2 text-neutral-500">
                            <span className="text-neutral-600 mr-1.5 select-none">IN</span>
                            {input}
                        </div>
                    )}
                    {result && (
                        <div className="px-3 py-2 text-neutral-300">
                            <span className="text-neutral-600 mr-1.5 select-none">OUT</span>
                            {result}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
