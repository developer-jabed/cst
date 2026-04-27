'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useTransition } from 'react';

type Group = {
    id: number;
    name: string;
    department: { name: string };
    currentSemester: { name: string };
    shift: { name: string };
    session: string;
    _count?: { students: number; teachers: number };
};

type Props = {
    initialData: {
        success: boolean;
        data: Group[];
        meta: { page: number; limit: number; total: number };
    };
};

const shiftBadge: Record<string, string> = {
    Morning: 'bg-emerald-50 text-emerald-700',
    Day: 'bg-blue-50 text-blue-700',
    Evening: 'bg-amber-50 text-amber-700',
};

export default function GroupOverview({ initialData }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const { data: groups = [], meta } = initialData;
    const totalPages = Math.ceil((meta?.total || 0) / (meta?.limit || 6));

    const updateParam = useCallback(
        (key: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) params.set(key, value);
            else params.delete(key);
            if (key !== 'page') params.delete('page');
            startTransition(() => router.push(`${pathname}?${params.toString()}`));
        },
        [searchParams, pathname, router]
    );

    const goToGroup = (id: number) => {
        router.push(`group-overview/${id}`);
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-medium">Group overview</h1>
                    <p className="text-sm text-gray-500 mt-1">{meta?.total ?? 0} groups total</p>
                </div>
            </div>


            <input
                type="text"
                placeholder="Search groups..."
                defaultValue={searchParams.get('searchTerm') ?? ''}
                onChange={(e) => updateParam('searchTerm', e.target.value)}
                className="w-full border rounded-lg px-4 py-2 mb-4 text-sm"
            />

            {/* Filters */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <select
                    defaultValue={searchParams.get('departmentId') ?? ''}
                    onChange={(e) => updateParam('departmentId', e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                >
                    <option value="">All departments</option>
                </select>
                <select
                    defaultValue={searchParams.get('semesterId') ?? ''}
                    onChange={(e) => updateParam('semesterId', e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                >
                    <option value="">All semesters</option>
                </select>
                <select
                    defaultValue={searchParams.get('shiftId') ?? ''}
                    onChange={(e) => updateParam('shiftId', e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                >
                    <option value="">All shifts</option>
                </select>
            </div>

            {/* Cards */}
            {isPending ? (
                <p className="text-center text-gray-400 py-10 text-sm">Loading...</p>
            ) : groups.length === 0 ? (
                <p className="text-center text-gray-400 py-10 text-sm">No groups found</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map((g) => (
                        <div
                            key={g.id}
                            className="border rounded-xl p-4 bg-white hover:border-gray-300 hover:shadow-sm transition-all flex flex-col gap-3"
                        >
                            {/* Top row */}
                            <div className="flex items-center justify-between">
                                <span
                                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${shiftBadge[g.shift?.name] ?? 'bg-gray-100 text-gray-600'
                                        }`}
                                >
                                    {g.shift?.name}
                                </span>
                                <span className="text-[11px] text-gray-400">Session {g.session}</span>
                            </div>

                            {/* Group identity */}
                            <div>
                                <p className="font-medium text-[15px] text-gray-900"> {g.currentSemester.name}semester - {g.shift?.name}    Group {g.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {g.department?.name} · Semester {g.currentSemester?.name}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-4 pt-1 border-t border-gray-100">
                                <div>
                                    <p className="text-[11px] text-gray-400">Students</p>
                                    <p className="text-sm font-medium">{g._count?.students ?? 0}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-400">Teachers</p>
                                    <p className="text-sm font-medium">{g._count?.teachers ?? 0}</p>
                                </div>
                            </div>

                            {/* View button */}
                            <button
                                onClick={() => goToGroup(g.id)}
                                className="mt-auto w-full flex items-center justify-center gap-1.5 text-sm border border-gray-200 rounded-lg py-1.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-colors"
                            >
                                View group
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <polyline points="6 3 11 8 6 13" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-end gap-2 mt-6">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => updateParam('page', String(p))}
                            className={`px-3 py-1 text-sm border rounded-lg transition-colors ${Number(searchParams.get('page') || 1) === p
                                    ? 'bg-gray-100 font-medium border-gray-300'
                                    : 'hover:bg-gray-50'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}