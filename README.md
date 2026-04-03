# Live Agent Run Panel

A comprehensive React application built for the **JcurveIQ Frontend Engineer Take-Home Assessment**. It visualizes a real-time stream of AI agent events within a financial platform context (Portfolio Risk Assessment), rendering streaming states, parallel executions, and agent reasoning.

## Features

- **Real-Time Event Streaming**: Simulates a live agent workflow with staggered timing, showing tasks as they are `pending`, `running`, `completed`, or `cancelled`.
- **Question-Driven Flow**: The agent stream is triggered by a user prompt (e.g., "Analyze my portfolio risk exposure"), displaying the query as context.
- **Parallel Task Execution**: Automatically detects tasks executing concurrently (sharing the same sequence/start time) and groups them visually side-by-side using horizontal layout structures to make concurrency obvious.
- **Collapsible Reasoning (Thoughts)**: Each task features an expandable "Terminal" thought box displaying the agent's internal reasoning process.
- **Tool Invocations**: Visualizes tool calls (e.g., Google Search, SEC Parser, VaR Calculator) with clear input and output data blocks and corresponding Lucide icons.
- **"Optimized" State Handling**: Gracefully handles task cancellations caused by `sufficient_data` by badging them as "Optimized" (amber accent) rather than treating them as errors.
- **Strict Monochrome Theme**: Designed with a high-contrast, black-and-white aesthetic fitting for a modern financial platform, using subtle borders and typography hierarchies (Tailwind CSS).

## Tech Stack

- **React 19** 
- **TypeScript**
- **Tailwind CSS v4** (No component libraries used)
- **Vite** (Build tool)
- **Lucide-React** (Icons)

*(Note: The project strictly adheres to the requirement of not using pre-built UI component libraries like TailwindUI, Radix, or Shadcn.)*

## Architecture Overview

1. **State Management (`useAgentStream.ts`)**: 
   - Uses `useReducer` to manage the complex stream state deterministically.
   - Handles the progression of 17 mock financial events (simulating a portfolio analysis pipeline).
   - Dynamically calculates parallel groups based on `startTime`.
   - Idempotent stream scheduling with proper cleanup to effortlessly support React StrictMode.
   
2. **Components (`src/components/AgentPanel/`)**:
   - `AgentRunPanel`: The root orchestrator, managing layout, input prompts, progress bars, and stats.
   - `TaskCard`: The main unit of work display, indicating status, tools, and recursive reasoning.
   - `ParallelGroup`: A specialized container that intercepts concurrent tasks and renders them horizontally.
   - `ToolBadge` & `ThoughtBox`: Modular UI components for high information density.

## Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm (recommended) or npm

### Installation & Running Locally

1. Clone the repository and navigate into the project directory:
   ```bash
   git clone git@github.com:atharvdsingh/JcurveIQ.git
   cd assignment
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open your browser and navigate to `http://localhost:5174/` (or the port specified in your console).

## Design Decisions

- **Parallel Visualization**: Chose a horizontal Flexbox layout with a dashed accent line (`ParallelGroup.tsx`) to represent concurrency, as stacking parallel items vertically obscures their simultaneous nature.
- **Information Density vs. Cognitive Load**: Kept tool inputs/outputs and reasoning chunks collapsed or subtly styled by default to ensure the top-level pipeline remains scannable.
- **No Dependencies on Component Libraries**: Crafted all animations (e.g., pulsing borders for running tasks, `fadeSlideIn`) manually via CSS and Tailwind classes (`index.css`) to demonstrate core CSS competency.
