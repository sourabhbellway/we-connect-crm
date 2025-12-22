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
    HiOutlineClock,
    HiOutlineXMark
} from "react-icons/hi2";
import { FiClock, FiTrendingUp } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import StatsCard from "./StatsCard";
import { leadService, DashboardKPIs } from "../services/leadService";
import { roleService } from "../services/roleService";
import { activityService } from "../services/activityService";
import { useAuth } from "../contexts/AuthContext";
import { transformActivityData } from "../utils/activityUtils";
import apiClient from "../services/apiClient";
import { PERMISSIONS } from "../constants";
import { analyticsService } from "../services/analyticsService";
import { BarChart, LineChart, AreaChart } from "./charts";

function Dashboard() {
    const { hasPermission, user } = useAuth();
    const navigate = useNavigate();

    // Check if the current user is an admin
    const isAdmin = user?.roles?.some((role) => {
        const name = (role.name || '').toLowerCase();
        return name === 'admin' || name === 'super_admin' || name === 'super admin';
    });
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
    // Admin sees 'all' by default, regular users see only their own data
    const [scope, setScope] = useState<'all' | 'me'>('me');

    // Activity Calendar state
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [calendarActivities, setCalendarActivities] = useState<any[]>([]);

    // Chart data state
    const [revenueTrendsData, setRevenueTrendsData] = useState<any[]>([]);
    const [conversionFunnelData, setConversionFunnelData] = useState<any[]>([]);
    const [salesPipelineData, setSalesPipelineData] = useState<any[]>([]);
    const [activityTrendsData, setActivityTrendsData] = useState<any[]>([]);
    const [isChartsLoading, setIsChartsLoading] = useState(true);


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

    const handlePlanTasksForDate = () => {
        const key = formatKey(selectedDate);
        navigate(`/task-management?dueDate=${key}`);
    };

    // Permission checks
    const canViewUserStats = hasPermission(PERMISSIONS.DASHBOARD_WIDGETS.STATS_USERS);
    const canViewRoleStats = hasPermission(PERMISSIONS.DASHBOARD_WIDGETS.STATS_ROLES);
    const canViewLeadStats = hasPermission(PERMISSIONS.DASHBOARD_WIDGETS.STATS_LEADS);
    const canViewSystemStatus = hasPermission(PERMISSIONS.DASHBOARD_WIDGETS.SYSTEM_STATUS);
    const canViewSystemActivity = hasPermission(PERMISSIONS.DASHBOARD_WIDGETS.SYSTEM_ACTIVITY);
    const canViewActivityCalendar = hasPermission(PERMISSIONS.DASHBOARD_WIDGETS.ACTIVITY_CALENDAR);
    const canViewPerformance = hasPermission(PERMISSIONS.DASHBOARD_WIDGETS.PERFORMANCE);
    const canViewRevenueMetrics = hasPermission(PERMISSIONS.DASHBOARD_WIDGETS.REVENUE_METRICS);
    const canViewActivityEngagement = hasPermission(PERMISSIONS.DASHBOARD_WIDGETS.ACTIVITY_ENGAGEMENT);

    const canViewAnyStats = canViewUserStats || canViewRoleStats || canViewLeadStats;


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
                    const userIdParam = scope === 'me' && user?.id ? Number(user.id) : undefined;
                    const response = await activityService.getRecentActivities(5, userIdParam);
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
    }, [hasPermission, scope, user?.id]);

    // Fetch Dashboard KPIs
    useEffect(() => {
        const fetchKPIs = async () => {
            try {
                if (hasPermission("lead.read")) {
                    const response = await leadService.getDashboardKPIs(undefined, undefined, scope === 'me' ? (user?.id as any) : undefined, scope);
                    setDashboardKPIs(response?.data ?? response);
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
                        const initialCounts = {
                            total: 0,
                            newLeads: 0,
                            contactedLeads: 0,
                            qualifiedLeads: 0,
                            proposalLeads: 0,
                            negotiationLeads: 0,
                            closedLeads: 0,
                            lostLeads: 0,
                        };
                        const statusMap: Record<string, keyof typeof initialCounts> = {
                            new: "newLeads",
                            contacted: "contactedLeads",
                            qualified: "qualifiedLeads",
                            proposal: "proposalLeads",
                            "proposal sent": "proposalLeads",
                            negotiation: "negotiationLeads",
                            negotiating: "negotiationLeads",
                            closed: "closedLeads",
                            won: "closedLeads",
                            lost: "lostLeads",
                        };
                        const counts = items.reduce((acc: typeof initialCounts, lead: any) => {
                            acc.total += 1;
                            const status = String(lead.status || "")
                                .toLowerCase()
                                .replace(/_/g, " ")
                                .trim();
                            const key = statusMap[status];
                            if (key) {
                                acc[key] += 1;
                            }
                            return acc;
                        }, initialCounts);
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
                            totalLeads: (ls.totalLeads ?? ls.total) ?? 0,
                            newLeads: ls.newLeads ?? 0,
                            contactedLeads: ls.contactedLeads ?? 0,
                            qualifiedLeads: ls.qualifiedLeads ?? 0,
                            proposalLeads: ls.proposalLeads ?? 0,
                            negotiationLeads: ls.negotiationLeads ?? 0,
                            closedLeads: (ls.closedLeads ?? ls.converted) ?? 0,
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
    }, [hasPermission, scope, user?.id]);

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

        // Initial fetch
        fetchSystemStatusAndVisitors();

        // Set up real-time polling every 30 seconds
        const interval = setInterval(fetchSystemStatusAndVisitors, 30000);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, [hasPermission]);

    // Fetch calendar activities when month changes
    useEffect(() => {
        const fetchCalendarActivities = async () => {
            if (!hasPermission("activity.read")) return;

            try {
                // Get start and end dates for the current month
                const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

                const response = await apiClient.get('/activities/calendar', {
                    params: {
                        startDate: startDate.toISOString().split('T')[0],
                        endDate: endDate.toISOString().split('T')[0],
                    },
                });

                const activities = response.data?.data?.activities || [];
                setCalendarActivities(activities);
            } catch (error) {
                console.error('Error fetching calendar activities:', error);
                setCalendarActivities([]);
            }
        };

        fetchCalendarActivities();
    }, [currentMonth, hasPermission]);

    // Fetch chart data
    useEffect(() => {
        const fetchChartData = async () => {
            if (!hasPermission("lead.read")) {
                setIsChartsLoading(false);
                return;
            }

            try {
                setIsChartsLoading(true);

                const scopeParam = scope === 'me' ? 'me' : 'all';
                const userIdParam = scope === 'me' && user?.id ? user.id : undefined;

                const [
                    revenueTrendsResponse,
                    conversionFunnelResponse,
                    salesPipelineResponse,
                    activityTrendsResponse,
                ] = await Promise.all([
                    analyticsService.getRevenueTrends(12, userIdParam, scopeParam),
                    analyticsService.getLeadConversionFunnel(userIdParam, scopeParam),
                    analyticsService.getSalesPipelineFlow(6, userIdParam, scopeParam),
                    analyticsService.getActivityTrends(12, userIdParam, scopeParam),
                ]);

                setRevenueTrendsData(revenueTrendsResponse?.data || []);
                setConversionFunnelData(conversionFunnelResponse?.data || []);
                setSalesPipelineData(salesPipelineResponse?.success ? salesPipelineResponse.data : []);
                setActivityTrendsData(activityTrendsResponse?.data || []);
            } catch (error) {
                console.error("Error fetching chart data:", error);
            } finally {
                setIsChartsLoading(false);
            }
        };

        fetchChartData();
    }, [hasPermission, scope, user?.id]);


    return (
        <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 min-h-screen">
            <div
                className="header bg-hero-gradient bg-cover bg-center relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"></div>

                {/* Hero Section */}
                <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-4  lg:py-10">
                    <div className="mx-auto w-full ">
                        <div className="grid gap-10 xl:grid-cols-2">
                            <div className="space-y-5 text-white">
                                <div>
                                    <p className="text-base sm:text-lg text-white/80 font-light">
                                        Good{" "}
                                        {new Date().getHours() < 12
                                            ? "Morning"
                                            : new Date().getHours() < 18
                                                ? "Afternoon"
                                                : "Evening"}
                                        ,
                                    </p>
                                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 leading-tight">
                                        {user
                                            ? user.fullName ||
                                            `${user.firstName} ${user.lastName}` ||
                                            user.email?.split("@")[0]
                                            : "Welcome"}
                                    </h1>

                                </div>

                                <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-2xl">
                                    Here's what's happening with your CRM today. You have{" "}
                                    <span className="text-white font-semibold">
                                        {userStats.totalUsers} users
                                    </span>{" "}
                                    and{" "}
                                    <span className="text-white font-semibold">
                                        {leadStats.totalLeads} leads
                                    </span>{" "}
                                    in your {scope === "me" ? "pipeline" : "system"}.
                                </p>
                                {/* Show scope toggle only for admin users */}
                                {isAdmin && (
                                    <div className="inline-flex flex-col xs:flex-row items-start xs:items-center gap-2">
                                        <div className="flex items-center bg-white/10 border border-white/20 rounded-full p-1 shadow-lg">
                                            <button
                                                type="button"
                                                aria-pressed={scope === "all"}
                                                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm transition-colors ${scope === "all"
                                                    ? "bg-white text-black"
                                                    : "text-white/80"
                                                    }`}
                                                onClick={() => setScope("all")}
                                            >
                                                All Data
                                            </button>
                                            <button
                                                type="button"
                                                aria-pressed={scope === "me"}
                                                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm transition-colors ${scope === "me"
                                                    ? "bg-white text-black"
                                                    : "text-white/80"
                                                    }`}
                                                onClick={() => setScope("me")}
                                            >
                                                My Data
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {canViewAnyStats && (
                                <div className="bg-white/10 backdrop-blur rounded-3xl border border-white/10 p-4 sm:p-6 shadow-2xl">
                                    <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-4">
                                        {canViewUserStats && (
                                            <StatsCard
                                                icon={<HiOutlineUsers className="w-6 h-6" />}
                                                title="Total Users"
                                                value={isLoading ? "..." : userStats.totalUsers}
                                                subtitle={`${userStats.activeUsers} active, ${userStats.inactiveUsers} inactive`}
                                                color="blue"
                                                className=""
                                            />
                                        )}

                                        {canViewRoleStats && (
                                            <StatsCard
                                                icon={<HiOutlineUserGroup className="w-6 h-6" />}
                                                title="Total Roles"
                                                value={isRoleLoading ? "..." : roleStats.totalRoles}
                                                subtitle={`${roleStats.activeRoles} active, ${roleStats.inactiveRoles} inactive`}
                                                color="green"
                                                className=""
                                            />
                                        )}

                                        {canViewLeadStats && (
                                            <StatsCard
                                                icon={<HiOutlineClipboard className="w-6 h-6" />}
                                                title="Total Leads"
                                                value={isLeadLoading ? "..." : leadStats.totalLeads}
                                                subtitle={`${leadStats.newLeads} new, ${leadStats.qualifiedLeads} qualified`}
                                                color="purple"
                                                className=""
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Dashboard Content */}
            <div className="space-y-8 mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                    {/* System Status Card */}


                    {/* System Activity Card */}
                    {canViewSystemActivity && (
                        <div className="relative bg-gray-200 dark:bg-gray-800 rounded-2xl  hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">System Activity</h3>
                                <button
                                    onClick={() => navigate('/activities')}
                                    className="text-weconnect-red hover:text-red-600 text-sm font-semibold transition-colors"
                                >
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
                    )}

                    {/* Activity Calendar */}
                    {canViewActivityCalendar && (
                        <div className="relative bg-gray-200 dark:bg-gray-800 rounded-2xl  hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border border-gray-100 dark:border-gray-700 lg:col-span-1">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Activity Calendar</h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
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
                                    {/* Weekday headings */}
                                    <div className="grid grid-cols-7 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-300 mb-2">
                                        <div className="text-center">Mon</div>
                                        <div className="text-center">Tue</div>
                                        <div className="text-center">Wed</div>
                                        <div className="text-center">Thu</div>
                                        <div className="text-center">Fri</div>
                                        <div className="text-center">Sat</div>
                                        <div className="text-center">Sun</div>
                                    </div>
                                    {/* Calendar days */}
                                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                                        {getMonthMatrix(currentMonth).map((cell, idx) => {
                                            if (!cell)
                                                return (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center justify-center h-10 sm:h-10 aspect-square rounded border border-dashed border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-900/20"
                                                    ></div>
                                                );

                                            const key = formatKey(cell);
                                            const isToday = formatKey(new Date()) === key;
                                            const isSelected = formatKey(selectedDate) === key;

                                            // Check if this date has activities
                                            const dayActivities = calendarActivities.filter(activity => {
                                                if (!activity.date) return false;
                                                const activityDate = new Date(activity.date);
                                                return formatKey(activityDate) === key;
                                            });

                                            const hasActivities = dayActivities.length > 0;

                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedDate(cell)}
                                                    className={`flex items-center justify-center relative aspect-square h-10 w-10 sm:h-10 sm:w-10 rounded border p-0 overflow-hidden transition-colors
          ${isSelected
                                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm"
                                                            : hasActivities
                                                                ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                                                                : "border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-800"
                                                        }`}
                                                >
                                                    <span
                                                        className={`text-[10px] sm:text-xs leading-none ${isToday
                                                            ? "font-semibold text-blue-600 dark:text-blue-400"
                                                            : hasActivities
                                                                ? "font-semibold text-green-600 dark:text-green-400"
                                                                : "text-gray-700 dark:text-gray-200"
                                                            }`}
                                                    >
                                                        {cell.getDate()}
                                                    </span>
                                                    {isSelected && (
                                                        <span className="absolute inset-x-1 bottom-1 h-1 rounded-full bg-blue-200 dark:bg-blue-500/50"></span>
                                                    )}
                                                    {hasActivities && !isSelected && (
                                                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                </div>

                                {/* Selected date actions */}
                                <div className="flex flex-col gap-3">
                                    <div className="text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400">
                                        {formatKey(selectedDate)}
                                    </div>

                                    {/* Show activities for selected date */}
                                    {(() => {
                                        const selectedDateActivities = calendarActivities.filter(activity => {
                                            if (!activity.date) return false;
                                            const activityDate = new Date(activity.date);
                                            return formatKey(activityDate) === formatKey(selectedDate);
                                        });

                                        return selectedDateActivities.length > 0 ? (
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                    Activities ({selectedDateActivities.length})
                                                </h4>
                                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                                    {selectedDateActivities.map((activity, idx) => (
                                                        <div key={idx} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                            <div className="flex items-start gap-2">
                                                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${activity.type === 'MEETING' ? 'bg-blue-500' : 'bg-green-500'
                                                                    }`}></div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                                                        {activity.title}
                                                                    </p>
                                                                    {activity.description && (
                                                                        <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                                                            {activity.description}
                                                                        </p>
                                                                    )}
                                                                    {activity.lead && (
                                                                        <p className="text-xs text-blue-600 dark:text-blue-400">
                                                                            Lead: {activity.lead.firstName} {activity.lead.lastName}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null;
                                    })()}

                                    <button
                                        onClick={handlePlanTasksForDate}
                                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow hover:from-blue-500 hover:to-indigo-500 transition-all"
                                    >
                                        <HiOutlinePlus className="w-4 h-4" />
                                        Plan tasks for this day
                                    </button>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Jump straight into Task Management with this date prefilled. Ideal for scheduling follow-ups, reminders, or any activity uncovered on the calendar.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Conversion & Performance Metrics */}
                    {/* Conversion & Performance Metrics */}
                    {canViewPerformance && (
                        <div className="lg:col-span-1 bg-gray-200 dark:bg-gray-800 rounded-2xl  hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border border-gray-100 dark:border-gray-700 mt-6 lg:mt-0">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <HiOutlineTrophy className="text-yellow-500" />
                                    Performance
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/20 rounded-lg">
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

                                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-800/20 rounded-lg">
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
                    )}

                    {/* System Activity Chart - New Widget */}
                    {canViewPerformance && (
                        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border border-gray-100 dark:border-gray-700 mt-6 lg:mt-0">
                            {isChartsLoading ? (
                                <div className="flex items-center justify-center py-8 h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                </div>
                            ) : (
                                <BarChart
                                    data={activityTrendsData}
                                    title="System Activity Trends (12 Months)"
                                    height={350}
                                    dataKeys={[{ key: 'activities', color: '#6366F1', name: 'Activities' }]}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* KPI Metrics Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                    {/* Revenue Metrics */}
                    {canViewRevenueMetrics && (
                        <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <HiOutlineCurrencyDollar className="text-green-500" />
                                    Revenue Metrics
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                    {
                                        label: "Total Revenue",
                                        value: dashboardKPIs?.revenue.total || 0,
                                        bg: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
                                        color: "text-green-600 dark:text-green-400",
                                        icon: <HiOutlineCurrencyDollar className="w-5 h-5 text-green-600 dark:text-green-400" />,
                                        isCurrency: true
                                    },
                                    {
                                        label: "Avg Deal Size",
                                        value: dashboardKPIs?.revenue.avgDealSize || 0,
                                        bg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
                                        color: "text-blue-600 dark:text-blue-400",
                                        icon: <HiOutlineChartBar className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
                                        isCurrency: true
                                    },
                                    {
                                        label: "Won Deals",
                                        value: dashboardKPIs?.revenue.wonDeals || 0,
                                        bg: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
                                        color: "text-purple-600 dark:text-purple-400",
                                        icon: <HiOutlineCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
                                    },
                                    {
                                        label: "Active Deals",
                                        value: dashboardKPIs?.revenue.activeDeals || 0,
                                        bg: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20",
                                        color: "text-orange-600 dark:text-orange-400",
                                        icon: <HiOutlineClock className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
                                    },
                                    {
                                        label: "Lost Deals",
                                        value: dashboardKPIs?.revenue.lostDeals || 0,
                                        bg: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20",
                                        color: "text-red-600 dark:text-red-400",
                                        icon: <HiOutlineXMark className="w-5 h-5 text-red-600 dark:text-red-400" />,
                                    },
                                ].map((kpi, idx) => (
                                    <div key={idx} className={`p-4 rounded-lg ${kpi.bg} flex flex-col`}>
                                        {/* Icon + Label at top */}
                                        <div className="flex items-center gap-2 mb-2">
                                            {kpi.icon}
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{kpi.label}</p>
                                        </div>
                                        {/* Value below */}
                                        <p className={`text-2xl font-bold ${kpi.color}`}>
                                            {isKPILoading ? "..." : kpi.isCurrency ?
                                                new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: (dashboardKPIs?.revenue?.currency?.code && ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'].includes(dashboardKPIs.revenue.currency.code)) ? dashboardKPIs.revenue.currency.code : 'USD',
                                                    maximumFractionDigits: 0
                                                }).format(kpi.value) :
                                                kpi.value.toLocaleString()
                                            }
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    {/* Activity & Engagement Metrics */}
                    {canViewActivityEngagement && (
                        <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <HiOutlinePhone className="text-blue-500" />
                                    Activity & Engagement
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                    {
                                        label: "Total Calls",
                                        value: dashboardKPIs?.activity.totalCalls || 0,
                                        bg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
                                        color: "text-blue-600 dark:text-blue-400",
                                        icon: <HiOutlinePhone className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
                                    },
                                    {
                                        label: "Total Tasks",
                                        value: dashboardKPIs?.activity.totalTasks || 0,
                                        bg: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
                                        color: "text-purple-600 dark:text-purple-400",
                                        icon: <HiOutlineClipboard className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
                                    },
                                    {
                                        label: "Completed Tasks",
                                        value: dashboardKPIs?.activity.completedTasks || 0,
                                        bg: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
                                        color: "text-green-600 dark:text-green-400",
                                        icon: <HiOutlineCheck className="w-5 h-5 text-green-600 dark:text-green-400" />,
                                    },
                                    {
                                        label: "Task Completion",
                                        value: dashboardKPIs?.activity.taskCompletionRate || 0,
                                        bg: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20",
                                        color: "text-orange-600 dark:text-orange-400",
                                        icon: <HiOutlineChartBar className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
                                    },
                                ].map((kpi, idx) => (
                                    <div key={idx} className={`p-4 rounded-lg ${kpi.bg} flex flex-col`}>
                                        {/* Icon + Label at top */}
                                        <div className="flex items-center gap-2 mb-2">
                                            {kpi.icon}
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{kpi.label}</p>
                                        </div>
                                        {/* Value below */}
                                        <p className={`text-2xl font-bold ${kpi.color}`}>
                                            {isKPILoading ? "..." : kpi.label.includes("Rate") ? `${kpi.value}%` : kpi.value.toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Charts & Analytics Section - Only 3 Important Charts */}
                <div className="space-y-6 lg:space-y-8">
                    {/* Revenue Trends - Full Width */}
                    {canViewRevenueMetrics && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
                            {isChartsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                                </div>
                            ) : (
                                <LineChart
                                    data={revenueTrendsData}
                                    title="Revenue Trends (12 Months)"
                                    height={350}
                                    dataKeys={[{ key: 'revenue', color: '#10B981', name: 'Revenue' }]}
                                    valueFormatter={(value) => new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: (dashboardKPIs?.revenue?.currency?.code && ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'].includes(dashboardKPIs.revenue.currency.code)) ? dashboardKPIs.revenue.currency.code : 'USD',
                                        maximumFractionDigits: 0
                                    }).format(value)}
                                />
                            )}
                        </div>
                    )}

                    {/* Lead Conversion Funnel - Full Width */}
                    {canViewLeadStats && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
                            {isChartsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                </div>
                            ) : (
                                <BarChart
                                    data={conversionFunnelData}
                                    title="Lead Conversion Funnel"
                                    height={350}
                                    dataKeys={[{ key: 'value', color: '#F59E0B', name: 'Count' }]}
                                />
                            )}
                        </div>
                    )}

                    {/* Sales Pipeline Flow - Full Width */}
                    {canViewLeadStats && (
                        <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
                            {isChartsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                </div>
                            ) : (
                                <AreaChart
                                    data={salesPipelineData}
                                    title="Sales Pipeline Flow (6 Months)"
                                    height={400}
                                    dataKeys={[
                                        { key: 'new', color: '#3B82F6', name: 'New Leads' },
                                        { key: 'contacted', color: '#10B981', name: 'Contacted' },
                                        { key: 'qualified', color: '#F59E0B', name: 'Qualified' },
                                        { key: 'proposal', color: '#8B5CF6', name: 'Proposal' },
                                        { key: 'negotiation', color: '#EC4899', name: 'Negotiation' },
                                        { key: 'closed', color: '#14B8A6', name: 'Closed Won' },
                                    ]}
                                    gradientId="pipelineGradient"
                                    valueFormatter={(value) => new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: (dashboardKPIs?.revenue?.currency?.code && ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'].includes(dashboardKPIs.revenue.currency.code)) ? dashboardKPIs.revenue.currency.code : 'USD',
                                        maximumFractionDigits: 0
                                    }).format(value)}
                                />
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default Dashboard;
