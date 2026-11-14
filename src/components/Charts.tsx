import React, { useState } from 'react';
import type { AssessmentPoint, SkillTrendPoint } from '../data/presets';

interface SkillChartProps {
  data: SkillTrendPoint[];
  isSampleBaseline: boolean;
}

export const SkillImprovementChart: React.FC<SkillChartProps> = ({
  data,
  isSampleBaseline,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 620;
  const height = 220;
  const padLeft = 38;
  const padRight = 18;
  const padTop = 18;
  const padBottom = 32;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const getX = (i: number) =>
    data.length <= 1 ? padLeft + plotW / 2 : padLeft + (i / (data.length - 1)) * plotW;
  const getY = (val: number) =>
    padTop + plotH - (Math.max(0, Math.min(100, val)) / 100) * plotH;

  const buildPath = (key: 'coreSkills' | 'appliedPractice' | 'interviewReadiness') =>
    data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d[key]).toFixed(1)}`)
      .join(' ');

  const areaPath =
    data.length > 0
      ? `${buildPath('coreSkills')} L ${getX(data.length - 1).toFixed(1)} ${(
          padTop + plotH
        ).toFixed(1)} L ${getX(0).toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`
      : '';

  const activePoint = hoveredIdx !== null ? data[hoveredIdx] : data[data.length - 1];

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" />
            Core Skills
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-blue-500 inline-block" />
            Applied Practice
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-violet-400 inline-block" />
            Interview Readiness
          </span>
        </div>
        <span className="text-xs text-slate-400 font-mono tabular-nums">
          {isSampleBaseline ? 'Sample baseline · Live updates as you learn' : 'Live learner progression'}
        </span>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          role="img"
          aria-label="Skill improvement trend chart"
        >
          <defs>
            <linearGradient id="elevoraAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {[0, 25, 50, 75, 100].map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="rgba(148,163,184,0.12)"
                  strokeDasharray={tick === 0 ? undefined : '3 3'}
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-500 text-[10px] font-mono tabular-nums"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {areaPath && <path d={areaPath} fill="url(#elevoraAreaGrad)" />}

          <path
            d={buildPath('interviewReadiness')}
            fill="none"
            stroke="#A78BFA"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={buildPath('appliedPractice')}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={buildPath('coreSkills')}
            fill="none"
            stroke="#22D3EE"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {data.map((d, i) => {
            const x = getX(i);
            const isActive = hoveredIdx === i;
            return (
              <g
                key={d.week}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {isActive && (
                  <line
                    x1={x}
                    y1={padTop}
                    x2={x}
                    y2={padTop + plotH}
                    stroke="rgba(34,211,238,0.35)"
                    strokeWidth="1"
                  />
                )}
                <circle
                  cx={x}
                  cy={getY(d.coreSkills)}
                  r={isActive ? 5 : 3}
                  fill="#060B18"
                  stroke="#22D3EE"
                  strokeWidth="2"
                />
                <circle
                  cx={x}
                  cy={getY(d.appliedPractice)}
                  r={isActive ? 4.5 : 2.5}
                  fill="#060B18"
                  stroke="#3B82F6"
                  strokeWidth="2"
                />
                <circle
                  cx={x}
                  cy={getY(d.interviewReadiness)}
                  r={isActive ? 4.5 : 2.5}
                  fill="#060B18"
                  stroke="#A78BFA"
                  strokeWidth="2"
                />
                <rect
                  x={x - plotW / (data.length * 2)}
                  y={padTop}
                  width={plotW / data.length}
                  height={plotH + 24}
                  fill="transparent"
                />
                <text
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  className={`text-[10px] font-mono tabular-nums ${
                    isActive ? 'fill-cyan-300' : 'fill-slate-500'
                  }`}
                >
                  {d.week}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {activePoint && (
        <div className="mt-3 pt-3 border-t border-white/[0.07] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <span className="font-medium text-slate-400">
            Selected Window: <span className="text-slate-100">{activePoint.week}</span>
          </span>
          <div className="flex items-center gap-4 font-mono tabular-nums">
            <span className="text-cyan-300">Core {activePoint.coreSkills}%</span>
            <span className="text-blue-400">Practice {activePoint.appliedPractice}%</span>
            <span className="text-violet-300">Interview {activePoint.interviewReadiness}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface AssessmentChartProps {
  data: AssessmentPoint[];
  hasLiveData: boolean;
}

export const AssessmentPerformanceChart: React.FC<AssessmentChartProps> = ({
  data,
  hasLiveData,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const items = data.slice(-6);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <span className="text-xs text-slate-400">
          Score out of 100 across recent evaluations
        </span>
        <span className="text-xs text-slate-400 font-mono tabular-nums">
          {hasLiveData ? 'Live mock interview scores' : 'Sample baseline benchmark'}
        </span>
      </div>

      <div className="flex-1 flex items-end gap-3 min-h-[196px] pt-6 pb-2 border-b border-white/[0.07]">
        {items.map((item, idx) => {
          const isHovered = hoveredIdx === idx;
          const barColor =
            item.category === 'HR'
              ? 'from-cyan-500 to-blue-500'
              : 'from-violet-500 to-blue-600';
          return (
            <div
              key={`${item.label}-${idx}`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
            >
              <span
                className={`text-xs font-mono tabular-nums mb-1.5 transition-colors ${
                  isHovered ? 'text-cyan-300 font-semibold' : 'text-slate-400'
                }`}
              >
                {item.score}
              </span>
              <div className="w-full max-w-[44px] h-[140px] bg-slate-900/80 rounded-t-md border border-white/[0.06] flex items-end overflow-hidden">
                <div
                  className={`w-full bg-gradient-to-t ${barColor} transition-all duration-200 rounded-t-sm ${
                    isHovered ? 'opacity-100 brightness-110' : 'opacity-85'
                  }`}
                  style={{ height: `${Math.max(8, Math.min(100, item.score))}%` }}
                />
              </div>
              <span className="mt-2 text-[11px] text-slate-300 truncate max-w-[74px] text-center">
                {item.label}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{item.category}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>
          {hasLiveData
            ? `${items.length} completed assessment${items.length === 1 ? '' : 's'}`
            : 'Complete a Mock Interview to record your live scores'}
        </span>
        <span className="font-mono tabular-nums text-slate-200">
          Avg:{' '}
          {items.length
            ? Math.round(items.reduce((acc, i) => acc + i.score, 0) / items.length)
            : 0}
          /100
        </span>
      </div>
    </div>
  );
};
