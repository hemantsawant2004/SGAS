import { useDeleteGuide, useGuides, useReactivateGuide } from "../hooks/useGuides";
import { useState } from "react";
import { useAppSelector } from "../../../../app/hooks";

function GuidesPage() {
  const { data: guides = [], isLoading, isError } = useGuides();
  const [search, setSearch] = useState("");
  const user = useAppSelector((s) => s.auth.user);

  const { mutate: deactivateMutate } = useDeleteGuide();
  const { mutate: reactivateMutate } = useReactivateGuide();

  const isAdmin = user?.role === "admin"; 
 
const activeGuidesCount = guides.filter((g: any) => g.isActive === true).length;
const InactiveGuidesCount = guides.filter((g: any) => g.isActive === false).length;

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-medium text-gray-600 animate-pulse">
          Loading guides...
        </p>
      </div>
    );

  if (isError)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-medium text-red-500">
          Error fetching guides
        </p>
      </div>
    );

  const filteredGuides = guides.filter((guide: any) =>
    guide.fullname.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
        <h4 className="text-4xl font-bold text-gray-800 dark:text-white font-mono">
          Welcome, {user?.username}
        </h4>

        <input
          type="text"
          placeholder="Search guide..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 md:mt-0 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full md:w-64 dark:bg-slate-800"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 ">
        <div className="bg-white p-6 rounded-2xl shadow-sm border dark:bg-slate-800">
          <p className="text-gray-500 text-sm dark:text-white">Total Guides</p>
          <h2 className="text-2xl font-bold text-indigo-600 mt-2 dark:text-white">
            {guides.length}
          </h2>
        </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border dark:bg-slate-800">
          <p className="text-gray-500 text-sm dark:text-white">Active Guides</p>
          <h2 className="text-2xl font-bold text-indigo-600 mt-2 dark:text-white">
            {activeGuidesCount}
          </h2>
        </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border dark:bg-slate-800">
          <p className="text-gray-500 text-sm dark:text-white">InActive Guides</p>
          <h2 className="text-2xl font-bold text-indigo-600 mt-2 dark:text-white">
            {InactiveGuidesCount}
          </h2>
        </div>
      </div>
  

      {/* Guides Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 ">
        {filteredGuides.map((guide: any) => (
          <div
            key={guide.id}
            className="bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 p-6 border border-gray-100 dark:bg-slate-800 dark:text-white"
          >
            {/* Top Section */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white shadow-md">
                {guide.fullname?.charAt(0).toUpperCase()}
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {guide.fullname}
                </h2>

                <div className="flex items-center gap-2 mt-1 dark:text-white">
                  <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full">
                    {guide.departmentName}
                  </span>

                  {/* Active / Inactive Badge */}
                  {guide.isActive ? (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">
                      Inactive
                    </span>
                    
                  )}
                  <span className="text-xs text-gray-500 dark:text-black px-2 py-1 bg-green-100 text-green-600 rounded-full">
                  limit = {guide.maxProjects} 
                  </span>
                </div>
              </div>
            </div>

            {/* Expertise */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-600 mb-2 dark:text-white">
                Expertise
              </p>

              <div className="flex flex-wrap gap-2">
                {(Array.isArray(guide.expertise)
                  ? guide.expertise
                  : typeof guide.expertise === "string"
                  ? guide.expertise.split(",")
                  : []
                ).map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-indigo-100 hover:text-indigo-600 transition"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <span className="text-sm text-gray-500 dark:text-white">
                {guide.experience} years experience
              </span>
              {/* Admin Controls */}
              {isAdmin && (
                guide.isActive ? (
                  <button
                    onClick={() => deactivateMutate(guide.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => reactivateMutate(guide.id)}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    Activate
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default GuidesPage;