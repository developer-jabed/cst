import { getUserInfo } from "@/service/auth/getUserInfo";
import ProfileClient from "../../../../components/modules/MyProfile/MyProfile";

export const dynamic = "force-dynamic";

// Scoped overrides: they sit on top of the .pr-* classes in globals.css
// (higher specificity via .pr-page), so nothing else in the app changes.
const PAGE_CSS = `
/* ── Layout: let the dashboard background show through ── */
.pr-page .pr-wrap { max-width: 1100px; padding: 0 0 56px; }

/* ── Cards: frosted ivory glass with a hairline gold edge ── */
.pr-page .pr-card {
  background: linear-gradient(180deg, rgba(255,255,255,.88), rgba(255,255,255,.70));
  -webkit-backdrop-filter: blur(14px) saturate(1.25);
  backdrop-filter: blur(14px) saturate(1.25);
  border: 1px solid rgba(201,162,75,.30);
  box-shadow:
    0 1px 0 rgba(255,255,255,.95) inset,
    0 1px 2px rgba(11,31,26,.05),
    0 18px 40px -14px rgba(6,78,59,.18);
  transition: border-color .3s ease, box-shadow .3s ease, transform .3s ease;
}
.pr-page .pr-card:hover {
  border-color: rgba(201,162,75,.5);
  box-shadow:
    0 1px 0 rgba(255,255,255,.95) inset,
    0 2px 4px rgba(11,31,26,.06),
    0 24px 48px -14px rgba(6,78,59,.24);
}
.pr-page .pr-stat { background: rgba(250,248,242,.72); border-color: rgba(201,162,75,.22); }
.pr-page .pr-stat:hover { border-color: rgba(5,150,105,.45); }
.pr-page .pr-field:hover { background: rgba(236,253,245,.65); }
.pr-page .pr-divider,
.pr-page .pr-tabs { border-color: rgba(201,162,75,.22); }
.pr-page .pr-divider { background: rgba(201,162,75,.22); }
.pr-page .pr-tl-item { border-color: rgba(201,162,75,.16); }

/* ── Dark mode: the pr-* colours are hardcoded light, so remap them ── */
.dark .pr-page .pr-card {
  background: linear-gradient(180deg, rgba(14,36,29,.80), rgba(8,22,18,.68));
  border-color: rgba(230,207,148,.16);
  box-shadow:
    0 1px 0 rgba(255,255,255,.04) inset,
    0 1px 2px rgba(0,0,0,.4),
    0 18px 40px -14px rgba(0,0,0,.6);
}
.dark .pr-page .pr-card:hover { border-color: rgba(230,207,148,.32); }
.dark .pr-page .pr-root { color: #cbd5d1; }
.dark .pr-page .pr-name,
.dark .pr-page .pr-panel-title,
.dark .pr-page .pr-activity-title,
.dark .pr-page .pr-stat-value,
.dark .pr-page .pr-tl-text strong,
.dark .pr-page .pr-breadcrumb-current { color: #f1ede0; }
.dark .pr-page .pr-stat-value.accent,
.dark .pr-page .pr-field-value.mono { color: #34d399; }
.dark .pr-page .pr-field-value { color: #e7e2d3; }
.dark .pr-page .pr-stat { background: rgba(255,255,255,.04); border-color: rgba(230,207,148,.14); }
.dark .pr-page .pr-chip { background: rgba(16,185,129,.12); border-color: rgba(230,207,148,.28); color: #6ee7b7; }
.dark .pr-page .pr-avatar { background: linear-gradient(135deg, #0e2a21, #0b3b2e); color: #6ee7b7; }
.dark .pr-page .pr-avatar-dot { border-color: #0b1f1a; }
.dark .pr-page .pr-divider { background: rgba(230,207,148,.14); }
.dark .pr-page .pr-tabs { border-color: rgba(230,207,148,.14); }
.dark .pr-page .pr-tab:hover { background: rgba(16,185,129,.10); color: #6ee7b7; }
.dark .pr-page .pr-tab.active { color: #6ee7b7; }
.dark .pr-page .pr-field:hover { background: rgba(255,255,255,.035); }
.dark .pr-page .pr-tl-item { border-color: rgba(230,207,148,.10); }
`;

export default async function MyProfilePage() {
  const user = await getUserInfo();

  return (
    <div className="pr-page relative">
      <style>{PAGE_CSS}</style>

      {/* Page header */}
      <header className="mx-auto mb-8 max-w-[1100px] animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-700 motion-reduce:animate-none">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-8 bg-gradient-to-r from-gold to-transparent" />
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-gold">
            Account
          </span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-[2.6rem]">
          My Profile
        </h1>
        <p className="mt-2 text-base text-muted-foreground md:text-lg">
          View and manage your account information
        </p>

        {/* Gold hairline that fades out to the right */}
        <div className="mt-6 h-px w-full bg-gradient-to-r from-gold/60 via-gold/20 to-transparent" />
      </header>

      <ProfileClient initialUser={user} />
    </div>
  );
}