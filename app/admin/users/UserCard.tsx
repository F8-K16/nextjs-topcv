"use client";
import { StatCard } from "@/components/ui/statcard";
import { motion } from "framer-motion";
import { RotateCcw, UserCheck, UserPlus, UsersIcon } from "lucide-react";

export default function UserCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
    >
      <StatCard title="Total Users" icon={UsersIcon} value={7670} />
      <StatCard title="New Users" icon={UserPlus} value={860} />
      <StatCard title="Active Users" icon={UserCheck} value={4090} />
      <StatCard title="Returning Users" icon={RotateCcw} value={2730} />
    </motion.div>
  );
}
