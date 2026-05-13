'use server';

import { getGroupById } from './group.service';

// ── Types ─────────────────────────────────────────────────────────────────────
type DiplomaResult = {
  id: number;
  roll: string;
  studentId: number | null;
  groupId: number;
  examYear: number;
  semesterName: string;
  status: 'PASSED' | 'FAILED' | 'REFERRED';
  gpa1: number | null;
  gpa2: number | null;
  gpa3: number | null;
  gpa4: number | null;
  gpa5: number | null;
  gpa6: number | null;
  gpa7: number | null;
  failedSubjects: string[];
  referredSubjects: string[];
};

type Student = {
  id: number;
  name: string;
  roll: string;
};

type Group = {
  id: number;
  name: string;
  session: string;
  department: { id: number; name: string; shortName: string };
  currentSemester: { id: number; name: string; order: number };
  shift: { id: number; name: string; shortName: string };
  diplomaResults: DiplomaResult[];
  students?: Student[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const GPA_KEYS = ['gpa1', 'gpa2', 'gpa3', 'gpa4', 'gpa5', 'gpa6', 'gpa7'] as const;

/**
 * Finds the most recent published results for semester (currentOrder - 1).
 *
 * Strategy (in priority order):
 *  1. Use currentSemester.order to derive target order = currentOrder - 1.
 *  2. Among all diplomaResults, extract unique semesterNames and try to
 *     detect their numeric order by scanning for digit/ordinal patterns.
 *  3. Pick the semesterName whose detected order equals targetOrder AND
 *     has the highest examYear (= most recently published).
 *  4. If order detection fails entirely, fall back to the semesterName
 *     that appears most in results but is NOT the current semester name
 *     — i.e. the latest non-current result batch.
 */
function resolveTargetSemester(
  allResults: { semesterName: string; examYear: number }[],
  currentSemOrder: number,
  currentSemName: string,
): { semesterName: string; examYear: number } | null {
  if (!allResults.length) return null;

  const targetOrder = currentSemOrder - 1;
  if (targetOrder < 1) return null; // group is at 1st sem — no previous

  // Extract all unique (semesterName, examYear) pairs
  const pairs = [...new Map(
    allResults.map((r) => [`${r.semesterName}|${r.examYear}`, r])
  ).values()];

  // ── Semester order detection ─────────────────────────────────────────────
  // Handles: "4th Semester", "৪র্থ সেমিস্টার", "Semester 4", "4", etc.
  const EN_ORDINALS: Record<string, number> = {
    '1st': 1, 'first': 1,
    '2nd': 2, 'second': 2,
    '3rd': 3, 'third': 3,
    '4th': 4, 'fourth': 4,
    '5th': 5, 'fifth': 5,
    '6th': 6, 'sixth': 6,
    '7th': 7, 'seventh': 7,
    '8th': 8, 'eighth': 8,
  };
  const BN_ORDINALS: Record<string, number> = {
    '১ম': 1, 'প্রথম': 1,
    '২য়': 2, 'দ্বিতীয়': 2,
    '৩য়': 3, 'তৃতীয়': 3,
    '৪র্থ': 4, 'চতুর্থ': 4,
    '৫ম': 5, 'পঞ্চম': 5,
    '৬ষ্ঠ': 6, 'ষষ্ঠ': 6,
    '৭ম': 7, 'সপ্তম': 7,
    '৮ম': 8, 'অষ্টম': 8,
  };
  // Map Bangla digits → Arabic
  const normalizeBnDigits = (s: string) =>
    s.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));

  function detectOrder(name: string): number | null {
    const lower = name.toLowerCase();
    // English ordinals/words
    for (const [token, ord] of Object.entries(EN_ORDINALS)) {
      if (lower.includes(token)) return ord;
    }
    // Bangla ordinals/words
    for (const [token, ord] of Object.entries(BN_ORDINALS)) {
      if (name.includes(token)) return ord;
    }
    // Plain digit (Arabic or Bangla): "Semester 4", "4th", "৪"
    const normalized = normalizeBnDigits(name);
    const m = normalized.match(/\b([1-8])\b/);
    if (m) return parseInt(m[1], 10);
    return null;
  }

  // ── Pass 1: match by detected order == targetOrder ───────────────────────
  const targetCandidates = pairs.filter((p) => detectOrder(p.semesterName) === targetOrder);

  if (targetCandidates.length > 0) {
    // Among matching names, pick the one with the highest examYear
    return targetCandidates.sort((a, b) => b.examYear - a.examYear)[0];
  }

  // ── Pass 2: fallback — pick highest examYear result that isn't the current sem ─
  // (handles exotic name formats we couldn't parse)
  const nonCurrent = pairs.filter((p) => p.semesterName !== currentSemName);
  if (!nonCurrent.length) return null;
  return nonCurrent.sort((a, b) => b.examYear - a.examYear)[0];
}

