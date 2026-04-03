import {
    CheckCircle2,
    Loader2,
    Circle,
    Zap,
    GitBranch,
} from 'lucide-react';
import type { Task } from '../../types/agent';
import ThoughtBox from './ThoughtBox';
import ToolBadge from './ToolBadge';

interface TaskCardProps {
    task: Task;
    allTasks: Task[];
}

function statusConfig(task: Task) {
    switch (task.status) {
        case 'completed':
            return {
                icon: <CheckCircle2 size={14} className="text-white" />,
                label: 'Completed',
                border: 'border-neutral-600',
                labelClass: 'text-neutral-300',
                glow: '',
            };
        case 'running':
            return {
                icon: <Loader2 size={14} className="text-white animate-spin" />,
                label: 'Running',
                border: 'border-white/30',
                labelClass: 'text-white',
                glow: 'animate-[pulseBorder_2s_ease-in-out_infinite]',
            };
        case 'cancelled':
            if (task.cancelReason === 'sufficient_data') {
                return {
                    icon: <Zap size={14} className="text-amber-400" />,
                    label: 'Optimized',
                    border: 'border-amber-500/30',
                    labelClass: 'text-amber-400',
                    glow: '',
                };
            }
            return {
                icon: <Circle size={14} className="text-neutral-500" />,
                label: 'Cancelled',
                border: 'border-neutral-700',
                labelClass: 'text-neutral-500',
                glow: '',
            };
        case 'pending':
        default:
            return {
                icon: <Circle size={14} className="text-neutral-600" />,
                label: 'Pending',
                border: 'border-neutral-800',
                labelClass: 'text-neutral-600',
                glow: '',
            };
    }
}

export default function TaskCard({ task, allTasks }: TaskCardProps) {
    const config = statusConfig(task);

    const depNames = task.dependencies
        .map((depId) => allTasks.find((t) => t.id === depId)?.name)
        .filter(Boolean);

    return (
        <div
            className={`
        rounded-lg border ${config.border} ${config.glow}
        bg-neutral-900/60 backdrop-blur-sm p-4
        transition-all duration-500 ease-out
        animate-[fadeSlideIn_0.4s_ease-out]
        flex-1 min-w-0
      `}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    {config.icon}
                    <h3 className="text-[13px] font-semibold text-neutral-100 truncate">
                        {task.name}
                    </h3>
                </div>
                <span
                    className={`shrink-0 text-[10px] font-medium uppercase tracking-wider ${config.labelClass}`}
                >
                    {config.label}
                </span>
            </div>

            {depNames.length > 0 && (
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-neutral-600">
                    <GitBranch size={10} />
                    <span>
                        Depends on:{' '}
                        {depNames.map((name, i) => (
                            <span key={i}>
                                <span className="text-neutral-500">{name}</span>
                                {i < depNames.length - 1 && ', '}
                            </span>
                        ))}
                    </span>
                </div>
            )}

            {task.tool && (
                <ToolBadge tool={task.tool} input={task.toolInput} result={task.toolResult} />
            )}

            <ThoughtBox thought={task.thought} />
        </div>
    );
}
