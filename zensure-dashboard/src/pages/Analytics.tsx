import React, { useMemo } from 'react';
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const zoneRiskScores = [
  { zone: 'Mumbai-Andheri', city: 'Mumbai', score: 0.82, events: 18 },
  { zone: 'Delhi-Connaught', city: 'Delhi-NCR', score: 0.88, events: 22 },
  { zone: 'Chennai-T.Nagar', city: 'Chennai', score: 0.78, events: 16 },
  { zone: 'Mumbai-Dadar', city: 'Mumbai', score: 0.71, events: 14 },
  { zone: 'Delhi-Lajpat', city: 'Delhi-NCR', score: 0.74, events: 15 },
  { zone: 'Chennai-Adyar', city: 'Chennai', score: 0.65, events: 12 },
  { zone: 'Bengaluru-Koramangala', city: 'Bengaluru', score: 0.61, events: 10 },
  { zone: 'Hyderabad-Banjara', city: 'Hyderabad', score: 0.55, events: 8 },
];

const statusData = [
  { name: 'Auto Approved', value: 67, color: '#00C853' },
  { name: 'Paid', value: 18, color: '#4CAF50' },
  { name: 'Soft Hold', value: 8, color: '#FFD700' },
  { name: 'Hard Hold', value: 4, color: '#FF3D00' },
  { name: 'Rejected', value: 3, color: '#555555' },
];

const eventData = [
  { type: 'Heavy Rain', claims: 42 },
  { type: 'Severe AQI', claims: 28 },
  { type: 'Extreme Heat', claims: 15 },
  { type: 'Flash Flood', claims: 9 },
  { type: 'Bandh', claims: 6 },
];

const forecastData = [
  { day: 'MON', date: '30 Mar', risk: 'LOW', claims: 2 },
  { day: 'TUE', date: '31 Mar', risk: 'LOW', claims: 1 },
  { day: 'WED', date: '1 Apr', risk: 'MED', claims: 5 },
  { day: 'THU', date: '2 Apr', risk: 'HIGH', claims: 14 },
  { day: 'FRI', date: '3 Apr', risk: 'HIGH', claims: 18 },
  { day: 'SAT', date: '4 Apr', risk: 'MED', claims: 7 },
  { day: 'SUN', date: '5 Apr', risk: 'LOW', claims: 3 },
];

function riskClass(score: number) {
  if (score > 0.7) return 'risk-chip risk-high';
  if (score >= 0.4) return 'risk-chip risk-medium';
  return 'risk-chip risk-low';
}

function riskLabel(score: number) {
  if (score > 0.7) return 'HIGH RISK';
  if (score >= 0.4) return 'MEDIUM';
  return 'LOW';
}

export default function Analytics() {
  const sortedScores = useMemo(() => [...zoneRiskScores].sort((a, b) => b.score - a.score), []);

  return (
    <div className="page-stack">
      <section className="table-card">
        <div className="table-header">
          <div className="section-title" style={{ marginBottom: 0 }}>Zone Risk Scores</div>
          <span className="badge" style={{ background: 'var(--orange-dim)', border: '1px solid var(--orange-border)', color: 'var(--orange)' }}>Powered by XGBoost ML Model</span>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Zone</th>
                <th>City</th>
                <th>Risk Score</th>
                <th>Events/Year</th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {sortedScores.map(row => (
                <tr key={row.zone}>
                  <td style={{ fontWeight: 700 }}>{row.zone}</td>
                  <td className="muted-text">{row.city}</td>
                  <td>
                    <div className="progress-row" style={{ gap: 12 }}>
                      <div style={{ width: 100, height: 6, background: '#333', borderRadius: 6, overflow: 'hidden' }}>
                        <div style={{ width: `${row.score * 100}%`, height: '100%', background: row.score > 0.7 ? 'var(--red)' : row.score >= 0.4 ? 'var(--yellow)' : 'var(--green)' }} />
                      </div>
                      <span style={{ fontWeight: 700 }}>{row.score.toFixed(2)}</span>
                    </div>
                  </td>
                  <td>{row.events}</td>
                  <td><span className={riskClass(row.score)}>{riskLabel(row.score)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="page-grid-halves">
        <section className="section-card">
          <div className="section-title">Claim Status Donut</div>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusData} dataKey="value" innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {statusData.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: -190, textAlign: 'center', pointerEvents: 'none' }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>100</div>
            <div className="muted-text">Total</div>
          </div>
        </section>

        <section className="section-card">
          <div className="section-title">Claims by Event Type</div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={eventData}>
                <XAxis dataKey="type" stroke="#555" tick={{ fill: '#888', fontSize: 12 }} />
                <YAxis stroke="#555" tick={{ fill: '#888', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8 }} />
                <Bar dataKey="claims" fill="var(--orange)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="card" style={{ padding: 24, background: 'linear-gradient(135deg, #1A0A00 0%, #0D0D0D 100%)', border: '1px solid var(--orange-border)' }}>
        <div className="page-header-row">
          <div style={{ fontSize: 18, fontWeight: 700 }}>Next Week Risk Forecast</div>
          <span className="badge" style={{ background: 'var(--orange-dim)', border: '1px solid var(--orange-border)', color: 'var(--orange)' }}>🤖 AI Powered</span>
        </div>

        <div className="forecast-grid">
          {forecastData.map(day => {
            const riskStyles = day.risk === 'HIGH' ? { background: 'rgba(255,61,0,0.15)', color: 'var(--red)' } : day.risk === 'MED' ? { background: 'rgba(255,215,0,0.15)', color: 'var(--yellow)' } : { background: 'rgba(0,200,83,0.15)', color: 'var(--green)' };
            return (
              <div key={day.day} className="card" style={{ padding: '16px 12px', textAlign: 'center' }}>
                <div className="muted-text" style={{ textTransform: 'uppercase', fontSize: 11 }}>{day.day}</div>
                <div style={{ marginTop: 6, fontSize: 13 }}>{day.date}</div>
                <div className="badge" style={{ ...riskStyles, margin: '14px auto 10px', justifyContent: 'center' }}>{day.risk}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: riskStyles.color }}>{day.claims}</div>
                <div className="muted-text" style={{ marginTop: 2 }}>claims</div>
              </div>
            );
          })}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', marginTop: 20, paddingTop: 12, fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          📡 Forecast based on IMD weather data and historical zone disruption patterns. High-risk days correlate with monsoon forecast for Mumbai and Chennai.
        </div>
      </section>
    </div>
  );
}
