'use client';

import { useRouter } from 'next/navigation';

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
        total?: number;
    };
};

const shiftBadge: Record<string, string> = {
    Morning: 'bg-emerald-50 text-emerald-700',
    Day: 'bg-blue-50 text-blue-700',
    Evening: 'bg-amber-50 text-amber-700',
};

export default function GroupOverview({ initialData }: Props) {
    const router = useRouter();

    const { data: groups = [], total } = initialData;

    const goToGroup = (id: number) => {
        router.push(`group-overview/${id}`);
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-medium">Group overview</h1>
                    <p className="text-sm text-gray-500 mt-1">{total ?? groups.length} groups total</p>
                </div>
            </div>

            {groups.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="border rounded-xl p-4 bg-white animate-pulse flex flex-col gap-3 h-44">
                            <div className="h-4 bg-gray-100 rounded w-1/3" />
                            <div className="h-4 bg-gray-100 rounded w-2/3" />
                            <div className="h-4 bg-gray-100 rounded w-1/2" />
                            <div className="mt-auto h-8 bg-gray-100 rounded" />
                        </div>
                    ))}
                </div>
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
                                <p className="font-medium text-[15px] text-gray-900">
                                    {g.currentSemester?.name} Semester · Group {g.name}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">{g.department?.name}</p>
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
        </div>
    );
}