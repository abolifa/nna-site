"use client";

import api from "@/lib/api";
import { Stats } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import CountUp from "react-countup";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Building,
  CalendarDays,
  Loader2,
  LucideIcon,
  Package,
  Stethoscope,
  Users,
} from "lucide-react";

const statLabels: {
  key: keyof Stats;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    key: "patients",
    title: "عدد المستفيدين",
    icon: Users,
    description: "عدد المستفيدين من الخدمات الصحية",
  },
  {
    key: "centers",
    title: "المراكز الصحية",
    description: "عدد المراكز التابعة للهيئة",
    icon: Building,
  },
  {
    key: "users",
    title: "الموظفون",
    description: "عدد الموظفين في النظام",
    icon: Users,
  },
  {
    key: "appointments",
    title: "المواعيد",
    description: "عدد المواعيد المجدولة",
    icon: CalendarDays,
  },
  {
    key: "doctors",
    title: "الأطباء",
    description: "عدد الأطباء المسجلين",
    icon: Stethoscope,
  },
  {
    key: "orders",
    title: "الطلبات",
    description: "عدد طلبات الخدمات",
    icon: Package,
  },
];

const SystemStats = () => {
  const { data, isLoading } = useQuery<Stats>({
    queryKey: ["systemStats"],
    queryFn: async () => {
      const res = await api.get("/stats");
      return res.data as Stats;
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold">إحصائيات الهيئة</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: statLabels.length }).map((_, i) => (
              <Card key={i} className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </Card>
            ))
          : statLabels.map((stat) => (
              <Card
                key={stat.key}
                className="shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-3">
                    <stat.icon className="w-6 h-6 text-teal-500" />
                    <span>{stat.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <span className="text-3xl font-bold text-primary">
                    <CountUp
                      end={data?.[stat.key] ?? 0}
                      duration={1.5}
                      separator=","
                    />
                  </span>
                </CardContent>
                <CardFooter>
                  <CardDescription className="text-center w-full">
                    {stat.description}
                  </CardDescription>
                </CardFooter>
              </Card>
            ))}
      </div>
    </div>
  );
};

export default SystemStats;
