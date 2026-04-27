'use server';

import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
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

function avgGpa(r: DiplomaResult): string {
  const vals = GPA_KEYS.map((k) => r[k]).filter((v): v is number => v !== null);
  if (!vals.length) return '—';
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
}

function gpaCell(val: number | null): string {
  if (val === null) return `<span style="color:#9ca3af">—</span>`;
  const color = val >= 3 ? '#166534' : val >= 2 ? '#92400e' : '#991b1b';
  return `<span style="font-weight:700;color:${color}">${val.toFixed(2)}</span>`;
}

function statusBadge(status: string): string {
  const styles: Record<string, string> = {
    PASSED: 'background:#d1fae5;color:#065f46',
    FAILED: 'background:#fee2e2;color:#991b1b',
    REFERRED: 'background:#fef3c7;color:#92400e',
  };
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return `<span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:8px;font-weight:700;${styles[status] ?? ''}">${label}</span>`;
}

function chip(code: string, fail = false): string {
  return fail
    ? `<span style="background:#fee2e2;border:1px solid #fca5a5;color:#991b1b;padding:1px 5px;border-radius:3px;font-size:7.5px;font-family:monospace;font-weight:600;margin:1px">${code}</span>`
    : `<span style="background:#fef3c7;border:1px solid #fde68a;color:#78350f;padding:1px 5px;border-radius:3px;font-size:7.5px;font-family:monospace;font-weight:600;margin:1px">${code}</span>`;
}

// ── Full Industry Standard HTML Builder ───────────────────────────────────────

