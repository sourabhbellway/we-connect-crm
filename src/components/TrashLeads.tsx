import React from "react";
import {

  FileText,
  Phone,
  Briefcase,
  Calendar,
  Undo2,
  XCircle,
} from "lucide-react";
import BackButton from "./BackButton";

const dummyLeads = [
  {
    id: 1001,
    firstName: "Diana",
    lastName: "Prince",
    email: "diana@themyscira.com",
    phone: "+1 555 2323",
    company: "Themyscira LLC",
    position: "Director",
    status: "lost",
    deletedAt: "2025-09-01 09:00",
  },
  {
    id: 1002,
    firstName: "Eric",
    lastName: "Banner",
    email: "eric@gamma.io",
    phone: "+1 555 3566",
    company: "Gamma Corp",
    position: "Manager",
    status: "closed",
    deletedAt: "2025-09-05 16:32",
  },
  {
    id: 1003,
    firstName: "Fiona",
    lastName: "Stark",
    email: "fiona@arcreactor.com",
    phone: "+1 555 9876",
    company: "Arc Reactor Ltd",
    position: "CTO",
    status: "negotiation",
    deletedAt: "2025-09-07 11:05",
  },
];

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-yellow-100 text-yellow-800",
    qualified: "bg-green-100 text-green-800",
    proposal: "bg-purple-100 text-purple-800",
    negotiation: "bg-orange-100 text-orange-800",
    closed: "bg-green-100 text-green-800",
    lost: "bg-red-100 text-red-800",
  };
  return map[status] || "bg-gray-100 text-gray-800";
};

const TrashLeads: React.FC = () => {


  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center  justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#EF444E] to-[#ff5a64] text-white shadow-md">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Leads Trash
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Restore or permanently delete leads.
            </p>
          </div>
        </div>
       
          <BackButton to="/trash" />
       
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Deleted
                </th>
                <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {dummyLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#EF444E] to-[#ff5a64] flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {lead.firstName[0]}
                          {lead.lastName[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {lead.firstName} {lead.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Phone className="h-3 w-3 mr-1" /> {lead.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {lead.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {lead.company}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <Briefcase className="h-3 w-3 mr-1" /> {lead.position}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusPill(
                        lead.status
                      )}`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" /> {lead.deletedAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button className="px-2 py-1 rounded-full bg-green-600 hover:bg-green-700 text-white text-xs inline-flex items-center">
                        <Undo2 className="h-3 w-3 mr-1" /> Restore
                      </button>
                      <button className="px-2 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs inline-flex items-center">
                        <XCircle className="h-3 w-3 mr-1" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrashLeads;
