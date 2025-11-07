import backgroundImage from "../assets/backgroundImage.jpg";
import {
  HiOutlineUserGroup,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlinePlus,
  HiOutlineCheck,
  HiOutlineUsers,
  HiOutlineClipboard,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlinePhone,
  HiOutlineTrophy,
} from "react-icons/hi2";
import { FiClock, FiTrendingUp } from "react-icons/fi";
import { useState, useEffect } from "react";
import { userService } from "../services/userService";
import { leadService, DashboardKPIs } from "../services/leadService";
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

  // Dashboard KPI state
  const [dashboardKPIs, setDashboardKPIs] = useState<DashboardKPIs | null>(null);
  const [isKPILoading, setIsKPILoading] = useState(true);
  const [scope, setScope] = useState<'all'|'me'>('all');

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
          // Response structure: { success: true, data: { items: [...] } }
          const items = response?.data?.items || response?.data || [];
          const transformedActivities = Array.isArray(items) 
            ? items.map(transformActivityData)
            : [];
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

  // Fetch Dashboard KPIs
  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        if (hasPermission("lead.read")) {
          const response = await leadService.getDashboardKPIs(undefined, undefined, scope === 'me' ? (user?.id as any) : undefined);
          setDashboardKPIs(response.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard KPIs:", error);
      } finally {
        setIsKPILoading(false);
      }
    };
    
    fetchKPIs();
  }, [hasPermission, scope, user?.id]);

  // Fetch Leads and Roles stats for slides
  useEffect(() => {
    const fetchLeadStats = async () => {
      try {
        if (hasPermission("lead.read")) {
          // If scope is 'me', compute stats from my assigned leads
          if (scope === 'me' && user?.id) {
            const res: any = await leadService.getLeads({ page: 1, limit: 100, assignedTo: Number(user.id) });
            const items = res?.data?.leads || res?.data?.items || [];
            const counts = items.reduce((acc: any, l: any) => { acc.total++; acc[`${l.status}Leads`] = (acc[`${l.status}Leads`]||0)+1; return acc; }, { total:0 });
            setLeadStats({
              totalLeads: counts.total || 0,
              newLeads: counts.newLeads || 0,
              contactedLeads: counts.contactedLeads || 0,
              qualifiedLeads: counts.qualifiedLeads || 0,
              proposalLeads: counts.proposalLeads || 0,
              negotiationLeads: counts.negotiationLeads || 0,
              closedLeads: counts.closedLeads || 0,
              lostLeads: counts.lostLeads || 0,
            });
          } else {
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
    <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 min-h-screen">
      <div
        className="header bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"></div>
        
        {/* Hero Section */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className=" mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="flex-1">
                  <div className="mb-4">
                  <p className="text-lg text-white/80 font-light">
                    Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'},
                  </p>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                    {user
                      ? user.fullName ||
                        `${user.firstName} ${user.lastName}` ||
                        user.email?.split('@')[0]
                      : "Welcome"}
                  </h1>
                </div>
                <p className="text-white/70 text-lg max-w-lg leading-relaxed">
                  Here's what's happening with your CRM today. You have{' '}
                  <span className="text-white font-semibold">{userStats.totalUsers} users</span> and{' '}
                  <span className="text-white font-semibold">{leadStats.totalLeads} leads</span> in your {scope === 'me' ? 'pipeline' : 'system'}.
                </p>
              </div>
              <div className="flex items-center bg-white/10 border border-white/20 rounded-full p-1 self-start">
                <button className={`px-4 py-2 rounded-full text-sm ${scope==='all' ? 'bg-white text-black' : 'text-white'}`} onClick={()=>setScope('all')}>All</button>
                <button className={`px-4 py-2 rounded-full text-sm ${scope==='me' ? 'bg-white text-black' : 'text-white'}`} onClick={()=>setScope('me')}>My data</button>
              </div>

              {/* Stats Cards */}
              <div className="flex-1 w-full ">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {/* Total Users Card */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                        <HiOutlineUsers className="w-6 h-6 text-blue-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-white/60 text-sm font-medium">Total Users</p>
                        <p className="text-3xl font-bold text-white">
                          {isLoading ? "..." : userStats.totalUsers.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">
                        {userStats.activeUsers} active, {userStats.inactiveUsers} inactive
                      </span>
                      <span className="text-green-400 font-medium">+{userStats.newUsers} this month</span>
                    </div>
                  </div>

                  {/* Total Roles Card */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
                        <HiOutlineUserGroup className="w-6 h-6 text-green-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-white/60 text-sm font-medium">Total Roles</p>
                        <p className="text-3xl font-bold text-white">
                          {isRoleLoading ? "..." : roleStats.totalRoles.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">
                        {roleStats.activeRoles} active, {roleStats.inactiveRoles} inactive
                      </span>
                      <span className="text-green-400 font-medium">
                        {roleStats.totalRoles > 0
                          ? Math.round((roleStats.activeRoles / roleStats.totalRoles) * 100)
                          : 0}% active
                      </span>
                    </div>
                  </div>

                  {/* Total Leads Card */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                        <HiOutlineClipboard className="w-6 h-6 text-purple-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-white/60 text-sm font-medium">Total Leads</p>
                        <p className="text-3xl font-bold text-white">
                          {isLeadLoading ? "..." : leadStats.totalLeads.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">
                        {leadStats.newLeads} new, {leadStats.qualifiedLeads} qualified
                      </span>
                      <span className="text-green-400 font-medium">
                        {leadStats.totalLeads > 0
                          ? Math.round((leadStats.closedLeads / leadStats.totalLeads) * 100)
                          : 0}% converted
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="space-y-8 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* System Status Card */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">System Status</h3>
              <button className="text-weconnect-red hover:text-red-600 text-sm font-semibold transition-colors">
                View Details
              </button>
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
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">System Activity</h3>
              <button className="text-weconnect-red hover:text-red-600 text-sm font-semibold transition-colors">
                View All
              </button>
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
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border border-gray-100 dark:border-gray-700 xl:col-span-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Activity Calendar</h3>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
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
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 min-w-[420px] sm:min-w-0">
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
                      className={`relative aspect-square h-10 w-10 sm:h-8 sm:w-8 rounded border p-0 flex items-center justify-center overflow-hidden transition-colors ${
                        isSelected
                          ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      }`}
                    >
                      <span
                        className={`text-[10px] sm:text-xs leading-none ${
                          isToday
                            ? "font-semibold text-blue-600 dark:text-blue-400"
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

        {/* New KPI Metrics Section */}
        {hasPermission("lead.read") && (
          <>
            {/* Revenue Metrics */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border border-gray-100 dark:border-gray-700 mt-6 lg:mt-0">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <HiOutlineCurrencyDollar className="text-green-500" />
                  Revenue Metrics
                </h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {isKPILoading ? "..." : `$${dashboardKPIs?.revenue.total.toLocaleString() || 0}`}
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Deal Size</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {isKPILoading ? "..." : `$${dashboardKPIs?.revenue.avgDealSize.toLocaleString() || 0}`}
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Won Deals</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {isKPILoading ? "..." : dashboardKPIs?.revenue.wonDeals || 0}
                  </p>
                </div>
                
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Active Deals</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {isKPILoading ? "..." : dashboardKPIs?.revenue.activeDeals || 0}
                  </p>
                </div>
                
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Lost Deals</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {isKPILoading ? "..." : dashboardKPIs?.revenue.lostDeals || 0}
                  </p>
                </div>
              </div>

              {/* Revenue by Source */}
              {dashboardKPIs?.revenue.revenueBySource && dashboardKPIs.revenue.revenueBySource.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Top Revenue Sources</h4>
                  <div className="space-y-2">
                    {dashboardKPIs.revenue.revenueBySource.map((source, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{source.source}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{source.leadCount} leads</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-green-600 dark:text-green-400">
                          ${source.revenue.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Conversion & Performance Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border border-gray-100 dark:border-gray-700 mt-6 lg:mt-0">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <HiOutlineTrophy className="text-yellow-500" />
                  Performance
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Win Rate</p>
                    <FiTrendingUp className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {isKPILoading ? "..." : `${dashboardKPIs?.conversion.winRate || 0}%`}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Deals won vs lost
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Conversion Rate</p>
                    <HiOutlineChartBar className="text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {isKPILoading ? "..." : `${dashboardKPIs?.conversion.conversionRate || 0}%`}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {isKPILoading ? "" : `${dashboardKPIs?.conversion.convertedLeads || 0} of ${dashboardKPIs?.conversion.totalLeads || 0} leads`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Sales Cycle</p>
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {isKPILoading ? "..." : `${dashboardKPIs?.conversion.avgSalesCycleDays || 0}d`}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Response</p>
                    <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      {isKPILoading ? "..." : `${dashboardKPIs?.conversion.avgResponseTimeHours || 0}h`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Metrics */}
            <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border border-gray-100 dark:border-gray-700 mt-6 lg:mt-0">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <HiOutlinePhone className="text-blue-500" />
                  Activity & Engagement
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <HiOutlinePhone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {isKPILoading ? "..." : dashboardKPIs?.activity.totalCalls || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Calls</p>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <HiOutlineClipboard className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {isKPILoading ? "..." : dashboardKPIs?.activity.totalTasks || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <HiOutlineCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {isKPILoading ? "..." : dashboardKPIs?.activity.completedTasks || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed Tasks</p>
                </div>

                <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <HiOutlineChartBar className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                    {isKPILoading ? "..." : `${dashboardKPIs?.activity.taskCompletionRate || 0}%`}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Task Completion</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