function buildHtml(group: Group, filterSemester?: string): string {
  const students = group.students ?? [];
  const studentMap = Object.fromEntries(students.map((s) => [s.id, s]));

  const results = (group.diplomaResults ?? []).filter(
    (r) => !filterSemester || r.semesterName === filterSemester
  );

  const total = results.length;
  const passCount = results.filter((r) => r.status === 'PASSED').length;
  const failCount = results.filter((r) => r.status === 'FAILED').length;
  const referCount = results.filter((r) => r.status === 'REFERRED').length;
  const passRate = total > 0 ? Math.round((passCount / total) * 100) : 0;

  const displaySem = group.currentSemester?.name || '—';
  const displayYear = results[0]?.examYear ?? '—';

  const printDate = new Date().toLocaleString('en-BD', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Dhaka',
  });

  // Student Result Rows
  const resultRows = results.length === 0
    ? `<tr><td colspan="13" style="text-align:center;color:#9ca3af;padding:40px">No results found</td></tr>`
    : results.map((r, i) => {
      const student = r.studentId ? studentMap[r.studentId] : null;
      const name = student?.name ?? '—';
      const gpaCells = GPA_KEYS.map((k) =>
        `<td style="text-align:center;padding:6px 4px;border:1px solid #cfe0d8">${gpaCell(r[k])}</td>`
      ).join('');

      const refChips = (r.referredSubjects ?? []).map((c) => chip(c)).join('');
      const failChips = (r.failedSubjects ?? []).map((c) => chip(c, true)).join('');

      return `
          <tr style="background:${i % 2 === 0 ? '#fff' : '#f8faf7'}">
            <td style="padding:6px 8px;border:1px solid #cfe0d8;text-align:center;color:#6b7280;font-size:9px">${i + 1}</td>
            <td style="padding:6px 8px;border:1px solid #cfe0d8;font-weight:600;font-size:10px">${name}</td>
            <td style="padding:6px 8px;border:1px solid #cfe0d8;font-family:monospace;font-size:9.5px">${r.roll}</td>
            ${gpaCells}
            <td style="padding:6px 8px;border:1px solid #cfe0d8;text-align:center;font-weight:700">${avgGpa(r)}</td>
            <td style="padding:6px 8px;border:1px solid #cfe0d8;text-align:center">${statusBadge(r.status)}</td>
            <td style="padding:6px 8px;border:1px solid #cfe0d8;font-size:9px">${refChips}${failChips || '<span style="color:#9ca3af">—</span>'}</td>
          </tr>`;
    }).join('');

  // Subject Analysis
  const subjectCount: Record<string, { ref: number; fail: number }> = {};
  results.forEach((r) => {
    (r.referredSubjects ?? []).forEach((c) => { subjectCount[c] ??= { ref: 0, fail: 0 }; subjectCount[c].ref++; });
    (r.failedSubjects ?? []).forEach((c) => { subjectCount[c] ??= { ref: 0, fail: 0 }; subjectCount[c].fail++; });
  });

  const subjectRows = Object.entries(subjectCount)
    .sort((a, b) => (b[1].ref + b[1].fail) - (a[1].ref + a[1].fail))
    .map(([code, cnt], i) => `
      <tr style="background:${i % 2 === 0 ? '#fffbeb' : '#fff'}">
        <td style="padding:5px 8px;border:1px solid #fde68a;text-align:center;color:#9ca3af;font-size:9px">${i + 1}</td>
        <td style="padding:5px 8px;border:1px solid #fde68a;font-family:monospace;font-weight:700;color:#92400e">${code}</td>
        <td style="padding:5px 8px;border:1px solid #fde68a;text-align:center">${cnt.ref || '—'}</td>
        <td style="padding:5px 8px;border:1px solid #fde68a;text-align:center">${cnt.fail || '—'}</td>
        <td style="padding:5px 8px;border:1px solid #fde68a;text-align:center;font-weight:700">${cnt.ref + cnt.fail}</td>
        <td style="padding:5px 8px;border:1px solid #fde68a;text-align:center">${total > 0 ? (((cnt.ref + cnt.fail) / total) * 100).toFixed(1) : 0}%</td>
      </tr>`).join('');

  const subjectSection = subjectRows ? `
    <div style="margin:30px 0 10px;font-family:'Georgia',serif;font-size:12px;font-weight:700;color:#006A4E;border-left:4px solid #006A4E;padding-left:12px;">
      Subject-wise Referred / Failed Analysis
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:9.5px;">
      <thead>
        <tr style="background:#fef3c7">
          <th style="padding:6px;border:1px solid #fde68a">Sl.</th>
          <th style="padding:6px;border:1px solid #fde68a;text-align:left">Subject Code</th>
          <th style="padding:6px;border:1px solid #fde68a">Referred</th>
          <th style="padding:6px;border:1px solid #fde68a">Failed</th>
          <th style="padding:6px;border:1px solid #fde68a">Total</th>
          <th style="padding:6px;border:1px solid #fde68a">% of Class</th>
        </tr>
      </thead>
      <tbody>${subjectRows}</tbody>
    </table>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&family=Noto+Serif:wght@400;700&display=swap');

    * { margin:0; padding:0; box-sizing:border-box; }
    body { 
      font-family: 'Source Sans 3', Arial, sans-serif; 
      font-size: 11px; 
      color: #1a1a2e; 
      background: #fff;
      line-height: 1.5;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 15mm 14mm;
      margin: 0 auto;
      background: white;
      position: relative;
      page-break-after: always;
    }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #cfe0d8; padding: 6px 5px; vertical-align: middle; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; }
  </style>
</head>
<body>
  <div class="page">
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);font-size:88px;font-weight:900;color:rgba(0,106,78,0.06);font-family:'Noto Serif',serif;pointer-events:none;z-index:0">OFFICIAL</div>

    <div style="position:relative;z-index:1">
      <div style="text-align:right;font-size:8.5px;color:#6b7280;margin-bottom:12px">Generated: ${printDate}</div>

      <!-- Clean Official Header -->
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-family:'Noto Serif',serif;font-size:22px;font-weight:700;color:#006A4E">
          Dinajpur Polytechnic Institute
        </div>
        <div style="font-size:12px;color:#333;margin-top:4px">
          Department of Computer Science and Technology
        </div>
      </div>

      <!-- Report Title -->
      <div style="background:#006A4E;color:white;text-align:center;font-size:15px;font-weight:700;padding:10px 0;margin-bottom:18px">
        Diploma in Engineering — Result Analysis Report
      </div>

      <!-- Group Information -->
      <div style="background:#f8f9f7;padding:14px;border:1px solid #d1d5db;border-radius:4px;margin-bottom:20px;font-size:10.5px">
        <table style="width:100%;border:none">
          <tr>
            <td style="padding:4px 0"><strong>Group</strong></td>
            <td style="padding:4px 0">: ${group.name}</td>
            <td style="padding:4px 0"><strong>Session</strong></td>
            <td style="padding:4px 0">: ${group.session}</td>
          </tr>
          <tr>
            <td style="padding:4px 0"><strong>Semester</strong></td>
            <td style="padding:4px 0">: ${displaySem}</td>
            <td style="padding:4px 0"><strong>Shift</strong></td>
            <td style="padding:4px 0">: ${group.shift?.name ?? '—'}</td>
          </tr>
          <tr>
            <td style="padding:4px 0"><strong>Exam Year</strong></td>
            <td style="padding:4px 0">: ${displayYear}</td>
            <td style="padding:4px 0"><strong>Department</strong></td>
            <td style="padding:4px 0">: ${group.department?.shortName || 'CST'}</td>
          </tr>
        </table>
      </div>

      <!-- Official Summary Text -->
      <div style="margin-bottom:22px;font-size:10.5px">
        <strong>Total Students:</strong> ${total} &nbsp;&nbsp;&nbsp;
        <strong>Passed:</strong> ${passCount} &nbsp;&nbsp;&nbsp;
        <strong>Failed:</strong> ${failCount} &nbsp;&nbsp;&nbsp;
        <strong>Referred:</strong> ${referCount} &nbsp;&nbsp;&nbsp;
        <strong>Pass Rate:</strong> ${passRate}%
      </div>

      <!-- Student-wise Result Details -->
      <div style="margin-bottom:25px">
        <div style="font-family:'Noto Serif',serif;font-size:12.5px;font-weight:700;color:#006A4E;margin-bottom:10px;border-left:4px solid #006A4E;padding-left:12px;">
          Student-wise Result Details
        </div>
        <table style="font-size:9.5px">
          <thead>
            <tr style="background:#006A4E;color:white">
              <th style="width:28px">Sl.</th>
              <th style="text-align:left">Name</th>
              <th style="width:72px">Roll</th>
              ${GPA_KEYS.map(k => `<th style="width:38px">${k.replace('gpa', '')}</th>`).join('')}
              <th style="width:46px">Avg</th>
              <th style="width:58px">Status</th>
              <th>Ref / Fail Subjects</th>
            </tr>
          </thead>
          <tbody>${resultRows}</tbody>
        </table>
      </div>

      ${subjectSection}

      <!-- Extra space -->
      <div style="height: 70px;"></div>

      <!-- Signature Section -->
      <div style="border-top:2px solid #006A4E;padding-top:25px;display:flex;justify-content:space-between;font-size:10.5px;color:#333">
        <div style="text-align:center">
          <div style="width:160px;border-top:1px solid #1f2937;margin:0 auto 10px"></div>
          Class Teacher<br>
          <small style="color:#666">Department of CST</small>
        </div>
        <div style="text-align:center">
          Dinajpur Polytechnic Institute<br>
          <small style="color:#777">Computer Generated Official Document</small>
        </div>
        <div style="text-align:center">
          <div style="width:160px;border-top:1px solid #1f2937;margin:0 auto 10px"></div>
          Head of Department<br>
          <small style="color:#666">Computer Science & Technology</small>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ── Server Action ─────────────────────────────────────────────────────────────
export async function generateDiplomaReport(
  groupId: number,
  semester?: string
): Promise<{ pdfBase64: string; filename: string } | { error: string }> {
  let browser;
  try {
    const response = await getGroupById(groupId);
    if (!response?.success || !response?.data) {
      return { error: response?.message ?? 'Failed to fetch group data' };
    }

    const group = response.data;
    const html = buildHtml(group, semester);

    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(resolve => setTimeout(resolve, 1200));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', right: '14mm', bottom: '20mm', left: '14mm' },
      preferCSSPageSize: true,
    });

    await browser.close();

    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
    const semLabel = semester ? semester.replace(/\s+/g, '-') : 'all-semesters';
    const filename = `DPI-CST-Group${group.name}-${semLabel}-${group.session}.pdf`;

    return { pdfBase64, filename };
  } catch (err) {
    console.error('[generateDiplomaReport]', err);
    if (browser) await browser.close().catch(() => { });
    return { error: err instanceof Error ? err.message : 'PDF generation failed' };
  }
}