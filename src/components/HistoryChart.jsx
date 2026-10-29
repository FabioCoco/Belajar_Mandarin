import { useEffect, useMemo, useRef, useState } from "react";
import Segmented from "./Segmented.jsx";
import { lastDays } from "../lib/dates.js";
import { DAILY_TARGET } from "../lib/constants.js";

const RANGES = [
  { value: 7, label: "7 hari" },
  { value: 30, label: "30 hari" },
];
const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];
const fullDate = (d) =>
  `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

const H = 200;
const PAD = { top: 14, right: 8, bottom: 28, left: 30 };

function Summary({ label, value }) {
  return (
    <div className="px-3 py-2.5 text-center">
      <p className="text-xl font-black leading-none tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted sm:text-sm">{label}</p>
    </div>
  );
}

// Grafik batang jumlah kata berbeda yang dipelajari per hari, dengan garis target harian.
// Angka tiap hari juga tersedia sebagai tabel untuk pembaca layar.
export default function HistoryChart({ history }) {
  const [range, setRange] = useState(7);
  // Lebar grafik mengikuti kontainer (1 satuan SVG = 1 px) supaya teks tidak mengecil di ponsel
  const [W, setW] = useState(600);
  const box = useRef(null);
  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(([e]) =>
      setW(Math.max(240, Math.round(e.contentRect.width))),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const days = useMemo(() => lastDays(history, range), [history, range]);

  const max = Math.max(DAILY_TARGET, ...days.map((d) => d.count));
  const top = Math.ceil(max / 5) * 5; // skala sumbu naik per 5 agar garis bantu rapi
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const slot = innerW / days.length;
  const barW = Math.min(36, Math.max(3, slot * 0.62));
  const y = (v) => PAD.top + innerH - (v / top) * innerH;

  const total = days.reduce((a, d) => a + d.count, 0);
  const active = days.filter((d) => d.count > 0).length;
  const hit = days.filter((d) => d.count >= DAILY_TARGET).length;
  const avg = active ? Math.round((total / active) * 10) / 10 : 0;

  // Label sumbu-x: 7 hari = nama hari; 30 hari = tanggal tiap 5 hari plus hari ini
  const showLabel = (i) =>
    range === 7
      ? true
      : i === days.length - 1 || (days.length - 1 - i) % 5 === 0;
  const labelOf = (d) =>
    range === 7 ? WEEKDAYS[d.date.getDay()] : String(d.date.getDate());
  const ticks = [0, top / 2, top].filter((t, i, a) => a.indexOf(t) === i);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Kata berbeda yang dipelajari tiap hari.
        </p>
        <Segmented
          label="Rentang grafik"
          value={range}
          onChange={setRange}
          options={RANGES}
          className="w-full sm:w-48"
        />
      </div>

      <div className="grid grid-cols-4 divide-x divide-line rounded-xl border border-line">
        <Summary label="Total kata" value={total} />
        <Summary label="Hari aktif" value={`${active}/${range}`} />
        <Summary label="Rata-rata/hari" value={avg} />
        <Summary label="Capai target" value={hit} />
      </div>

      <div ref={box}>
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Grafik batang ${range} hari terakhir: total ${total} kata, aktif ${active} hari, target harian tercapai ${hit} hari. Rinciannya ada di tabel setelah grafik.`}
          className="block max-w-full"
        >
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(t)}
                y2={y(t)}
                stroke="rgb(var(--line))"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 6}
                y={y(t) + 4}
                textAnchor="end"
                fontSize="12"
                fill="rgb(var(--muted))"
              >
                {t}
              </text>
            </g>
          ))}

          {days.map((d, i) => {
            const cx = PAD.left + slot * i + slot / 2;
            const isToday = i === days.length - 1;
            const reached = d.count >= DAILY_TARGET;
            return (
              <g key={d.key}>
                <title>{`${fullDate(d.date)}: ${d.count} kata`}</title>
                {d.count > 0 ? (
                  <rect
                    x={cx - barW / 2}
                    y={y(d.count)}
                    width={barW}
                    height={PAD.top + innerH - y(d.count)}
                    rx="3"
                    fill={
                      reached
                        ? "rgb(var(--primary-ink))"
                        : "rgb(var(--primary))"
                    }
                  />
                ) : (
                  <rect
                    x={cx - barW / 2}
                    y={PAD.top + innerH - 2}
                    width={barW}
                    height="2"
                    rx="1"
                    fill="rgb(var(--line))"
                  />
                )}
                {showLabel(i) && (
                  <text
                    x={cx}
                    y={H - 8}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight={isToday ? 800 : 500}
                    fill={isToday ? "rgb(var(--ink))" : "rgb(var(--muted))"}
                  >
                    {labelOf(d)}
                  </text>
                )}
              </g>
            );
          })}

          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(DAILY_TARGET)}
            y2={y(DAILY_TARGET)}
            stroke="rgb(var(--ink))"
            strokeWidth="1.25"
            strokeDasharray="5 4"
          />
        </svg>
      </div>

      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted sm:text-sm">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-0 w-5 border-t-2 border-dashed border-ink"
          />
          Target harian ({DAILY_TARGET} kata)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-3 w-3 rounded-sm bg-primary-ink"
          />
          Target tercapai
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3 w-3 rounded-sm bg-primary" />
          Belum tercapai
        </span>
      </p>

      <table className="sr-only">
        <caption>Kata yang dipelajari per hari, {range} hari terakhir</caption>
        <thead>
          <tr>
            <th scope="col">Tanggal</th>
            <th scope="col">Jumlah kata</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.key}>
              <td>{fullDate(d.date)}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
