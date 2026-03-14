'use client';

import { useState } from 'react';
import { FiUsers, FiMail, FiFolder, FiCheck, FiArchive } from 'react-icons/fi';
import toast from 'react-hot-toast';

type User = { id: string; name: string; email: string; role: string; createdAt: Date; isActive: boolean };
type Message = { id: string; name: string; email: string; subject: string; message: string; status: string; createdAt: Date };
type Project = { id: string; title: string; technologies: string[]; featured: boolean };

export default function AdminClient({
  users,
  messages,
  projects,
}: {
  users: User[];
  messages: Message[];
  projects: Project[];
}) {
  const [tab, setTab] = useState<'users' | 'messages' | 'projects'>('users');
  const [msgList, setMsgList] = useState(messages);

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'READ' }),
      });
      setMsgList((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'READ' } : m)));
    } catch {
      toast.error('Failed to update');
    }
  };

  const tabs = [
    { key: 'users', label: 'Users', icon: <FiUsers size={16} />, count: users.length },
    { key: 'messages', label: 'Messages', icon: <FiMail size={16} />, count: msgList.filter((m) => m.status === 'UNREAD').length },
    { key: 'projects', label: 'Projects', icon: <FiFolder size={16} />, count: projects.length },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#008080] to-[#0d7390] text-white py-12">
        <div className="section-container">
          <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-teal-100">Manage your portfolio content</p>
        </div>
      </section>

      <div className="section-container py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {tabs.map((t) => (
            <div key={t.key} className="bg-white rounded-xl shadow-sm p-5 text-center">
              <div className="text-3xl font-bold text-teal-DEFAULT mb-1">{t.count}</div>
              <div className="text-gray-500 text-sm">{t.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="flex border-b border-gray-100">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  tab === t.key
                    ? 'text-teal-DEFAULT border-b-2 border-teal-DEFAULT'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.icon} {t.label}
                {t.key === 'messages' && t.count > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Users Tab */}
            {tab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Role</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="py-3 font-medium text-gray-800">{u.name}</td>
                        <td className="py-3 text-gray-500">{u.email}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            u.role === 'ADMIN' ? 'bg-teal-50 text-teal-DEFAULT' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            u.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                          }`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 text-gray-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Messages Tab */}
            {tab === 'messages' && (
              <div className="space-y-4">
                {msgList.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No messages yet.</p>
                ) : (
                  msgList.map((m) => (
                    <div
                      key={m.id}
                      className={`border rounded-xl p-4 ${
                        m.status === 'UNREAD' ? 'border-teal-200 bg-teal-50/30' : 'border-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-800">{m.name}</span>
                            <span className="text-gray-400 text-sm">{m.email}</span>
                            {m.status === 'UNREAD' && (
                              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">New</span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-700 mb-1">{m.subject}</p>
                          <p className="text-sm text-gray-500">{m.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(m.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {m.status === 'UNREAD' && (
                          <button
                            onClick={() => markRead(m.id)}
                            className="text-teal-DEFAULT hover:text-teal-dark"
                            title="Mark as read"
                          >
                            <FiCheck size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Projects Tab */}
            {tab === 'projects' && (
              <div className="space-y-3">
                {projects.map((p) => (
                  <div key={p.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{p.title}</span>
                        {p.featured && (
                          <span className="text-xs bg-teal-DEFAULT text-white px-2 py-0.5 rounded-full">Featured</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.technologies.map((t) => (
                          <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
