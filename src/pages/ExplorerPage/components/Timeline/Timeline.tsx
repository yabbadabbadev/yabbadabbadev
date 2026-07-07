import { useMemo, type FC } from 'react'
import { useExplorer } from '../ExplorerProvider'
import type { TimelinePoint } from '../../../../types'
import './Timeline.css'

export const Timeline: FC = () => {
  const { state, actions } = useExplorer()

  const chartHeight = 60
  const chartWidth = 500
  const padding = 20

  const points = useMemo<TimelinePoint[]>(() => {
    if (state.timelineData.length === 0) return []
    const maxCount = Math.max(...state.timelineData.map((d) => d.count))
    const xScale = (chartWidth - padding * 2) / Math.max(1, state.timelineData.length - 1)
    const yScale = (chartHeight - padding * 2) / Math.max(1, maxCount)

    return state.timelineData.map((d, index) => ({
      x: padding + index * xScale,
      y: chartHeight - padding - d.count * yScale,
      ...d
    }))
  }, [state.timelineData])

  const linePath = useMemo<string>(() => {
    if (points.length === 0) return ''
    return points.reduce((path, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`
    }, '')
  }, [points])

  const areaPath = useMemo<string>(() => {
    if (points.length === 0) return ''
    const first = points[0]
    const last = points[points.length - 1]
    return `${linePath} L ${last.x} ${chartHeight - padding} L ${first.x} ${chartHeight - padding} Z`
  }, [points, linePath])

  return (
    <div className="glass-panel timeline-panel">
      <div className="timeline-header-row">
        <h3>Línea Temporal de Capturas</h3>
        {state.selectedTimeNode && (
          <button className="timeline-clear-btn" onClick={actions.clearTimeFilter}>
            Limpiar filtro
          </button>
        )}
      </div>

      <div className="timeline-chart-container">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="100%" className="timeline-svg">
          <defs>
            <linearGradient id="timeline-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          {areaPath && <path d={areaPath} fill="url(#timeline-grad)" />}
          {linePath && <path d={linePath} fill="none" stroke="#a855f7" strokeWidth="2.5" />}

          {points.map((p) => {
            const isHovered = state.hoveredTimeNode === p.key
            const isSelected = state.selectedTimeNode === p.key
            const radius = isSelected ? 6 : isHovered ? 5 : 4
            const color = isSelected ? '#06b6d4' : isHovered ? '#c084fc' : '#a855f7'
            
            return (
              <g key={p.key}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={radius}
                  fill={color}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                  className="timeline-node-circle"
                  onMouseEnter={() => actions.setHoveredTimeNode(p.key)}
                  onMouseLeave={() => actions.setHoveredTimeNode(null)}
                  onClick={() => actions.setSelectedTimeNode(isSelected ? null : p.key)}
                />
                <text
                  x={p.x}
                  y={chartHeight - 4}
                  fill={isSelected ? '#06b6d4' : isHovered ? '#e2e8f0' : '#64748b'}
                  fontSize="9"
                  textAnchor="middle"
                  className="timeline-tick-label"
                >
                  {p.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
