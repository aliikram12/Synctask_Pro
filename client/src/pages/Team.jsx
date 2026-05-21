import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Crown, Shield, User } from 'lucide-react';
import toast from 'react-hot-toast';
import useWorkspaceStore from '../store/useWorkspaceStore';
import useAuthStore from '../store/useAuthStore';
import * as collaborationService from '../services/collaborationService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const roleIcon = { admin: Shield, member: User, viewer: User };

const Team = () => {
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const user = useAuthStore((s) => s.user);
  const [members, setMembers] = useState({ owner: null, members: [] });
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);

  const loadMembers = async () => {
    if (!activeWorkspace?._id) return;
    setLoading(true);
    try {
      const res = await collaborationService.fetchMembers(activeWorkspace._id);
      setMembers(res.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [activeWorkspace?._id]);

  useEffect(() => {
    const handler = (e) => setOnlineUsers(e.detail.online || []);
    window.addEventListener('presence', handler);
    return () => window.removeEventListener('presence', handler);
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      await collaborationService.inviteMember(activeWorkspace._id, inviteEmail.trim());
      toast.success('Invitation sent!');
      setInviteEmail('');
      loadMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invite failed');
    }
  };

  const isOwner = members.owner?._id === user?._id;

  if (!activeWorkspace) {
    return (
      <div className="glass rounded-xl p-12 text-center text-surface-500">
        Select a workspace to manage your team.
      </div>
    );
  }

  const allMembers = [
    { ...(members.owner || {}), role: 'owner' },
    ...members.members.map((m) => ({ ...m.userId, role: m.role })),
  ].filter((m) => m._id);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Team</h1>
        <p className="text-surface-500 text-sm mt-1">
          {activeWorkspace.name} — {allMembers.length} members
          {onlineUsers.length > 0 && ` · ${onlineUsers.length} online`}
        </p>
      </div>

      {onlineUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {onlineUsers.map((u) => (
            <span
              key={u.userId}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-accent-500/10 text-accent-600 border border-accent-500/20"
            >
              <span className="h-2 w-2 rounded-full bg-accent-500 animate-pulse" />
              {u.userName}
            </span>
          ))}
        </div>
      )}

      {(isOwner || members.members.some((m) => m.userId?._id === user?._id && m.role === 'admin')) && (
        <form onSubmit={handleInvite} className="glass rounded-xl p-4 flex flex-col sm:flex-row gap-3">
          <Input
            label="Invite by email"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
            className="flex-1"
          />
          <div className="flex items-end">
            <Button type="submit">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {allMembers.map((member, i) => {
            const Icon = member.role === 'owner' ? Crown : roleIcon[member.role] || User;
            const isOnline = onlineUsers.some((u) => u.userId === member._id);
            return (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-4 flex items-center gap-4"
              >
                <div className="relative">
                  <div className="h-12 w-12 rounded-full gradient-bg flex items-center justify-center text-white font-bold">
                    {member.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-accent-500 rounded-full border-2 border-white dark:border-surface-900" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-surface-900 dark:text-white">{member.name}</p>
                  <p className="text-sm text-surface-500 truncate">{member.email}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 capitalize">
                  <Icon className="h-3.5 w-3.5" />
                  {member.role}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Team;
