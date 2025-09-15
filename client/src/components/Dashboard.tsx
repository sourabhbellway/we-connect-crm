import backgroundImage from "../assets/backgroundImage.jpg";
import StatsCard from "./StatsCard";
import {
  HiOutlineUserGroup,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlinePlus,
  HiOutlineCheck,
  HiOutlineUsers,
  HiOutlineClipboard,
} from "react-icons/hi2";
import { FiClock } from "react-icons/fi";
import { useState, useEffect } from "react";
import { userService } from "../services/userService";
import { leadService } from "../services/leadService";
import { roleService } from "../services/roleService";
import { activityService } from "../services/activityService";
import { useAuth } from "../contexts/AuthContext";
import { transformActivityData } from "../utils/activityUtils";
import apiClient from "../services/authService";

function Dashboard() {
  const { hasPermission, user } = useAuth();
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    newUsers: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeadLoading, setIsLeadLoading] = useState(true);
  const [isRoleLoading, setIsRoleLoading] = useState(true);
  const [isActivityLoading, setIsActivityLoading] = useState(true);
  const [isStatusLoading, setIsStatusLoading] = useState(true);
  const [visitorsThisMonth, setVisitorsThisMonth] = useState<number>(0);
  const [systemStatus, setSystemStatus] = useState({
    api: false,
    database: false,
    frontend: true,
  });
  const [latency, setLatency] = useState<{
    apiMs: number | null;
    dbMs: number | null;
  }>({
    apiMs: null,
    dbMs: null,
  });
  const [activityCounts, setActivityCounts] = useState<{
    today: number;
    week: number;
    month: number;
    total: number;
  }>({ today: 0, week: 0, month: 0, total: 0 });

  // Slider state and datasets
  // const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [leadStats, setLeadStats] = useState<{
    totalLeads: number;
    newLeads: number;
    contactedLeads: number;
    qualifiedLeads: number;
    proposalLeads: number;
    negotiationLeads: number;
    closedLeads: number;
    lostLeads: number;
  }>({
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    qualifiedLeads: 0,
    proposalLeads: 0,
    negotiationLeads: 0,
    closedLeads: 0,
    lostLeads: 0,
  });
  const [roleStats, setRoleStats] = useState<{
    totalRoles: number;
    activeRoles: number;
    inactiveRoles: number;
  }>({ totalRoles: 0, activeRoles: 0, inactiveRoles: 0 });

  // Activity Calendar / To-Do state
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newTodoText, setNewTodoText] = useState<string>("");
  const [todosByDate, setTodosByDate] = useState<
    Record<string, { id: string; text: string; done: boolean }[]>
  >({});

  // Helpers for calendar
  const formatKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const monthLabel = (d: Date) =>
    d.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const getMonthMatrix = (d: Date) => {
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = (firstDay.getDay() + 6) % 7; // make Monday=0
    const daysInMonth = lastDay.getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(year, month, day));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  };

  // Persist todos in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dashboardActivityTodos");
      if (saved) setTodosByDate(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "dashboardActivityTodos",
        JSON.stringify(todosByDate)
      );
    } catch {}
  }, [todosByDate]);

  const addTodo = () => {
    const text = newTodoText.trim();
    if (!text) return;
    const key = formatKey(selectedDate);
    setTodosByDate((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), { id: `${Date.now()}`, text, done: false }],
    }));
    setNewTodoText("");
  };

  const toggleTodo = (key: string, id: string) => {
    setTodosByDate((prev) => ({
      ...prev,
      [key]: (prev[key] || []).map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      ),
    }));
  };

  const removeTodo = (key: string, id: string) => {
    setTodosByDate((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((t) => t.id !== id),
    }));
  };

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        if (hasPermission("user.read")) {
          const response = await userService.getUserStats();
          const stats = response.data.stats;

          setUserStats({
            totalUsers: stats.totalUsers,
            activeUsers: stats.activeUsers,
            inactiveUsers: stats.inactiveUsers,
            newUsers: stats.newUsers,
          });
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchActivities = async () => {
      try {
        if (hasPermission("activity.read")) {
          const response = await activityService.getRecentActivities(5);
          const transformedActivities = response.data.map(
            transformActivityData
          );
          setActivities(transformedActivities);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setIsActivityLoading(false);
      }
    };

    fetchUserStats();
    fetchActivities();
  }, [hasPermission]);

  // Fetch Leads and Roles stats for slides
  useEffect(() => {
    const fetchLeadStats = async () => {
      try {
        if (hasPermission("lead.read")) {
          const response = await leadService.getLeadStats();
          const ls = response?.data || response;
          setLeadStats({
            totalLeads: ls.totalLeads ?? 0,
            newLeads: ls.newLeads ?? 0,
            contactedLeads: ls.contactedLeads ?? 0,
            qualifiedLeads: ls.qualifiedLeads ?? 0,
            proposalLeads: ls.proposalLeads ?? 0,
            negotiationLeads: ls.negotiationLeads ?? 0,
            closedLeads: ls.closedLeads ?? 0,
            lostLeads: ls.lostLeads ?? 0,
          });
        }
      } catch (error) {
        console.error("Error fetching lead stats:", error);
      } finally {
        setIsLeadLoading(false);
      }
    };

    const fetchRoleStats = async () => {
      try {
        if (hasPermission("role.read")) {
          const response = await roleService.getRoles();
          const roles = response?.data?.roles || [];
          const totalRoles = roles.length;
          const activeRoles = roles.filter((r: any) => r.isActive).length;
          const inactiveRoles = totalRoles - activeRoles;
          setRoleStats({ totalRoles, activeRoles, inactiveRoles });
        }
      } catch (error) {
        console.error("Error fetching role stats:", error);
      } finally {
        setIsRoleLoading(false);
      }
    };

    fetchLeadStats();
    fetchRoleStats();
  }, [hasPermission]);

  useEffect(() => {
    const fetchSystemStatusAndVisitors = async () => {
      try {
        // API health + latency
        const apiStart = performance.now();
        const health = await apiClient.get("/health");
        const apiEnd = performance.now();
        const apiOk = Boolean(health.data?.success);

        // Database status heuristic: if we can fetch user stats (already gated by permission), DB is OK
        let dbOk = false;
        let dbLatencyMs: number | null = null;
        try {
          if (hasPermission("user.read")) {
            const dbStart = performance.now();
            await userService.getUserStats();
            const dbEnd = performance.now();
            dbLatencyMs = Math.max(0, Math.round(dbEnd - dbStart));
            dbOk = true;
          }
        } catch {
          dbOk = false;
        }

        // Visitors this month from activity stats if permitted
        let monthVisitors = 0;
        let todayCount = 0;
        let weekCount = 0;
        let totalCount = 0;
        try {
          if (hasPermission("activity.read")) {
            const activityStats = await activityService.getActivityStats();
            monthVisitors = activityStats?.data?.monthCount || 0;
            todayCount = activityStats?.data?.todayCount || 0;
            weekCount = activityStats?.data?.weekCount || 0;
            totalCount = activityStats?.data?.totalCount || 0;
          }
        } catch {
          monthVisitors = 0;
        }

        setSystemStatus({ api: apiOk, database: dbOk, frontend: true });
        setVisitorsThisMonth(monthVisitors);
        setActivityCounts({
          today: todayCount,
          week: weekCount,
          month: monthVisitors,
          total: totalCount,
        });
        setLatency({
          apiMs: Math.max(0, Math.round(apiEnd - apiStart)),
          dbMs: dbLatencyMs,
        });
      } catch (error) {
        setSystemStatus((s) => ({ ...s, api: false }));
      } finally {
        setIsStatusLoading(false);
      }
    };

    fetchSystemStatusAndVisitors();
  }, [hasPermission]);

  return (
    <div className="bg-[#EAEDF6] dark:bg-gray-900 min-h-screen">
      <div
        className="header bg-cover bg-center lg:flex justify-between items-center p-6 md:p-10 min-h-[27vh] relative"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="left lg:w-[30%] relative z-10 ">
          <p className="text-3xl text-zinc-300 font-extralight">
            Good Morning,{" "}
            <span className="font-semibold text-white">
              {user
                ? user.fullName ||
                  `${user.firstName} ${user.lastName}` ||
                  user.email
                : ""}
            </span>
          </p>
          <p className="text-zinc-300 mt-2 text-sm">
            Welcome to your dashboard, We're excited to have you here.
          </p>
        </div>
        {/* Mobile stats: same UX as desktop (prev/next buttons, no tabs) */}
        {/* <div className="lg:hidden w-full relative z-10 mt-6">
          {(() => {
            const slides = [
              "users",
              ...(hasPermission("lead.read") ? ["leads"] : []),
              ...(hasPermission("role.read") ? ["roles"] : []),
            ];
            const activeKey =
              slides[
                ((currentSlide % slides.length) + slides.length) % slides.length
              ] || "users";

            return (
              <div className="space-y-3">
              

                {activeKey === "leads" ? (
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Stats
                      icon={<HiOutlineUserGroup />}
                      count={isLeadLoading ? "..." : leadStats.totalLeads}
                      title="Total Leads"
                      activity="All active leads"
                      colorType="normal"
                    />
                    <Stats
                      icon={<HiOutlineUserPlus />}
                      count={isLeadLoading ? "..." : leadStats.newLeads}
                      title="New Leads"
                      activity="Recently created"
                      colorType="sky"
                    />
                    <Stats
                      icon={<HiOutlineUser />}
                      count={isLeadLoading ? "..." : leadStats.qualifiedLeads}
                      title="Qualified"
                      activity="Marked qualified"
                      colorType="green"
                    />
                    <Stats
                      icon={<HiOutlineCheck />}
                      count={isLeadLoading ? "..." : leadStats.closedLeads}
                      title="Closed"
                      activity="Won deals"
                      colorType="green"
                    />
                  </div>
                ) : activeKey === "roles" ? (
                  (() => {
                    const activePercent = roleStats.totalRoles
                      ? Math.round(
                          (roleStats.activeRoles / roleStats.totalRoles) * 100
                        )
                      : 0;
                    return (
                      <div className="grid grid-cols-2 gap-2 w-full">
                        <Stats
                          icon={<HiOutlineUserGroup />}
                          count={isRoleLoading ? "..." : roleStats.totalRoles}
                          title="Total Roles"
                          activity="All roles"
                          colorType="normal"
                        />
                        <Stats
                          icon={<HiOutlineUserPlus />}
                          count={isRoleLoading ? "..." : roleStats.activeRoles}
                          title="Active Roles"
                          activity="Enabled roles"
                          colorType="green"
                        />
                        <Stats
                          icon={<HiOutlineUserMinus />}
                          count={isRoleLoading ? "..." : roleStats.inactiveRoles}
                          title="Inactive Roles"
                          activity="Disabled roles"
                          colorType="red"
                        />
                        <Stats
                          icon={<HiOutlineCheck />}
                          count={isRoleLoading ? "..." : `${activePercent}%`}
                          title="Active %"
                          activity="Role health"
                          colorType="sky"
                        />
                      </div>
                    );
                  })()
                ) : (
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Stats
                      icon={<HiOutlineUser />}
                      count={isLoading ? "..." : userStats.totalUsers}
                      title="Total Users"
                      activity="All registered users"
                      colorType="normal"
                    />
                    <Stats
                      icon={<HiOutlineUserGroup />}
                      count={isLoading ? "..." : userStats.activeUsers}
                      title="Active Users"
                      activity="Currently active"
                      colorType="green"
                    />
                    <Stats
                      icon={<HiOutlineUserMinus />}
                      count={isLoading ? "..." : userStats.inactiveUsers}
                      title="Inactive Users"
                      activity="Deactivated accounts"
                      colorType="red"
                    />
                    <Stats
                      icon={<HiOutlineUserPlus />}
                      count={isLoading ? "..." : userStats.newUsers}
                      title="New Users"
                      activity="Last 30 days"
                      colorType="sky"
                    />
                  </div>
                )}
                  <div className="flex items-center justify-center gap-2">
                  <button
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
                    onClick={() =>
                      setCurrentSlide(
                        (prev) => (prev - 1 + slides.length) % slides.length
                      )
                    }
                    aria-label="Previous slide"
                  >
                    <HiOutlineChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
                    onClick={() =>
                      setCurrentSlide((prev) => (prev + 1) % slides.length)
                    }
                    aria-label="Next slide"
                  >
                    <HiOutlineChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
        <div className="hidden lg:flex gap-2 lg:w-[70%] items-center relative z-10 mt-10">
          <button
            className="hidden lg:flex items-center justify-center p-2 rounded-full bg-white/20 hover:bg-white/30 text-white mr-2"
            onClick={() => {
              const slides = [
                "users",
                ...(hasPermission("lead.read") ? ["leads"] : []),
                ...(hasPermission("role.read") ? ["roles"] : []),
              ];
              setCurrentSlide(
                (prev) => (prev - 1 + slides.length) % slides.length
              );
            }}
            aria-label="Previous slide"
          >
            <HiOutlineChevronLeft className="w-4 h-4" />
          </button>

          {(() => {
            const slides = [
              "users",
              ...(hasPermission("lead.read") ? ["leads"] : []),
              ...(hasPermission("role.read") ? ["roles"] : []),
            ];
            const activeKey =
              slides[
                ((currentSlide % slides.length) + slides.length) % slides.length
              ] || "users";

            if (activeKey === "leads") {
              return (
                <div className="grid md:grid-cols-4 gap-2 w-full">
                  <Stats
                    icon={<HiOutlineUserGroup />}
                    count={isLeadLoading ? "..." : leadStats.totalLeads}
                    title="Total Leads"
                    activity="All active leads"
                    colorType="normal"
                  />
                  <Stats
                    icon={<HiOutlineUserPlus />}
                    count={isLeadLoading ? "..." : leadStats.newLeads}
                    title="New Leads"
                    activity="Recently created"
                    colorType="sky"
                  />
                  <Stats
                    icon={<HiOutlineUser />}
                    count={isLeadLoading ? "..." : leadStats.qualifiedLeads}
                    title="Qualified"
                    activity="Marked qualified"
                    colorType="green"
                  />
                  <Stats
                    icon={<HiOutlineCheck />}
                    count={isLeadLoading ? "..." : leadStats.closedLeads}
                    title="Closed"
                    activity="Won deals"
                    colorType="green"
                  />
                </div>
              );
            }

            if (activeKey === "roles") {
              const activePercent = roleStats.totalRoles
                ? Math.round(
                    (roleStats.activeRoles / roleStats.totalRoles) * 100
                  )
                : 0;
              return (
                <div className="grid grid-cols-4 gap-2 w-full">
                  <Stats
                    icon={<HiOutlineUserGroup />}
                    count={isRoleLoading ? "..." : roleStats.totalRoles}
                    title="Total Roles"
                    activity="All roles"
                    colorType="normal"
                  />
                  <Stats
                    icon={<HiOutlineUserPlus />}
                    count={isRoleLoading ? "..." : roleStats.activeRoles}
                    title="Active Roles"
                    activity="Enabled roles"
                    colorType="green"
                  />
                  <Stats
                    icon={<HiOutlineUserMinus />}
                    count={isRoleLoading ? "..." : roleStats.inactiveRoles}
                    title="Inactive Roles"
                    activity="Disabled roles"
                    colorType="red"
                  />
                  <Stats
                    icon={<HiOutlineCheck />}
                    count={isRoleLoading ? "..." : `${activePercent}%`}
                    title="Active %"
                    activity="Role health"
                    colorType="sky"
                  />
                </div>
              );
            }

            return (
              <div className="grid grid-cols-4 gap-2 w-full">
                <Stats
                  icon={<HiOutlineUser />}
                  count={isLoading ? "..." : userStats.totalUsers}
                  title="Total Users"
                  activity="All registered users"
                  colorType="normal"
                />
                <Stats
                  icon={<HiOutlineUserGroup />}
                  count={isLoading ? "..." : userStats.activeUsers}
                  title="Active Users"
                  activity="Currently active"
                  colorType="green"
                />
                <Stats
                  icon={<HiOutlineUserMinus />}
                  count={isLoading ? "..." : userStats.inactiveUsers}
                  title="Inactive Users"
                  activity="Deactivated accounts"
                  colorType="red"
                />
                <Stats
                  icon={<HiOutlineUserPlus />}
                  count={isLoading ? "..." : userStats.newUsers}
                  title="New Users"
                  activity="Last 30 days"
                  colorType="sky"
                />
              </div>
            );
          })()}

          <button
            className="hidden lg:flex items-center justify-center p-2 rounded-full bg-white/20 hover:bg-white/30 text-white ml-2"
            onClick={() => {
              const slides = [
                "users",
                ...(hasPermission("lead.read") ? ["leads"] : []),
                ...(hasPermission("role.read") ? ["roles"] : []),
              ];
              setCurrentSlide((prev) => (prev + 1) % slides.length);
            }}
            aria-label="Next slide"
          >
            <HiOutlineChevronRight className="w-4 h-4" />
          </button>
        </div> */}
        <div className="right lg:w-[70%] relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Users Card */}
            <StatsCard
              icon={<HiOutlineUsers className="w-6 h-6" />}
              title="Total Users"
              value={userStats.totalUsers}
              subtitle={`${userStats.activeUsers} active, ${userStats.inactiveUsers} inactive`}
              trend={{
                value:
                  userStats.totalUsers > 0
                    ? Math.round(
                        (userStats.newUsers / userStats.totalUsers) * 100
                      )
                    : 0,
                label: "new this month",
                isPositive: true,
              }}
              color="blue"
              isLoading={isLoading}
            />

            {/* Total Roles Card */}
            <StatsCard
              icon={<HiOutlineUserGroup className="w-6 h-6" />}
              title="Total Roles"
              value={roleStats.totalRoles}
              subtitle={`${roleStats.activeRoles} active, ${roleStats.inactiveRoles} inactive`}
              trend={{
                value:
                  roleStats.totalRoles > 0
                    ? Math.round(
                        (roleStats.activeRoles / roleStats.totalRoles) * 100
                      )
                    : 0,
                label: "active roles",
                isPositive: true,
              }}
              color="green"
              isLoading={isRoleLoading}
            />

            {/* Total Leads Card */}
            <StatsCard
              icon={<HiOutlineClipboard className="w-6 h-6" />}
              title="Total Leads"
              value={leadStats.totalLeads}
              subtitle={`${leadStats.newLeads} new, ${leadStats.qualifiedLeads} qualified`}
              trend={{
                value:
                  leadStats.totalLeads > 0
                    ? Math.round(
                        (leadStats.closedLeads / leadStats.totalLeads) * 100
                      )
                    : 0,
                label: "conversion rate",
                isPositive: true,
              }}
              color="purple"
              isLoading={isLeadLoading}
            />
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
        {/* System Status Card */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold dark:text-white">SYSTEM STATUS</h3>
            <a
              href="#"
              className="text-red-500  hover:text-red-600 text-xs font-semibold "
            >
              VIEW DETAILS
            </a>
          </div>

          <div className="flex items-center justify-center mb-10">
            <div className="relative w-40 h-40 md:w-60 md:h-60">
              {/* Donut Chart */}
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="4"
                />
                {/* Chart segments */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={systemStatus.database ? "#10b981" : "#ef4444"}
                  strokeWidth="4"
                  strokeDasharray="251.2"
                  strokeDashoffset="188.4"
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={systemStatus.api ? "#3b82f6" : "#ef4444"}
                  strokeWidth="4"
                  strokeDasharray="251.2"
                  strokeDashoffset="188.4"
                  strokeLinecap="round"
                  transform="rotate(90 50 50)"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={systemStatus.frontend ? "#fbbf24" : "#ef4444"}
                  strokeWidth="4"
                  strokeDasharray="251.2"
                  strokeDashoffset="188.4"
                  strokeLinecap="round"
                  transform="rotate(180 50 50)"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="4"
                  strokeDasharray="251.2"
                  strokeDashoffset="188.4"
                  strokeLinecap="round"
                  transform="rotate(270 50 50)"
                />
              </svg>

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {isStatusLoading ? "..." : visitorsThisMonth.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  visitors this month
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  {isStatusLoading
                    ? ""
                    : `today ${activityCounts.today} • week ${activityCounts.week}`}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 lg:mt-0 lg:absolute lg:bottom-2 lg:left-6 lg:right-6">
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  systemStatus.database ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-xs text-gray-600 dark:text-gray-300">
                DATABASE{" "}
                {isStatusLoading
                  ? ""
                  : systemStatus.database
                  ? `(ok${latency.dbMs != null ? `, ${latency.dbMs}ms` : ""})`
                  : "(down)"}
              </span>
            </div>
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  systemStatus.api ? "bg-blue-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-xs text-gray-600 dark:text-gray-300">
                API SERVER{" "}
                {isStatusLoading
                  ? ""
                  : systemStatus.api
                  ? `(ok${latency.apiMs != null ? `, ${latency.apiMs}ms` : ""})`
                  : "(down)"}
              </span>
            </div>
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  systemStatus.frontend ? "bg-yellow-400" : "bg-red-500"
                }`}
              ></div>
              <span className="text-xs text-gray-600 dark:text-gray-300">
                FRONTEND
              </span>
            </div>
          </div>
        </div>

        {/* System Activity Card */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold dark:text-white">SYSTEM ACTIVITY</h3>
            <a
              href="#"
              className="text-red-500 hover:text-red-600 text-xs font-semibold"
            >
              VIEW ALL
            </a>
          </div>

          <div className="space-y-4 max-h-80 overflow-y-auto">
            {isActivityLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <activity.icon
                      className={`w-4 h-4 ${activity.iconColor}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 ">
                        <FiClock className="w-3 h-3 mr-1" />
                        {activity.time}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {activity.description}
                    </p>
                    <div className="flex mt-1 space-x-1">
                      {activity.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No recent activities</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Calendar */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold dark:text-white">ACTIVITY CALENDAR</h3>
            <div className="flex items-center gap-2">
              <button
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                onClick={() =>
                  setCurrentMonth(
                    (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1)
                  )
                }
                aria-label="Previous month"
              >
                <HiOutlineChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-200 ">
                {monthLabel(currentMonth)}
              </div>
              <button
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                onClick={() =>
                  setCurrentMonth(
                    (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1)
                  )
                }
                aria-label="Next month"
              >
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Calendar grid */}
            <div className="lg:col-span-2 overflow-x-auto">
              <div className="grid grid-cols-7 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-300 mb-2 min-w-[420px] sm:min-w-0">
                <div className="text-center">Mon</div>
                <div className="text-center">Tue</div>
                <div className="text-center">Wed</div>
                <div className="text-center">Thu</div>
                <div className="text-center">Fri</div>
                <div className="text-center">Sat</div>
                <div className="text-center">Sun</div>
              </div>
              <div className="grid grid-cols-7 gap-1 sm:gap-2 min-w-[420px] sm:min-w-0">
                {getMonthMatrix(currentMonth).map((cell, idx) => {
                  if (!cell)
                    return (
                      <div
                        key={idx}
                        className="h-10 sm:h-10 rounded border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20"
                      ></div>
                    );
                  const key = formatKey(cell);
                  const isToday = formatKey(new Date()) === key;
                  const isSelected = formatKey(selectedDate) === key;
                  const count = (todosByDate[key] || []).length;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(cell)}
                      className={`relative h-10 w-10 sm:h-7 sm:w-7 rounded border p-0 flex items-center justify-center overflow-hidden transition-colors ${
                        isSelected
                          ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      }`}
                    >
                      <span
                        className={`text-[10px] sm:text-xs ${
                          isToday
                            ? "font-semibold text-blue-600"
                            : "text-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {cell.getDate()}
                      </span>
                      {count > 0 && (
                        <span className="absolute top-1 right-1 text-[9px] sm:text-[10px] px-1 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                          {count}
                        </span>
                      )}
                      <div className="hidden sm:block absolute left-1 right-1 bottom-1 space-y-0.5 overflow-hidden">
                        {(todosByDate[key] || []).slice(0, 2).map((t) => (
                          <div
                            key={t.id}
                            className={`truncate text-[8px] rounded px-1 py-0.5 ${
                              t.done
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                            }`}
                            title={t.text}
                          >
                            {t.text}
                          </div>
                        ))}
                        {(todosByDate[key] || []).length > 2 && (
                          <div className="text-[8px] text-center text-gray-500">
                            + more
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Todo list for selected date */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-gray-700 dark:text-gray-200">
                  {formatKey(selectedDate)}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  placeholder="Add a to-do..."
                  className="w-full text-xs px-2 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addTodo();
                  }}
                />
                <button
                  onClick={addTodo}
                  className="px-2 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                  aria-label="Add to-do"
                >
                  <HiOutlinePlus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(todosByDate[formatKey(selectedDate)] || []).length === 0 ? (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    No to-dos for this day
                  </div>
                ) : (
                  (todosByDate[formatKey(selectedDate)] || []).map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded px-2 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            toggleTodo(formatKey(selectedDate), t.id)
                          }
                          className={`w-5 h-5 flex items-center justify-center rounded border text-white ${
                            t.done
                              ? "bg-green-600 border-green-600"
                              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                          }`}
                          aria-label="Toggle to-do"
                        >
                          {t.done && <HiOutlineCheck className="w-3 h-3" />}
                        </button>
                        <span
                          className={`text-xs ${
                            t.done
                              ? "line-through text-gray-400"
                              : "text-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {t.text}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          removeTodo(formatKey(selectedDate), t.id)
                        }
                        className="text-[10px] text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div> 
      </div>
    </div>
  );
}

export default Dashboard;
