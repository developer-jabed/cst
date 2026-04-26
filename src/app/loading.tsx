"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white">
            {/* Rotating Icon */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
                <Loader2 className="w-16 h-16 text-cyan-400" />
            </motion.div>

            {/* Animated Text */}
            <motion.h1
                className="mt-6 text-3xl font-semibold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                Loading your cstians...
            </motion.h1>

            {/* Progress Dots */}
            <motion.div
                className="flex mt-4 space-x-2"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: {},
                    visible: {
                        transition: {
                            staggerChildren: 0.3,
                            repeat: Infinity,
                            repeatDelay: 0.5,
                        },
                    },
                }}
            >
                {[0, 1, 2].map((i) => (
                    <motion.span
                        key={i}
                        className="w-3 h-3 bg-cyan-400 rounded-full"
                        variants={{
                            hidden: { opacity: 0.3, scale: 0.8 },
                            visible: {
                                opacity: [0.3, 1, 0.3],
                                scale: [0.8, 1.2, 0.8],
                                transition: { duration: 0.9 },
                            },
                        }}
                    />
                ))}
            </motion.div>

            {/* Motivational Text */}
            <motion.p
                className="mt-8 text-sm text-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                “Good things take time... greatness is loading 🚀”
            </motion.p>
        </div>
    );
}