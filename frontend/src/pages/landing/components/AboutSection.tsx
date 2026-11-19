import React from 'react';
import {
  Code2,
  Server,
  Cpu,
  Database,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';

export const AboutSection: React.FC = () => {
  const techStack = [
    {
      name: 'Python',
      role: 'Core Backend Language',
      desc: 'Powers data pipelines, machine learning forecasting, and statistical profiling algorithms.',
      icon: <Code2 className="w-5 h-5 text-primary" />,
    },
    {
      name: 'FastAPI',
      role: 'Asynchronous API Framework',
      desc: 'Provides lightning-fast, typed REST endpoints with automatic OpenAPI validation and streaming.',
      icon: <Server className="w-5 h-5 text-cyan-400" />,
    },
    {
      name: 'Groq API',
      role: 'LPU AI Inference',
      desc: 'Delivers sub-100ms LLM inference for natural language semantic translation into ANSI SQL.',
      icon: <Cpu className="w-5 h-5 text-amber-400" />,
    },
    {
      name: 'MySQL',
      role: 'Relational Database Engine',
      desc: 'Stores structured transactional records with robust ACID compliance and relational integrity.',
      icon: <Database className="w-5 h-5 text-primary" />,
    },
    {
      name: 'Pandas',
      role: 'DataFrame Manipulation',
      desc: 'Handles multi-table joins, missing value imputation, type coercion, and summary statistics.',
      icon: <FileSpreadsheet className="w-5 h-5 text-violet-400" />,
    },
    {
      name: 'SQLGlot',
      role: 'AST Parser & Guardrails',
      desc: 'Parses and transpiles SQL syntax trees to enforce strictly read-only execution security.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    },
  ];

  return (
    <section id="about" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full border-t border-border/80">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Mission & Purpose */}
        <div className="lg:col-span-5 space-y-6">
          <Badge variant="tint" size="md">
            About DataTalk AI
          </Badge>

          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-main leading-tight">
            Democratizing data intelligence through conversational queries
          </h2>

          <p className="text-body text-secondary leading-relaxed">
            <strong>DataTalk AI</strong> was built to solve a fundamental analytics bottleneck: business leaders have questions, but data engineers are overwhelmed by ad-hoc SQL requests.
          </p>

          <p className="text-body text-secondary leading-relaxed">
            By combining high-speed AI inference with rigorous AST validation, DataTalk AI enables anyone to interrogate tabular data in everyday language while maintaining enterprise-grade safety and transparent, inspectable SQL.
          </p>

          <div className="space-y-2.5 pt-2 text-caption font-medium text-main">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>Zero black-box answers — full SQL transparency</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>Strict read-only guardrails preventing data mutation</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>Instant interactive Plotly visualizations</span>
            </div>
          </div>
        </div>

        {/* Right Column: 6 Core Technologies Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs uppercase font-mono font-semibold text-secondary tracking-wider">
              Underlying Technology Stack
            </span>
            <span className="text-xs font-mono text-primary">Modern AI Stack</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {techStack.map((tech) => (
              <Card
                key={tech.name}
                variant="glass"
                padded="md"
                className="space-y-2 border-border/80 hover:border-primary/50 transition-all hover:shadow-glow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-tint border border-primary/20 flex items-center justify-center shrink-0">
                    {tech.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-main text-caption">{tech.name}</h4>
                    <span className="text-[11px] font-mono text-secondary">{tech.role}</span>
                  </div>
                </div>
                <p className="text-xs text-secondary leading-relaxed pt-1">
                  {tech.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