function avgGpa(r: DiplomaResult): string {
  const vals = GPA_KEYS.map((k) => r[k]).filter((v): v is number => v !== null);
  if (!vals.length) return '—';
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
}

function gpaCell(val: number | null): string {
  if (val === null) return `<td style="text-align:center;padding:6px 4px;border:1px solid #cfe0d8"><span style="color:#9ca3af">—</span></td>`;
  const color = val >= 3.5 ? '#065f46' : val >= 2.5 ? '#166534' : val >= 2.0 ? '#92400e' : '#991b1b';
  const bg = val >= 3.5 ? '#d1fae5' : val >= 2.5 ? '#ecfdf5' : val >= 2.0 ? '#fef3c7' : '#fee2e2';
  return `<td style="text-align:center;padding:6px 4px;border:1px solid #cfe0d8;background:${bg}"><span style="font-weight:700;color:${color};font-size:9.5px">${val.toFixed(2)}</span></td>`;
}

function statusBadge(status: string): string {
  const cfg: Record<string, { bg: string; color: string; border: string; label: string }> = {
    PASSED:  { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7', label: 'উত্তীর্ণ' },
    FAILED:  { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', label: 'অনুত্তীর্ণ' },
    REFERRED:{ bg: '#fef3c7', color: '#78350f', border: '#fde68a', label: 'রেফার্ড' },
  };
  const c = cfg[status] ?? { bg: '#f3f4f6', color: '#374151', border: '#d1d5db', label: status };
  return `<span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:8.5px;font-weight:700;background:${c.bg};color:${c.color};border:1px solid ${c.border}">${c.label}</span>`;
}

function chip(code: string, fail = false): string {
  return fail
    ? `<span style="background:#fee2e2;border:1px solid #fca5a5;color:#991b1b;padding:1px 6px;border-radius:3px;font-size:7.5px;font-family:monospace;font-weight:700;margin:1px 2px;display:inline-block">${code}</span>`
    : `<span style="background:#fef3c7;border:1px solid #fde68a;color:#78350f;padding:1px 6px;border-radius:3px;font-size:7.5px;font-family:monospace;font-weight:700;margin:1px 2px;display:inline-block">${code}</span>`;
}

// ── Semester label helpers ────────────────────────────────────────────────────

function semesterBangla(name: string): string {
  return name
    .replace(/1st/i, '১ম').replace(/2nd/i, '২য়').replace(/3rd/i, '৩য়')
    .replace(/4th/i, '৪র্থ').replace(/5th/i, '৫ম').replace(/6th/i, '৬ষ্ঠ')
    .replace(/7th/i, '৭ম').replace(/8th/i, '৮ম')
    .replace(/semester/i, 'সেমিস্টার').replace(/Semester/i, 'সেমিস্টার');
}

function shiftBangla(name: string): string {
  return name
    .replace(/1st/i, '১ম').replace(/2nd/i, '২য়').replace(/first/i, '১ম').replace(/second/i, '২য়')
    .replace(/shift/i, 'শিফট').replace(/Shift/i, 'শিফট');
}

// ── Full HTML Builder ─────────────────────────────────────────────────────────

function buildHtml(group: Group): string {
  const students = group.students ?? [];
  const studentMap = Object.fromEntries(students.map((s) => [s.id, s]));

  const currentSemOrder = group.currentSemester?.order ?? 1;
  const currentSemName  = group.currentSemester?.name  ?? '';
  const allResults      = group.diplomaResults ?? [];

  // ── Resolve: which semester's results to show ────────────────────────────
  // Priority: currentSemester.order - 1, matched against actual result records.
  const target = resolveTargetSemester(allResults, currentSemOrder, currentSemName);

  // Filter to ONLY that semester + examYear (the most recently published batch)
  const results = target
    ? allResults.filter(
        (r) => r.semesterName === target.semesterName && r.examYear === target.examYear
      )
    : allResults; // fallback: show everything if resolution failed

  const total      = results.length;
  const passCount  = results.filter((r) => r.status === 'PASSED').length;
  const failCount  = results.filter((r) => r.status === 'FAILED').length;
  const referCount = results.filter((r) => r.status === 'REFERRED').length;
  const passRate   = total > 0 ? Math.round((passCount / total) * 100) : 0;

  const displayCurrentSem = currentSemName          || '—';
  const displayResultSem  = target?.semesterName    || '—';
  const displayYear       = target?.examYear        ?? results[0]?.examYear ?? '—';

  const printDate = new Date().toLocaleString('en-BD', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Dhaka',
  });

  // ── Student Result Rows ──────────────────────────────────────────────────────
  const resultRows = results.length === 0
    ? `<tr><td colspan="13" style="text-align:center;color:#9ca3af;padding:40px;font-size:11px">কোনো ফলাফল পাওয়া যায়নি</td></tr>`
    : results.map((r, i) => {
        const student  = r.studentId ? studentMap[r.studentId] : null;
        // FIX: name rendered directly in full — no truncation, no overflow hiding
        const name     = student?.name ?? '—';
        const gpaCells = GPA_KEYS.map((k) => gpaCell(r[k])).join('');

        // FIX: Always show referred subjects, even when status is PASSED.
        // Only show ✓ ক্লিন পাস when there are genuinely no referred or failed subjects.
        const refChips  = (r.referredSubjects ?? []).map((c) => chip(c, false)).join('');
        const failChips = (r.failedSubjects   ?? []).map((c) => chip(c, true)).join('');
        const hasIssues = refChips || failChips;
        const subjectCell = hasIssues
          ? refChips + failChips
          : `<span style="color:#059669;font-size:8.5px;font-weight:600">✓ ক্লিন পাস</span>`;

        const rowBg = i % 2 === 0 ? '#fff' : '#f8faf9';
        const statusColor = r.status === 'PASSED' ? '#f0fdf4' : r.status === 'FAILED' ? '#fff5f5' : '#fffbeb';

        return `
          <tr style="background:${r.status !== 'PASSED' ? statusColor : rowBg}">
            <td style="padding:6px 8px;border:1px solid #cfe0d8;text-align:center;color:#6b7280;font-size:9px">${i + 1}</td>
            <td style="padding:6px 8px;border:1px solid #cfe0d8;font-weight:600;font-size:9.5px;font-family:'Noto Sans Bengali','Hind Siliguri',sans-serif;white-space:normal;word-break:break-word">${name}</td>
            <td style="padding:6px 8px;border:1px solid #cfe0d8;font-family:monospace;font-size:9px;text-align:center">${r.roll}</td>
            ${gpaCells}
            <td style="padding:6px 8px;border:1px solid #cfe0d8;text-align:center;font-weight:700;font-size:10px">${avgGpa(r)}</td>
            <td style="padding:6px 8px;border:1px solid #cfe0d8;text-align:center">${statusBadge(r.status)}</td>
            <td style="padding:6px 8px;border:1px solid #cfe0d8;font-size:9px;word-break:break-word">${subjectCell}</td>
          </tr>`;
      }).join('');

  // ── Subject Analysis — includes referred from PASSED students too ─────────────
  const subjectCount: Record<string, { ref: number; fail: number }> = {};
  results.forEach((r) => {
    // Count referred subjects for ALL students (including those who passed with referred)
    (r.referredSubjects ?? []).forEach((c) => { subjectCount[c] ??= { ref: 0, fail: 0 }; subjectCount[c].ref++; });
    // Count failed subjects for non-passed students
    (r.failedSubjects   ?? []).forEach((c) => { subjectCount[c] ??= { ref: 0, fail: 0 }; subjectCount[c].fail++; });
  });

  const subjectRows = Object.entries(subjectCount)
    .sort((a, b) => (b[1].ref + b[1].fail) - (a[1].ref + a[1].fail))
    .map(([code, cnt], i) => `
      <tr style="background:${i % 2 === 0 ? '#fffbeb' : '#fff'}">
        <td style="padding:5px 8px;border:1px solid #fde68a;text-align:center;color:#9ca3af;font-size:9px">${i + 1}</td>
        <td style="padding:5px 8px;border:1px solid #fde68a;font-family:monospace;font-weight:700;color:#92400e">${code}</td>
        <td style="padding:5px 8px;border:1px solid #fde68a;text-align:center;color:#0369a1;font-weight:600">${cnt.ref || '—'}</td>
        <td style="padding:5px 8px;border:1px solid #fde68a;text-align:center;color:#dc2626;font-weight:600">${cnt.fail || '—'}</td>
        <td style="padding:5px 8px;border:1px solid #fde68a;text-align:center;font-weight:700">${cnt.ref + cnt.fail}</td>
        <td style="padding:5px 8px;border:1px solid #fde68a;text-align:center">${total > 0 ? (((cnt.ref + cnt.fail) / total) * 100).toFixed(1) : 0}%</td>
      </tr>`).join('');

  const subjectSection = subjectRows ? `
    <div style="margin:30px 0 10px;font-size:12px;font-weight:700;color:#006A4E;border-left:4px solid #006A4E;padding-left:12px;font-family:'Noto Sans Bengali','Hind Siliguri',Georgia,serif">
      বিষয়ভিত্তিক রেফার্ড / অনুত্তীর্ণ বিশ্লেষণ
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:9.5px;">
      <thead>
        <tr style="background:#006A4E;color:white;font-size:9px">
          <th style="padding:7px 8px;border:1px solid #005a40;width:40px">ক্র.নং</th>
          <th style="padding:7px 8px;border:1px solid #005a40;text-align:left">বিষয় কোড</th>
          <th style="padding:7px 8px;border:1px solid #005a40">রেফার্ড</th>
          <th style="padding:7px 8px;border:1px solid #005a40">অনুত্তীর্ণ</th>
          <th style="padding:7px 8px;border:1px solid #005a40">মোট</th>
          <th style="padding:7px 8px;border:1px solid #005a40">শ্রেণির %</th>
        </tr>
      </thead>
      <tbody>${subjectRows}</tbody>
    </table>` : '';

  // ── Pass Rate Bar ─────────────────────────────────────────────────────────────
  const passBarWidth  = passRate;
  const referBarWidth = total > 0 ? Math.round((referCount / total) * 100) : 0;
  const failBarWidth  = total > 0 ? Math.round((failCount  / total) * 100) : 0;

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Serif:wght@400;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Source Sans 3', 'Noto Sans Bengali', Arial, sans-serif;
      font-size: 11px;
      color: #1a1a2e;
      background: #fff;
      line-height: 1.5;
    }
    .bn {
      font-family: 'Noto Sans Bengali', 'Hind Siliguri', sans-serif;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 14mm 13mm 18mm 13mm;
      margin: 0 auto;
      background: white;
      position: relative;
    }
    table { border-collapse: collapse; width: 100%; }
    th { font-weight: 600; }
    th, td { border: 1px solid #cfe0d8; padding: 5px 5px; vertical-align: middle; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; }
    .section-title {
      font-family: 'Noto Sans Bengali', 'Hind Siliguri', 'Noto Serif', serif;
      font-size: 12px;
      font-weight: 700;
      color: #006A4E;
      border-left: 4px solid #006A4E;
      padding-left: 12px;
      margin: 22px 0 10px;
      border-radius: 0;
    }
    @media print {
      .page { page-break-after: always; margin: 0; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Watermark -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);font-size:80px;font-weight:900;color:rgba(0,106,78,0.05);font-family:'Noto Serif',serif;pointer-events:none;z-index:0;white-space:nowrap">সরকারি</div>

  <div style="position:relative;z-index:1">

    <!-- Timestamp -->
    <div style="text-align:right;font-size:8px;color:#9ca3af;margin-bottom:10px">
      মুদ্রণ তারিখ: ${printDate}
    </div>

    <!-- Official Header -->
    <div style="text-align:center;margin-bottom:16px;border-bottom:2px solid #006A4E;padding-bottom:14px">
      <div style="display:flex;align-items:center;justify-content:center;gap:14px">
        <div style="text-align:left">
          <div class="bn" style="font-size:22px;font-weight:700;color:#006A4E;line-height:1.2">দিনাজপুর পলিটেকনিক ইনস্টিটিউট</div>
          <div class="bn" style="font-size:11px;color:#444;margin-top:3px">কম্পিউটার সায়েন্স অ্যান্ড টেকনোলজি বিভাগ</div>
          <div style="font-size:9px;color:#666;margin-top:1px">Dinajpur Polytechnic Institute — Department of CST</div>
        </div>
      </div>
    </div>

    <!-- Report Title Banner -->
    <div style="background:#006A4E;color:white;text-align:center;padding:9px 0;margin-bottom:16px;position:relative;overflow:hidden">
      <div style="position:absolute;left:0;top:0;bottom:0;width:6px;background:#F42A41"></div>
      <div style="position:absolute;right:0;top:0;bottom:0;width:6px;background:#F42A41"></div>
      <div class="bn" style="font-size:14px;font-weight:700;letter-spacing:0.3px">ডিপ্লোমা ইন ইঞ্জিনিয়ারিং — ফলাফল বিশ্লেষণ প্রতিবেদন</div>
      <div style="font-size:9px;margin-top:2px;opacity:0.85">Diploma in Engineering — Result Analysis Report</div>
    </div>

    <!-- Group Info Grid -->
    <div style="background:#f8faf7;border:1px solid #d1e8d5;border-radius:4px;padding:12px 16px;margin-bottom:16px">
      <table style="border:none;font-size:10px">
        <tr>
          <td style="border:none;padding:3px 0;width:22%"><span class="bn" style="font-weight:600">গ্রুপ</span></td>
          <td style="border:none;padding:3px 0;width:28%"><span class="bn">: ${group.name}</span></td>
          <td style="border:none;padding:3px 0;width:22%"><span class="bn" style="font-weight:600">সেশন</span></td>
          <td style="border:none;padding:3px 0"><span class="bn">: ${group.session}</span></td>
        </tr>
        <tr>
          <td style="border:none;padding:3px 0"><span class="bn" style="font-weight:600">চলতি সেমিস্টার</span></td>
          <td style="border:none;padding:3px 0"><span class="bn">: ${semesterBangla(displayCurrentSem)}</span></td>
          <td style="border:none;padding:3px 0"><span class="bn" style="font-weight:600">শিফট</span></td>
          <td style="border:none;padding:3px 0"><span class="bn">: ${shiftBangla(group.shift?.name ?? '—')}</span></td>
        </tr>
        <tr>
          <td style="border:none;padding:3px 0"><span class="bn" style="font-weight:600">ফলাফলের সেমিস্টার</span></td>
          <td style="border:none;padding:3px 0"><span class="bn" style="color:#065f46;font-weight:700">: ${semesterBangla(displayResultSem)}</span></td>
          <td style="border:none;padding:3px 0"><span class="bn" style="font-weight:600">পরীক্ষার বছর</span></td>
          <td style="border:none;padding:3px 0"><span class="bn">: ${displayYear}</span></td>
        </tr>
        <tr>
          <td style="border:none;padding:3px 0"><span class="bn" style="font-weight:600">বিভাগ</span></td>
          <td style="border:none;padding:3px 0" colspan="3"><span class="bn">: ${group.department?.name || 'কম্পিউটার সায়েন্স অ্যান্ড টেকনোলজি'} (${group.department?.shortName || 'CST'})</span></td>
        </tr>
      </table>
    </div>

    <!-- Summary Stats Cards -->
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:16px">
      ${[
        { label: 'মোট শিক্ষার্থী', value: total,        color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe' },
        { label: 'উত্তীর্ণ',       value: passCount,    color: '#065f46', bg: '#f0fdf4', border: '#6ee7b7' },
        { label: 'অনুত্তীর্ণ',     value: failCount,    color: '#991b1b', bg: '#fef2f2', border: '#fca5a5' },
        { label: 'রেফার্ড',        value: referCount,   color: '#78350f', bg: '#fffbeb', border: '#fde68a' },
        { label: 'পাসের হার',      value: passRate+'%', color: '#065f46', bg: '#ecfdf5', border: '#a7f3d0' },
      ].map(s => `
        <div style="background:${s.bg};border:1px solid ${s.border};border-radius:4px;padding:8px 10px;text-align:center">
          <div class="bn" style="font-size:8.5px;color:${s.color};opacity:0.8;margin-bottom:3px">${s.label}</div>
          <div class="bn" style="font-size:18px;font-weight:700;color:${s.color}">${s.value}</div>
        </div>`).join('')}
    </div>

    <!-- Pass Rate Visual Bar -->
    <div style="margin-bottom:18px">
      <div style="display:flex;height:10px;border-radius:5px;overflow:hidden;border:1px solid #d1d5db">
        <div style="width:${passBarWidth}%;background:#059669"></div>
        <div style="width:${referBarWidth}%;background:#f59e0b"></div>
        <div style="width:${failBarWidth}%;background:#ef4444"></div>
      </div>
      <div style="display:flex;gap:16px;margin-top:5px;font-size:8.5px">
        <span class="bn" style="color:#065f46">● উত্তীর্ণ ${passBarWidth}%</span>
        <span class="bn" style="color:#78350f">● রেফার্ড ${referBarWidth}%</span>
        <span class="bn" style="color:#991b1b">● অনুত্তীর্ণ ${failBarWidth}%</span>
      </div>
    </div>

    <!-- Student Result Table -->
    <div class="section-title bn">শিক্ষার্থীভিত্তিক ফলাফল বিবরণ</div>
    <div style="margin-bottom:24px">
      <table style="font-size:9px">
        <thead>
          <tr style="background:#006A4E;color:white">
            <th style="width:26px;border:1px solid #005a40;padding:7px 4px" class="bn">ক্র.</th>
            <th style="text-align:left;border:1px solid #005a40;padding:7px 8px;min-width:110px" class="bn">নাম</th>
            <th style="width:68px;border:1px solid #005a40;padding:7px 4px" class="bn">রোল</th>
            ${GPA_KEYS.map((_, i) => `<th style="width:34px;border:1px solid #005a40;padding:7px 3px">${i + 1}</th>`).join('')}
            <th style="width:44px;border:1px solid #005a40;padding:7px 4px" class="bn">গড়</th>
            <th style="width:62px;border:1px solid #005a40;padding:7px 4px" class="bn">ফলাফল</th>
            <th style="border:1px solid #005a40;padding:7px 8px" class="bn">রেফার্ড / অনুত্তীর্ণ বিষয়</th>
          </tr>
          <tr style="background:#e8f5e9;font-size:8px;color:#374151">
            <th colspan="3" style="border:1px solid #cfe0d8;padding:4px;text-align:center" class="bn">শিক্ষার্থীর তথ্য</th>
            <th colspan="7" style="border:1px solid #cfe0d8;padding:4px;text-align:center" class="bn">সেমিস্টার জিপিএ (১–৭)</th>
            <th colspan="3" style="border:1px solid #cfe0d8;padding:4px;text-align:center" class="bn">সারসংক্ষেপ</th>
          </tr>
        </thead>
        <tbody>${resultRows}</tbody>
      </table>
    </div>

    <!-- Subject Analysis -->
    ${subjectSection}

    <!-- Signature Section -->
    <div style="margin-top:40px;border-top:2px solid #006A4E;padding-top:22px;display:flex;justify-content:space-between;font-size:10px;color:#374151">
      <div style="text-align:center">
        <div style="width:150px;border-top:1px solid #374151;margin:0 auto 8px"></div>
        <div class="bn" style="font-weight:600">শ্রেণি শিক্ষক</div>
        <div class="bn" style="font-size:8.5px;color:#6b7280">কম্পিউটার সায়েন্স বিভাগ</div>
      </div>
      <div style="text-align:center">
        <div class="bn" style="font-size:9px;color:#006A4E;font-weight:600">দিনাজপুর পলিটেকনিক ইনস্টিটিউট</div>
        <div style="font-size:8px;color:#9ca3af;margin-top:2px">Computer Generated Official Document</div>
        <div class="bn" style="font-size:8px;color:#9ca3af">কম্পিউটার নির্মিত সরকারি নথি</div>
      </div>
      <div style="text-align:center">
        <div style="width:150px;border-top:1px solid #374151;margin:0 auto 8px"></div>
        <div class="bn" style="font-weight:600">বিভাগীয় প্রধান</div>
        <div class="bn" style="font-size:8.5px;color:#6b7280">কম্পিউটার সায়েন্স অ্যান্ড টেকনোলজি</div>
      </div>
    </div>

  </div><!-- /z-index -->
</div><!-- /page -->
</body>
</html>`;
}

// ── Server Action ─────────────────────────────────────────────────────────────
export async function generateDiplomaReport(
  groupId: number
): Promise<{ pdfBase64: string; filename: string } | { error: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let browser: any;
  try {
    const response = await getGroupById(groupId);
    if (!response?.success || !response?.data) {
      return { error: response?.message ?? 'Failed to fetch group data' };
    }

    const group = response.data as Group;
    const html  = buildHtml(group);

    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
      // ── Local dev (Windows/Mac/Linux): use the full puppeteer package which
      //    bundles its own Chromium — no download, no path issues.
      //    Run:  npm install puppeteer --save-dev
      const puppeteerFull = await import('puppeteer');
      browser = await puppeteerFull.default.launch({ headless: true });
    } else {
      // ── Production (Vercel / serverless): use puppeteer-core + sparticuz chromium.
      const [puppeteerCore, chromium] = await Promise.all([
        import('puppeteer-core'),
        import('@sparticuz/chromium-min'),
      ]);
      browser = await puppeteerCore.default.launch({
        args: chromium.default.args,
        executablePath: await chromium.default.executablePath(
          'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
        ),
        headless: true,
      });
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '14mm', right: '13mm', bottom: '18mm', left: '13mm' },
      preferCSSPageSize: true,
    });

    await browser.close();

    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
    const currentSem = group.currentSemester?.name?.replace(/\s+/g, '-') ?? 'sem';
    const filename   = `DPI-CST-Group${group.name}-${currentSem}-${group.session}.pdf`;

    return { pdfBase64, filename };
  } catch (err) {
    console.error('[generateDiplomaReport]', err);
    if (browser) await browser.close().catch(() => {});
    return { error: err instanceof Error ? err.message : 'PDF generation failed' };
  }
}