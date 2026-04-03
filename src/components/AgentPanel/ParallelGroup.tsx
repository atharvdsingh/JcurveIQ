import { Layers } from 'lucide-react';
import type { Task } from '../../types/agent';
import TaskCard from './TaskCard';

interface ParallelGroupProps {
    tasks: Task[];
    allTasks: Task[];
}

export default function ParallelGroup({ tasks, allTasks }: ParallelGroupProps) {
    return (
        <div className="relative animate-[fadeSlideIn_0.4s_ease-out]">
            <div className="flex items-center gap-1.5 mb-2 text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
                <Layers size={10} />
                <span>Parallel Execution</span>
            </div>

            <div className="relative pl-4 border-l border-dashed border-neutral-700">
                <div className="flex flex-col md:flex-row gap-3">
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} allTasks={allTasks} />
                    ))}
                </div>
            </div>
        </div>
    );
}
