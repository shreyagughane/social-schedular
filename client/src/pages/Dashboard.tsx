import { ActivityIcon, CheckCircleIcon, ClockIcon, SendIcon, Share2Icon, TrendingUpIcon } from "lucide-react";
import {useEffect, useState} from "react";
//import {dummyAccountsData,dummyActivityData,dummyPostsData} from "../assets/assets";
import api from "../api/axios";

const Dashboard = () => {
    const [stats, setStats] = useState({scheduled: 0, published: 0, connectedAccounts: 0});
    const[activities, setActivities] = useState<any[]>([])

    useEffect(() => {
        const fetchdashboardData = async () => {
            try {
                const [postsRes, accountsRes, activityRes] = await Promise.all([api.get("/api/posts"),api.get("/api/accounts"), api.get("/api/activity"),]);
                const posts = Array.isArray(postsRes.data) ? postsRes.data : [];
      
      const activitiesData = Array.isArray(activityRes.data) ? activityRes.data : [];
                
            setStats({
                scheduled: posts.filter((post: any) => post.status === "scheduled").length,
                published: posts.filter((post: any) => post.status === "published").length,
                connectedAccounts: accountsRes.data.filter((account: any) => account.status === "connected").length,

            })
            setActivities(activitiesData);
            }catch (error : any) {
                console.error("Error fetching dashboard data:", error);
                
            }
        };
        fetchdashboardData();
    }, []);
    const statCards =[
        {
            label: "scheduled posts",
            value: stats.scheduled,
            icon: ClockIcon,
            trend:"+2 today",

        },
        {
            label: "published posts",
            value: stats.published,
            icon: CheckCircleIcon,
            trend:"All time",
        },
        {
            label: "connected accounts",
            value: stats.connectedAccounts,
            icon: Share2Icon,
            trend:"Active",
        },
    ]
  return (
    <div className="space-y-8">
      {/* Welcome Bar */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Good morning! 👋
        </h2>
        <p className="text-slate-600 mt-1">
          Here's what's happening with your social accounts today.
        </p>
      </div>

      {/*stat cards*/}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
            <div key={card.label} className="bg-white hover:bg-red-50 relative border border-slate-200 rounded-2xl p-5 hover:border-red-200 transition-all">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl font-medium text-slate-800 tabular-nums">
                        {card.value}
                        </div>
                    <div className="text-xs absolute right-4 top-4 flex items-center gap-1 text-red-500">
                        <TrendingUpIcon className="size-3"/>
                        {card.trend}
                    </div>


                </div>
                <p className="text-sm text-slate-500 mt-1">{card.label}</p>

            </div>
        ))}

      </div>

      {/* Activity feed*/}
      <div className="bg-white rounded-2xl border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            <span className="text-2xl text-slate-400">{activities.length} events</span>

        </div>

        
        {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="size-12 flex flex-col items-center justify-center py-12 bg-slate-100 mb-3">
                    <ActivityIcon className="size-6 text-slate-400"/>
                </div>
                <p className="text-slate-500">No Activity yet</p>
                <p className="text-slate-400 text-sm mt-1">Connect accounts and schedule posts to see events here.</p>
                
            </div>
        ) : (
            <div className="divide-y divide-slate-100">
                {activities.map((activity) => (
                    <div key={activity._id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                        <div className="size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-zinc-100 text-zinc-600">
                            <SendIcon className="size-5 text-slate-400"/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">

                                <span className="text-xs px-2 py-0.5 justtify-between gap-2 mb-1">Published</span>
                                <span className="text-xs text-slate-400 shrink-0">{new Date(activity.createdAt).toLocaleString()}</span>

                            </div>
                            <p className="text-sm text-slate-600">{activity.description}</p>

                        </div>

                    </div>
                    ))}
    

            </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;